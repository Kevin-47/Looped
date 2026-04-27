"use client";

import { HydrateClient, getQueryClient } from "@/lib/query/hydration";
import { ChannelList } from "./ChannelList";

export function ChannelListWrapper() {
  const queryClient = getQueryClient();

  return (
    <HydrateClient client={queryClient}>
      <ChannelList />
    </HydrateClient>
  );
}
