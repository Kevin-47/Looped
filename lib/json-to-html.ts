import { baseExtension } from "@/components/rich-text-editor/extension"
import { generateHTML, type JSONContent } from "@tiptap/react"


function safeParseJSON(str: string): JSONContent | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function convertJsonToHtml(jsonContent: JSONContent | string): string {
  const content =
    typeof jsonContent === "string" ? safeParseJSON(jsonContent) : jsonContent;

  if (!content) {
    console.error("Invalid JSONContent provided");
    return "";
  }

  return generateHTML(content, baseExtension);
}
    