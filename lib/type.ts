import { GroupedReactionsSchemaType } from "@/app/schemas/message";
import { Message } from "./generated/prisma";

export type MessageListItem= Message &{
    replyCount: number;
    reactions: GroupedReactionsSchemaType[]

}

