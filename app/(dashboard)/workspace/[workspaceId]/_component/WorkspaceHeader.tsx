'use client'

import { orpc } from "@/lib/orpc"
import { useSuspenseQuery } from "@tanstack/react-query"


export function WorkspaceHeader(){
    const {
data:{currentWorkspace}
    } = useSuspenseQuery(orpc.channel.list.queryOptions())
    return(
        <h2 className="text-lg">
           {currentWorkspace.orgName}
        </h2>
    )
}