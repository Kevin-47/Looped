import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";
import { Response } from "@/components/ai-elements/response";

interface ComposeAssistantProps {
  content: string;
  onAccept?: (markdown: string) => void;
}

export function ComposeAssistant({ content, onAccept }: ComposeAssistantProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(content);

  // Keep ref updated without re-rendering chat
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: "compose-assistant",
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.compose.generate(
            { content: contentRef.current },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  // Latest assistant message
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const composedText =
    lastAssistant?.parts
      ?.filter((p) => p.type === "text")
      ?.map((p) => p.text)
      ?.join("\n\n") ?? "";

  // Reset all chat state
  function resetChat() {
    stop();
    clearError();
    setMessages([]);
  }

  // Handle Popover open/close
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");

      // Only generate the FIRST time
      if (status === "ready" && !hasAssistantMessage) {
        sendMessage({ text: "Rewrite" });
      }
    } else {
      resetChat();
    }
  }

  // Retry generation after error
  function handleRetry() {
    clearError();
    setMessages([]);
    sendMessage({ text: "Rewrite" });
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="relative rounded-full overflow-hidden bg-linear-to-t from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg focus-visible:ring-ring"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">Compose</span>
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[25rem] p-0">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex items-center justify-center rounded-full bg-linear-to-t from-violet-600 to-fuchsia-600 py-1.5 px-4 gap-1.5">
                <Sparkles className="size-3.5 text-white" />
                <span className="text-sm font-medium">
                  Compose Assistant (preview)
                </span>
              </span>
            </div>

            {status === "streaming" && (
              <Button onClick={stop} type="button" size="sm" variant="outline">
                Stop
              </Button>
            )}
          </div>

          {/* Body */}
          <div className="px-4 py-3 max-h-80 overflow-y-auto">
            {error ? (
              <div>
                <p className="text-red-500 text-sm mb-2">{error.message}</p>
                <Button type="button" size="sm" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            ) : composedText ? (
              <Response content={composedText} />
            ) : status === "submitted" || status === "streaming" ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Click Compose to Generate
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t px-3 py-2 bg-muted/30">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                resetChat();
                setOpen(false);
              }}
            >
              Decline
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!composedText) return;
                onAccept?.(composedText);
                stop();
                clearError();
                setOpen(false);
              }}
              disabled={!composedText}
            >
              Accept
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
