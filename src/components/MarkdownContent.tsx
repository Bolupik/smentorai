import { useMemo } from "react";

/**
 * Minimal, dependency-free markdown renderer.
 * Supports: headings, bold, italic, inline code, code blocks, links,
 * images, unordered/ordered lists, blockquotes and horizontal rules.
 * All HTML is escaped first, so user content can never inject markup.
 */

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const safeUrl = (url: string) => {
  const u = url.trim();
  return /^(https?:\/\/|\/)/i.test(u) ? u : "#";
};

function inline(src: string) {
  let s = escapeHtml(src);

  // images ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) =>
    `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" class="my-2 rounded-lg border border-border/60 max-h-80 w-auto object-contain" />`);

  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) =>
    `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:opacity-80 break-words">${text}</a>`);

  // bare urls
  s = s.replace(/(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g, (_m, pre, url) =>
    `${pre}<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:opacity-80 break-all">${url}</a>`);

  s = s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono">$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, '<span class="line-through opacity-70">$1</span>');
  return s;
}

function toHtml(md: string) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let inCode = false;
  let code: string[] = [];

  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  for (const raw of lines) {
    const line = raw;

    if (/^```/.test(line.trim())) {
      if (inCode) {
        out.push(`<pre class="my-2 p-3 rounded-lg bg-muted overflow-x-auto text-xs font-mono">${escapeHtml(code.join("\n"))}</pre>`);
        code = []; inCode = false;
      } else { closeList(); inCode = true; }
      continue;
    }
    if (inCode) { code.push(line); continue; }

    if (!line.trim()) { closeList(); continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const size = ["text-xl", "text-lg", "text-base", "text-sm"][h[1].length - 1];
      out.push(`<p class="${size} font-bold mt-3 mb-1">${inline(h[2])}</p>`);
      continue;
    }

    if (/^([-*_])\1{2,}$/.test(line.trim())) { closeList(); out.push('<hr class="my-3 border-border/60" />'); continue; }

    if (/^>\s?/.test(line)) {
      closeList();
      out.push(`<blockquote class="border-l-2 border-primary/60 pl-3 my-2 italic text-muted-foreground">${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      const want = ul ? "ul" : "ol";
      if (list !== want) {
        closeList();
        out.push(`<${want} class="${want === "ul" ? "list-disc" : "list-decimal"} pl-5 my-1.5 space-y-1">`);
        list = want;
      }
      out.push(`<li>${inline((ul ?? ol)![1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p class="my-1.5 leading-relaxed">${inline(line)}</p>`);
  }
  if (inCode && code.length) out.push(`<pre class="my-2 p-3 rounded-lg bg-muted overflow-x-auto text-xs font-mono">${escapeHtml(code.join("\n"))}</pre>`);
  closeList();
  return out.join("");
}

const MarkdownContent = ({ content, className = "" }: { content: string; className?: string }) => {
  const html = useMemo(() => toHtml(content || ""), [content]);
  return <div className={`break-words ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownContent;
