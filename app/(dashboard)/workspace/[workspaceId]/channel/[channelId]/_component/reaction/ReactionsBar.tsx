  import {
    InfiniteData,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  import { EmojiReaction } from "./EmojiReaction";
  import { orpc } from "@/lib/orpc";

  import { toast } from "sonner";
  import { GroupedReactionsSchemaType } from "@/app/schemas/message";
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  import { useParams } from "next/navigation";
  import { MessageListItem } from "@/lib/type";
  import { useChannelRealtime } from "@/providers/ChannelRealtimeProvider";
  import { useOptionalRealtime } from "@/providers/ThreadRealtimeProvider";

  type ThreadContext = { type: "thread"; threadId: string };
  type ListContext = { type: "list"; channelId: string };

  interface ReactionBarProps {
    messageId: string;
    reactions: GroupedReactionsSchemaType[] | undefined; // <-- allow undefined
    context?: ThreadContext | ListContext;
  }

  type MessagePage = {
    items: MessageListItem[];
    nextCursor?: string;
  };

  type InfiniteReplies = InfiniteData<MessagePage>;

  export function ReactionBar({
    messageId,
    reactions,
    context,
  }: ReactionBarProps) {
    const safeReactions = reactions ?? []; // <-- always ensure array

    const { channelId } = useParams<{ channelId: string }>();
    const queryClient = useQueryClient();
    const {send} = useChannelRealtime()
  const threadRealtime = useOptionalRealtime()


    const toggleMutations = useMutation(
      orpc.message.reaction.toggle.mutationOptions({
        onMutate: async (vars: { messageId: string; emoji: string }) => {

          // ------------------------------
          // SAFE VERSION OF bump()
          // ------------------------------
          const bump = (reactions: GroupedReactionsSchemaType[] = []) => {
            const found = reactions.find((r) => r.emoji === vars.emoji);

            if (found) {
              const dec = found.count - 1;

              return dec <= 0
                ? reactions.filter((r) => r.emoji !== found.emoji)
                : reactions.map((r) =>
                    r.emoji === found.emoji
                      ? { ...r, count: dec, reactedByMe: false }
                      : r
                  );
            }

            return [
              ...reactions,
              { emoji: vars.emoji, count: 1, reactedByMe: true },
            ];
          };

          const isThread = context && context.type === "thread";

          // ------------------------------
          // THREAD CONTEXT
          // ------------------------------
          if (isThread) {
            const listOptions = orpc.message.thread.list.queryOptions({
              input: { messageId: context.threadId },
            });

            await queryClient.cancelQueries({ queryKey: listOptions.queryKey });

            const prevThread = queryClient.getQueryData(listOptions.queryKey);

            queryClient.setQueryData(listOptions.queryKey, (old) => {
              if (!old) return old;

              // parent message
              if (vars.messageId === context.threadId) {
                return {
                  ...old,
                  parent: {
                    ...old.parent,
                    reactions: bump(old.parent.reactions),
                  },
                };
              }

              // thread replies
              return {
                ...old,
                messages: old.messages.map((m) =>
                  m.id === vars.messageId
                    ? { ...m, reactions: bump(m.reactions) }
                    : m
                ),
              };
            });

            return {
              prevThread,
              threadQueryKey: listOptions.queryKey,
            };
          }

          // ------------------------------
          // LIST CONTEXT
          // ------------------------------
          const listKey = ["message.list", channelId];
          await queryClient.cancelQueries({ queryKey: listKey });

          const previous = queryClient.getQueryData(listKey);

          queryClient.setQueryData<InfiniteReplies>(listKey, (old) => {
            if (!old) return old;

            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === messageId
                  ? { ...m, reactions: bump(m.reactions) }
                  : m
              ),
            }));

            return { ...old, pages };
          });

          return { previous, listKey };
        },

        onSuccess: (data) => {
          
          send({
            type: 'reaction:updated',
            payload:data
          })

          if(context && context.type === 'thread' && threadRealtime){
            const threadId =  context.threadId

            threadRealtime.send({
              type: 'thread:reaction:updated',
              payload:{...data, threadId}
            })
          }

          toast.success("Emoji added!")},

        onError: (_err, _vars, ctx) => {
          // rollback on error
          if (ctx?.threadQueryKey && ctx.prevThread) {
            queryClient.setQueryData(ctx.threadQueryKey, ctx.prevThread);
          }

          if (ctx?.previous && ctx.listKey) {
            queryClient.setQueryData(ctx.listKey, ctx.previous);
          }

          toast.error("Something went wrong");
        },
      })
    );

    const handleTogele = (emoji: string) => {
      toggleMutations.mutate({ emoji, messageId });
    };

    return (
      <div className="mt-1 flex-center gap-1">
        {safeReactions.map((r) => (
          <Button
            key={r.emoji}
            type="button"
            variant="secondary"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs rounded-full",
              r.reactedByMe && "bg-primary/10 border border-primary"
            )}
            onClick={() => handleTogele(r.emoji)}
          >
            <span>{r.emoji}</span>
            
            <span>{r.count}</span>
          </Button>
        ))}
        <EmojiReaction onSelect={handleTogele} />
      </div>
    );
  }
