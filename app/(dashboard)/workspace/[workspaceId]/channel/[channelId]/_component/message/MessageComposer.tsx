"use client";
"use no memo";
"use no store";
"use no static";

import dynamic from "next/dynamic";
import { ImageUploadModal } from "@/components/rich-text-editor/ImageUploadModal";
import { Button } from "@/components/ui/button";
import { UseAttachmentUpload } from "@/hooks/use-attachment-upload";
import { ImageIcon, SendIcon } from "lucide-react";
import { AttachmentChip } from "./AttachmentChip";

const RichTextEditor = dynamic(
  () =>
    import("@/components/rich-text-editor/Editor").then(
      (mod) => mod.RichTextEditor
    ),
  { ssr: false }
);

interface MessageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  upload: UseAttachmentUpload;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  upload
}: MessageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <SendIcon className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          upload.stagedUrl ? (
            <AttachmentChip url={upload.stagedUrl} onRemove={upload.clear} />
          ) : (
            <Button
              onClick={() => upload.setOpen(true)}
              type="button"
              size="sm"
              variant="outline"
            >
              <ImageIcon className="size-4 mr-1" />
              Attach
            </Button>
          )
        }
      />

      <ImageUploadModal
        open={upload.isOpen}
        onOpenChange={(o) => upload.setOpen(o)}
        onUploaded={(url) => upload.onUploaded(url)}
      />
    </>
  );
}
