import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Code, Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/tools/CopyButton";
import { convertMarkdown, sanitizeHtml } from "@/utils/markdown";

const defaultMarkdown = `# Welcome to Markdown Editor

## Features

- **Bold** and *italic* text
- Lists (ordered and unordered)
- [Links](https://example.com)
- \`Inline code\` and code blocks

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Blockquote

> This is a blockquote
> with multiple lines

---

**Start typing to see the preview!**
`;

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [view, setView] = useState<"split" | "preview" | "source">("split");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const deferredMarkdown = useDeferredValue(markdown);
  const html = useMemo(() => sanitizeHtml(convertMarkdown(deferredMarkdown)), [deferredMarkdown]);

  useEffect(() => {
    if (!previewExpanded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewExpanded]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Markdown Editor</CardTitle>
          <CardDescription>Write markdown and see live HTML preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={view === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("split")}
            >
              <Code className="h-4 w-4 mr-1" />
              Split
            </Button>
            <Button
              variant={view === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("preview")}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview Only
            </Button>
            <Button
              variant={view === "source" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("source")}
            >
              <Code className="h-4 w-4 mr-1" />
              Source Only
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(view === "split" || view === "source") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Markdown</label>
                  <CopyButton value={markdown} label="Copy Markdown" />
                </div>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="min-h-[500px] font-mono text-sm resize-none"
                  placeholder="Write your markdown here..."
                />
              </div>
            )}

            {(view === "split" || view === "preview") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">HTML Preview</label>
                  <div className="flex items-center gap-1">
                    <CopyButton value={html.replace(/<br>/g, "\n")} label="Copy HTML" />
                    <button
                      type="button"
                      className="toolbar-text-button"
                      aria-label="Expand preview"
                      title="Expand preview"
                      onClick={() => setPreviewExpanded(true)}
                    >
                      <Maximize2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div
                  className="min-h-[500px] max-h-[500px] overflow-y-auto rounded-md border border-border bg-background p-4 text-foreground prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {previewExpanded &&
        createPortal(
          <div className="markdown-preview-full" role="dialog" aria-modal="true" aria-label="HTML preview, expanded">
            <div className="editor-toolbar">
              <span className="text-sm font-medium">HTML Preview</span>
              <div className="toolbar-actions">
                <CopyButton value={html.replace(/<br>/g, "\n")} label="Copy HTML" />
                <button
                  type="button"
                  className="toolbar-text-button"
                  aria-label="Close preview"
                  title="Close preview"
                  onClick={() => setPreviewExpanded(false)}
                  autoFocus
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div
              className="markdown-preview-expanded-content prose prose-neutral max-w-none text-foreground dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>,
          document.querySelector(".workspace-content") ?? document.body,
        )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Markdown Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <code className="text-xs"># Heading</code>
              <p className="text-muted-foreground text-xs">H1 Heading</p>
            </div>
            <div>
              <code className="text-xs">**bold**</code>
              <p className="text-muted-foreground text-xs">Bold text</p>
            </div>
            <div>
              <code className="text-xs">*italic*</code>
              <p className="text-muted-foreground text-xs">Italic text</p>
            </div>
            <div>
              <code className="text-xs">[text](url)</code>
              <p className="text-muted-foreground text-xs">Link</p>
            </div>
            <div>
              <code className="text-xs">\`code\`</code>
              <p className="text-muted-foreground text-xs">Inline code</p>
            </div>
            <div>
              <code className="text-xs">- item</code>
              <p className="text-muted-foreground text-xs">List item</p>
            </div>
            <div>
              <code className="text-xs">&gt; quote</code>
              <p className="text-muted-foreground text-xs">Blockquote</p>
            </div>
            <div>
              <code className="text-xs">---hr---</code>
              <p className="text-muted-foreground text-xs">Horizontal rule</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
