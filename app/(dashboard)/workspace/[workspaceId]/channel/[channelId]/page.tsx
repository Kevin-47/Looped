"use client";

import { useParams } from "next/navigation";
import { ChannelHeader } from "./_component/ChannelHeader";
import { MessageInputForm } from "./_component/message/MessageInputForm";
import { MessageList } from "./_component/MessageList";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadSidebar } from "./_component/thread/ThreadSidebar";
import { ThreadProvider, useThread } from "@/providers/ThreadProvider";
import { ChannelRealtimeProvider } from "@/providers/ChannelRealtimeProvider";

export const ChannelPageMain = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const {isThreadOpen} = useThread()
  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId: channelId,
      },
    })
  );

  if (error) {
    return <p>Error</p>;
  }
  return (
<ChannelRealtimeProvider channelId={channelId}>
      <div className="flex h-screen w-full">
      {/* Main channel area*/}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Header */}
        {isLoading ? (
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ) : (
          <ChannelHeader channelName={data?.channelName} />
        )}

        {/* Scrollabel Message Area */}
        <div className="flex-1 overflow-hidden mb-4">
          <MessageList />
        </div>

        {/* Fixed Input */}
        <div className="border-t bg-background p-4">
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
          />
        </div>
      </div>
    {isThreadOpen && (
        <ThreadSidebar user={data?.currentUser as KindeUser<Record<string, unknown>>}/>
    )}

    </div>
</ChannelRealtimeProvider>
  );
};



const ThisIstheChannelPage =() =>{
    return <ThreadProvider >
<ChannelPageMain/>
    </ThreadProvider>
}


export default ThisIstheChannelPage