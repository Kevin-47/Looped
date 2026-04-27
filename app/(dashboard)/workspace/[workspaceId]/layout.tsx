export const runtime = "nodejs";

import { ReactNode } from "react";
import { WorkspaceHeaderWrapper } from "./_component/WorkspaceHeaderWrapper";
import { ChannelListWrapper } from "./_component/ChannelListWrapper";
import { WorkspaceMembersListWrapper } from "./_component/WorkspaceMembersListWrapper";
import { CreateNewChannel } from "./_component/createNewChannel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { orpc } from "@/lib/orpc";
import { getQueryClient } from "@/lib/query/hydration";

interface Props {
  children: ReactNode;
}

const ChannelListLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();

  // Safe prefetch: wrap in try/catch to avoid hydration crash
  try {
    await queryClient.prefetchQuery(orpc.channel.list.queryOptions());
  } catch (err) {
    console.error("Failed to prefetch channels:", err);
  }

  return (
    <>
      <div className="flex h-full w-80 flex-col bg-secondary border-r border-border">
        {/* header */}
        <div className="flex items-center px-4 h-14 border-b border-border">
          <WorkspaceHeaderWrapper />
        </div>

        <div className="px-4 py-2">
          <CreateNewChannel />
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-4">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1 font-medium text-muted-foreground [&[data-state=open]>svg]:rotate-180">
              Main
              <ChevronDownIcon className="size-4 transition-transform duration-200" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              {/* ChannelListWrapper should fetch data safely client-side */}
              <ChannelListWrapper />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Member List */}
        <div className="px-4 py-2 border-t border-border">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1 font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180">
              Members
              <ChevronDownIcon className="size-4 transition-transform duration-200" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <WorkspaceMembersListWrapper />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {children}
    </>
  );
};

export default ChannelListLayout;
