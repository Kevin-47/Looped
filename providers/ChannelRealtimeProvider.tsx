import { createContext, ReactNode, useContext, useMemo } from "react";
import usePartySocket from "partysocket/react";
import {
  ChannelEvent,
  ChannelEventSchema,
  RealtimeMessage,
} from "@/app/schemas/realtime";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

interface ChannelRealtimeProviderProps {
  channelId: string;
  children: ReactNode;
}

type MessageListPage = {
  items: RealtimeMessage[];
  nextCursor?: string;
};

type ChannelReactimeContextValue = {
  send: (event: ChannelEvent) => void;
};

type InfiniteMessages = InfiniteData<MessageListPage>;

const channelRealtimeContext =
  createContext<ChannelReactimeContextValue | null>(null);

export function ChannelRealtimeProvider({
  channelId,
  children,
}: ChannelRealtimeProviderProps) {
  const queryClient = useQueryClient();

  const socket = usePartySocket({
    host: "https://teamflow-chat-realtime.sankarwebdev.workers.dev",
    room: `channel-${channelId}`,
    party: "chat",
    onMessage(e) {
      try {
        const parsed = JSON.parse(e.data);
        const result = ChannelEventSchema.safeParse(parsed);

        if (!result.success) {
          console.log("Invalid channel Event");
          return;
        }

        const evt = result.data;

        if (evt.type === "message:created") {
          const raw = evt.payload.message;

          queryClient.setQueryData<InfiniteMessages>(
            ["message.list", channelId],
            (old) => {
              if (!old) {
                return {
                  pages: [{ items: [raw], nextCursor: undefined }],
                  pageParams: [undefined],
                };
              }
              const first = old.pages[0];
              const updatedFirst: MessageListPage = {
                ...first,
                items: [raw, ...first.items],
              };
              return { ...old, pages: [updatedFirst, ...old.pages.slice(1)] };
            }
          );

          return;
        }

        if(evt.type === 'message:updated'){
            const updated = evt.payload.message

            //Replace the message in the innfinite query
            queryClient.setQueryData<InfiniteMessages>(
                ["message.list", channelId],
                (old)=>{
                    if(!old) return  old;


                    const pages = old.pages.map((p) => ({
                        ...p,
                        items: p.items.map((m) => m.id === updated.id ? {
                            ...m, ...updated
                        }: m)
                    }))

                    return {...old, pages};

                }
            );
            
            return;
        }
    

        if(evt.type === 'reaction:updated'){
          const {messageId, reactions} = evt.payload

          queryClient.setQueryData<InfiniteMessages>(
            ['message.list', channelId],
            (old) =>{
              if(!old) return old;

              const pages = old.pages.map((p) =>({
                ...p,
                items: p.items.map((m) => m.id === messageId ? {...m, reactions}:m)
              }) )

              return {...old, pages}
            }
          )
          return;
        }

if (evt.type === "message:replies:incremented") {
  const { messageId, delta } = evt.payload;

  queryClient.setQueryData<InfiniteMessages>(
    ["message.list", channelId],
    (old) => {
      if (!old) return old;

      const pages = old.pages.map((p) => ({
        ...p,
        items: p.items.map((m) =>
          m.id === messageId
            ? {
                ...m,
                replyCount:
                  Math.max(0, Number(m.replyCount ?? 0) + Number(delta)),
              }
            : m
        ),
      }));

      return { ...old, pages };
    }
  );

  return;
}


      } catch {
        console.error("something went to wrong");
      }
    },
  });

  const value = useMemo<ChannelReactimeContextValue>(() => {
    return {
      send: (event) => {
        socket.send(JSON.stringify(event));
      },
    };
  }, [socket]);

return (
    <channelRealtimeContext.Provider value={value}>
      {children}
    </channelRealtimeContext.Provider>
  );
}

export function useChannelRealtime(): ChannelReactimeContextValue {
  const ctx = useContext(channelRealtimeContext);

  if (!ctx) {
    throw new Error(
      "useChannelRealtime must be used within  a ChannelRealtimeProvider"
    );
  }

  return ctx;
}
