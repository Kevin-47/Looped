/* eslint-disable @typescript-eslint/no-explicit-any */

import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { getAvatar } from "@/lib/get-avatar";
import Image from "next/image";
import { MessageHoverToolbar } from "../toolbar";
import { EditMessage } from "../toolbar/EditMessage";
import { useCallback, useState } from "react";
import { MessageListItem } from "@/lib/type";
import {  MessagesSquareIcon } from "lucide-react";
import { useThread } from "@/providers/ThreadProvider";
import { orpc } from "@/lib/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { ReactionBar } from "../reaction/ReactionsBar";


interface MessageItemProps {
  message: MessageListItem;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    openThread
  } = useThread()

  const queryClient = useQueryClient()

  const prefetchThread = useCallback(() =>{
    const options = orpc.message.thread.list.queryOptions({
      input:{
        messageId: message.id
      }
    })

    queryClient.prefetchQuery({...options, staleTime: 60_000}).catch(() =>{
    })

  },[message.id, queryClient])

  function safeParseJSON(input: any) {
    try {
      if (typeof input !== "string") return input;
      if (!input.trim()) return null;
      return JSON.parse(input);
    } catch {
      return null;
    }
  }

  const parsedContent = safeParseJSON(message.content);

  const canEdit = message.authorId === currentUserId;

  return (
    <div className="relative flex space-x-3 p-3 rounded-lg group hover:bg-muted/50">
      
      {/* Avatar */}
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="User Avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />

      {/* Content Side */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>

          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>

        {/* Editing Mode */}
        {isEditing ? (
          <EditMessage
            message={message}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <>
            <SafeContent
              content={parsedContent}
              className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
            />

            {message.imageUrl && (
              <Image
                src={message.imageUrl}
                alt="Message Attachment"
                width={512}
                height={512}
                className="rounded-md max-h-[320px] w-auto object-contain"
              />
            )}
          </>
        )}

        {/* reaction */}
        <ReactionBar messageId={message.id} reactions={message.reactions} context={{type:'list', channelId: message.channelId!}}/>
        {message.replyCount > 0 && (
          <button type="button" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border cursor-pointer"
          onClick={() => openThread(message.id)}
          onMouseEnter={prefetchThread}
          onFocus={prefetchThread}
          >
            <MessagesSquareIcon className="size-3"/>
            <span>{message.replyCount}{" "}
                {message.replyCount === 1 ? "reply": 'replies'}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              View Thread
            </span>
          </button>
        )}
      </div>

      {/* Hover Toolbar */}
      <MessageHoverToolbar
        messageId={message.id}
        canEdit={canEdit}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
