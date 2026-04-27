"use client";

import { createMessageSchema, CreateMessageSchemaType } from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageComposer } from "./MessageComposer";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { useChannelRealtime } from "@/providers/ChannelRealtimeProvider";

interface iAppProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessageProps = {
  items: Message[];
  nextCursor?: string | null;
};

type InfiniteMessages = InfiniteData<MessageProps>;

export function MessageInputForm({ channelId, user }: iAppProps) {
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);
  const upload = useAttachmentUpload();
  const { send } = useChannelRealtime();

  const form = useForm<CreateMessageSchemaType>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId,
      content: "",
      threadId: undefined, // ensure safe default
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (values) => {
        await queryClient.cancelQueries({ queryKey: ["message.list", channelId] });

        const previousData = queryClient.getQueryData<InfiniteMessages>(["message.list", channelId]);

        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessage: Message = {
          id: tempId,
          content: values.content,
          imageUrl: values.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id ?? "",
          authorEmail: user.email ?? "",
          authorName: user.given_name ?? "Unknown User",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId,
          threadId: values.threadId ?? null, // prevent crashing
        };

        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) {
              return {
                pages: [{ items: [optimisticMessage], nextCursor: null }],
                pageParams: [null],
              };
            }

            const firstPage = old.pages[0];
            const updatedFirstPage = {
              ...firstPage,
              items: [optimisticMessage, ...firstPage.items],
            };

            return { ...old, pages: [updatedFirstPage, ...old.pages.slice(1)] };
          }
        );

        return { previousData, tempId };
      },

      onSuccess: (createdMessage, _vars, ctx) => {
        queryClient.setQueryData<InfiniteMessages>(["message.list", channelId], (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) =>
                msg.id === ctx?.tempId ? createdMessage : msg
              ),
            })),
          };
        });

        // reset editor
        form.reset({ channelId, content: "", threadId: undefined });
        upload.clear();
        setEditorKey((k) => k + 1);

        // realtime event
        send({
          type: "message:created",
          payload: { message: createdMessage },
        });

        toast.success("Message sent!");
      },

      onError: (_err, _vars, ctx) => {
        if (ctx?.previousData) {
          queryClient.setQueryData(["message.list", channelId], ctx.previousData);
        }
        toast.error("Failed to send message");
      },
    })
  );

  const onSubmit = (values: CreateMessageSchemaType) => {
    createMessageMutation.mutate({
      ...values,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                  upload={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
