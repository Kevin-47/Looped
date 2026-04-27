import { Button } from "@/components/ui/button"
import { useThread } from "@/providers/ThreadProvider";
import {  MessageSquareTextIcon, Pencil } from "lucide-react"



interface toolbarProps{
    messageId: string;
    canEdit: boolean
    onEdit :() => void
}

export function MessageHoverToolbar({
  canEdit,
  onEdit,
  messageId,
}: toolbarProps) {
  const { toggleThread } = useThread();

  return (
    <div
      className="
        absolute -right-2 -top-3 
        flex items-center gap-1 
        rounded-md border border-gray-200 
        bg-white/95 px-1.5 py-1 shadow-sm
        backdrop-blur
        opacity-0 transition-opacity 
        group-hover:opacity-100 
        dark:border-neutral-800/90
        dark:bg-neutral-900
      "
    >
      {canEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleThread(messageId)}
      >
        <MessageSquareTextIcon className="size-4" />
      </Button>
    </div>
  );
}
