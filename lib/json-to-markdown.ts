import { baseExtension } from '@/components/rich-text-editor/extension';
import {renderToMarkdown} from '@tiptap/static-renderer'


function normalizeWhiteSpace(markdown: string) {
  return markdown
    .replace(/[ \t]+$/gm, "")      // trim trailing spaces per line
    .replace(/\n{3,}/g, "\n\n")    // collapse >2 blank lines
    .trim();                       // trim start and end
}




export async function tiptapJsonToMarkdown(json: string){
    // parse json
    let content;
    try{
        content= JSON.parse(json)
    } catch{
        return "";
    }


    const markdown = renderToMarkdown({
        extensions: baseExtension,
        content: content,
    })


    return normalizeWhiteSpace(markdown)
}