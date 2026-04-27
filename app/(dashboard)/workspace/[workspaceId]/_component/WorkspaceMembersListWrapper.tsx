"use client";

import { HydrateClient, getQueryClient } from "@/lib/query/hydration";
import { WorkspaceMembersList } from "./workspaceMembersList";

export function WorkspaceMembersListWrapper() {
  const queryClient = getQueryClient();

  return (
    <HydrateClient client={queryClient}>
      <WorkspaceMembersList />
    </HydrateClient>
  );
}
