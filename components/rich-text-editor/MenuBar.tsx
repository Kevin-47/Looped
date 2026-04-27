"use client"


import { Editor, useEditorState } from "@tiptap/react";
import {
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {
  Bold,
  Code,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  Redo,
  StrikethroughIcon,
  Undo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ComposeAssistant } from "./ComposeAssisten";
import { markdownToJSON } from "@/lib/markdown-to-json";

interface MenuBarProps {
  editor: Editor | null;
}

export function MenuBar({ editor }: MenuBarProps) {
     
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return {
          isBold: false,
          isitalic: false,
          isStrike: false,
          isCodeBlock: false,
          isBulletList: false,
          isOrderedList: false,
          canUndo: false,
          canRedo: false,
          currentContent: null
        };
      }

      return {
        isBold: editor.isActive("bold"),
        isitalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isCodeBlock: editor.isActive("codeBlock"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        currentContent: editor.getJSON(),
      };
    },
  });
if (!editor) return null

  const handleAcceptCompose = (markdown: string) => {
    try {
      const json = markdownToJSON(markdown);
      editor.commands.setContent(json);
    } catch {}
  };

return (
  <div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 bg-card flex flex-wrap gap-1 items-center">
    <TooltipProvider>

      {/* TEXT STYLES */}
      <div className="flex flex-wrap gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isBold}
              onPressedChange={() =>
                editor.chain().focus().toggleBold().run()
              }
              className={cn(
                editorState?.isBold && "bg-muted text-muted-foreground"
              )}
            >
              <Bold />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isitalic}
              onPressedChange={() =>
                editor.chain().focus().toggleItalic().run()
              }
              className={cn(
                editorState?.isitalic && "bg-muted text-muted-foreground"
              )}
            >
              <ItalicIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isStrike}
              onPressedChange={() =>
                editor.chain().focus().toggleStrike().run()
              }
              className={cn(
                editorState?.isStrike && "bg-muted text-muted-foreground"
              )}
            >
              <StrikethroughIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Strike</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isCodeBlock}
              onPressedChange={() =>
                editor.chain().focus().toggleCodeBlock().run()
              }
              className={cn(
                editorState?.isCodeBlock && "bg-muted text-muted-foreground"
              )}
            >
              <Code />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Code Block</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border mx-2"></div>

      {/* LISTS */}
      <div className="flex flex-wrap gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isBulletList}
              onPressedChange={() =>
                editor.chain().focus().toggleBulletList().run()
              }
              className={cn(
                editorState?.isBulletList &&
                  "bg-muted text-muted-foreground"
              )}
            >
              <ListIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editorState?.isOrderedList}
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
              className={cn(
                editorState?.isOrderedList &&
                  "bg-muted text-muted-foreground"
              )}
            >
              <ListOrderedIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Ordered List</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border mx-2"></div>

      {/* UNDO / REDO */}
      <div className="flex flex-wrap gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editorState?.canUndo}
            >
              <Undo />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editorState?.canRedo}
            >
              <Redo />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border mx-2"></div>

      {/* AI ASSISTANT */}
      <div className="flex flex-wrap gap-1">
        <ComposeAssistant
          content={JSON.stringify(editorState?.currentContent)}
          onAccept={handleAcceptCompose}
        />
      </div>

    </TooltipProvider>
  </div>
);

}
