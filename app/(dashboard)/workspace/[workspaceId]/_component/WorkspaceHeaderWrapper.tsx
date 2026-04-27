"use client";

import { HydrateClient } from "@/lib/query/hydration";
import { getQueryClient } from "@/lib/query/hydration";
import { WorkspaceHeader } from "./WorkspaceHeader";

export function WorkspaceHeaderWrapper() {
  const queryClient = getQueryClient();

  return (
    <HydrateClient client={queryClient}>
      <WorkspaceHeader />
    </HydrateClient>
  );
}
