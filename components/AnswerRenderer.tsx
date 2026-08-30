"use client";

import React, { useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

type AnswerRendererProps = {
  content?: string | null;
  className?: string;
};

/* =========================================================
   PROTECT CODE BLOCKS
========================================================= */

function protectCodeBlocks(content: string) {
  const codeBlocks: string[] = [];

  const protectedContent = content.replace(
    /```[\s\S]*?```/g,
    (block) => {
      const index = codeBlocks.length;

      codeBlocks.push(block);

      return `___SNAP2STUDY_CODE_BLOCK_${index}___`;
    }
  );

  return {
    protectedContent,
    codeBlocks,
  };
}

/* =========================================================
   RESTORE CODE BLOCKS
========================================================= */

function restoreCodeBlocks(
  content: string,
  codeBlocks: string[]
) {
  return content.replace(
    /___SNAP2STUDY_CODE_BLOCK_(\d+)___/g,
    (_match, index: string) =>
      codeBlocks[Number(index)] ?? ""
  );
}

/* =========================================================
   LATEX NORMALIZATION
========================================================= */

function normalizeLatex(content: string): string {
  let result = content;

  result = result.replace(
    /(?<!\\)\bext\s*\{/g,
    "\\text{"
  );

  result = result.replace(
    /\\mathrm\s+\{/g,
    "\\mathrm{"
  );

  result = result.replace(
    /\\text\s*\{\s*([^{}]*?)\s*\}/g,
    (_match, value: string) =>
      `\\text{${value.trim()}}`
  );

  result = result.replace(/\\_/g, "_");

  result = result.replace(
    /\^\\?o\b/gi,
    "^\\circ"
  );

  result = result.replace(
    /\^\\?ext\s*\{\s*o\s*\}/gi,
    "^\\circ"
  );

  result = result.replace(
    /\\,+\s*dx\b/g,
    "\\,dx"
  );

  result = result.replace(
    /,\s+dx\b/g,
    "\\,dx"
  );

  result = result.replace(
    /(\d+(?:\.\d+)?)\s*,\s*\\text\{\s*(N|kg|g|m|cm|mm|s|J|W|Pa|V|A|C|K|mol)\s*\}/g,
    "$1\\,\\mathrm{$2}"
  );

  result = result.replace(
    /(\$+[\s\S]*?\$+)/g,
    (match) =>
      match.replace(
        /(\d+(?:\.\d+)?)\s+(N|kg|g|m|cm|mm|s|J|W|Pa|V|A|C|K|mol)\b/g,
        "$1\\,\\mathrm{$2}"
      )
  );

  return result;
}

/* =========================================================
   CONVERT LATEX DELIMITERS
========================================================= */

function convertLatexDelimiters(content: string): string {
  let result = content;

  result = result.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_match, expression: string) =>
      `$$\n${expression.trim()}\n$$`
  );

  result = result.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_match, expression: string) =>
      `$${expression.trim()}$`
  );

  return result;
}

/* =========================================================
   LATEX COMMAND DETECTION
========================================================= */

function containsLatexCommand(text: string): boolean {
  return /\\(?:int|iint|iiint|oint|frac|dfrac|tfrac|sqrt|sum|prod|lim|sin|cos|tan|cot|sec|csc|log|ln|exp|partial|nabla|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|phi|omega|infty|cdot|times|leq|geq|neq|pm|mp|rightarrow|leftarrow|Rightarrow|Leftarrow|to|over|under|mathrm|mathbf|text|vec|hat|bar|circ)\b/.test(
    text
  );
}

/* =========================================================
   PROTECT EXISTING MATH
========================================================= */

function protectMath(content: string) {
  const mathBlocks: string[] = [];

  const protectedContent = content.replace(
    /(\$\$[\s\S]*?\$\$|\$(?!\$)[\s\S]*?\$)/g,
    (match) => {
      const index = mathBlocks.length;

      mathBlocks.push(match);

      return `___SNAP2STUDY_MATH_${index}___`;
    }
  );

  return {
    protectedContent,
    mathBlocks,
  };
}

/* =========================================================
   RESTORE MATH
========================================================= */

function restoreMath(
  content: string,
  mathBlocks: string[]
) {
  return content.replace(
    /___SNAP2STUDY_MATH_(\d+)___/g,
    (_match, index: string) =>
      mathBlocks[Number(index)] ?? ""
  );
}

/* =========================================================
   WRAP BARE LATEX
========================================================= */

function wrapBareLatexInText(text: string): string {
  if (!containsLatexCommand(text)) {
    return text;
  }

  const numberedMatch = text.match(
    /^(\s*\d+[\.\)]\s+)(.*)$/
  );

  if (numberedMatch) {
    const prefix = numberedMatch[1];
    const expression = numberedMatch[2].trim();

    if (containsLatexCommand(expression)) {
      return `${prefix}$${expression}$`;
    }
  }

  const bulletMatch = text.match(
    /^(\s*[-*+]\s+)(.*)$/
  );

  if (bulletMatch) {
    const prefix = bulletMatch[1];
    const expression = bulletMatch[2].trim();

    if (containsLatexCommand(expression)) {
      return `${prefix}$${expression}$`;
    }
  }

  let result = text;

  result = result.replace(
    /((?:\\(?:int|iint|iiint|oint|frac|dfrac|tfrac|sqrt|sum|prod|lim|sin|cos|tan|cot|sec|csc|log|ln|exp|partial|nabla|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|phi|omega|infty|cdot|times|leq|geq|neq|pm|mp|rightarrow|leftarrow|Rightarrow|Leftarrow|to|over|under|mathrm|mathbf|text|vec|hat|bar|circ)\b)[^.;:!?]*(?:\{[^{}]*\}[^.;:!?]*)*)/g,
    (match) => {
      const trimmed = match.trim();

      if (!trimmed) {
        return match;
      }

      return `$${trimmed}$`;
    }
  );

  return result;
}

/* =========================================================
   PROCESS BARE LATEX
========================================================= */

function wrapBareLatex(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      if (!line.trim()) {
        return line;
      }

      if (
        line.includes(
          "___SNAP2STUDY_CODE_BLOCK_"
        )
      ) {
        return line;
      }

      if (
        line.includes(
          "___SNAP2STUDY_MATH_"
        )
      ) {
        return line;
      }

      return wrapBareLatexInText(line);
    })
    .join("\n");
}

/* =========================================================
   MAIN NORMALIZATION
========================================================= */

function normalizeMath(content: string): string {
  if (!content) {
    return "";
  }

  const {
    protectedContent,
    codeBlocks,
  } = protectCodeBlocks(content);

  let result = protectedContent;

  result = normalizeLatex(result);

  result = convertLatexDelimiters(result);

  const {
    protectedContent: mathProtected,
    mathBlocks,
  } = protectMath(result);

  result = mathProtected;

  result = wrapBareLatex(result);

  result = restoreMath(
    result,
    mathBlocks
  );

  result = restoreCodeBlocks(
    result,
    codeBlocks
  );

  return result;
}

/* =========================================================
   CODE LANGUAGE
========================================================= */

function getLanguage(
  className?: string
): string {
  if (!className) {
    return "";
  }

  const match =
    className.match(
      /language-([\w+-]+)/
    );

  return match?.[1] ?? "";
}

/* =========================================================
   CODE BLOCK
========================================================= */

function CodeBlock({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const language = getLanguage(className);

  return (
    <div className="my-8 overflow-hidden border-2 border-black bg-(--black) shadow-[6px_6px_0_var(--coral)]">

      {/* CODE HEADER */}

      <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">

        <div className="flex items-center gap-3">

          <span className="h-2 w-2 rounded-full bg-(--coral)" />

          <span className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
            {language || "code"}
          </span>

        </div>

        <span className="mono text-[8px] uppercase tracking-[0.15em] text-white/25">
          SNAP2STUDY
        </span>

      </div>

      {/* CODE */}

      <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-6 text-white sm:p-6 sm:text-[13px]">
        <code className={className}>
          {children}
        </code>
      </pre>

    </div>
  );
}

/* =========================================================
   MARKDOWN COMPONENTS
========================================================= */

const markdownComponents: Components = {

  /* -------------------------------------------------------
     PARAGRAPH
  ------------------------------------------------------- */

  p: ({ children }) => (
    <p className="mb-6 max-w-3xl text-[15px] leading-8 text-black/75 last:mb-0 sm:text-base">
      {children}
    </p>
  ),

  /* -------------------------------------------------------
     HEADINGS
  ------------------------------------------------------- */

  h1: ({ children }) => (
    <h1 className="serif mb-7 mt-12 text-4xl leading-[0.95] first:mt-0 sm:text-5xl">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="serif mb-5 mt-11 flex items-center gap-3 text-3xl leading-none first:mt-0 sm:text-4xl">

      <span className="inline-block h-3 w-3 shrink-0 border-2 border-black bg-(--coral)" />

      {children}

    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="serif mb-4 mt-8 text-2xl leading-tight">
      {children}
    </h3>
  ),

  /* -------------------------------------------------------
     STRONG
  ------------------------------------------------------- */

  strong: ({ children }) => (
    <strong className="font-bold text-black">
      {children}
    </strong>
  ),

  /* -------------------------------------------------------
     EMPHASIS
  ------------------------------------------------------- */

  em: ({ children }) => (
    <em className="italic">
      {children}
    </em>
  ),

  /* -------------------------------------------------------
     INLINE CODE / BLOCK CODE
  ------------------------------------------------------- */

  code: ({
    children,
    className,
  }) => {

    const isBlock =
      Boolean(className) ||
      String(children).includes("\n");

    if (isBlock) {
      return (
        <CodeBlock
          className={className}
        >
          {children}
        </CodeBlock>
      );
    }

    return (
      <code className="rounded border border-black/15 bg-black/[0.06] px-1.5 py-1 font-mono text-[0.88em]">
        {children}
      </code>
    );
  },

  /* -------------------------------------------------------
     LISTS
  ------------------------------------------------------- */

  ul: ({ children }) => (
    <ul className="mb-7 ml-6 list-disc space-y-3 text-[15px] leading-8 sm:text-base">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mb-7 ml-6 list-decimal space-y-4 text-[15px] leading-8 sm:text-base">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="pl-2">
      {children}
    </li>
  ),

  /* -------------------------------------------------------
     BLOCKQUOTE
  ------------------------------------------------------- */

  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-[5px] border-black bg-(--yellow) px-6 py-5 sm:px-7">

      <div className="mono mb-3 text-[8px] font-bold uppercase tracking-[0.16em] text-black/45">
        Note
      </div>

      <div className="italic leading-7">
        {children}
      </div>

    </blockquote>
  ),

  /* -------------------------------------------------------
     HORIZONTAL RULE
  ------------------------------------------------------- */

  hr: () => (
    <div className="my-10 flex items-center gap-3">

      <div className="h-2 w-2 border-2 border-black bg-(--coral)" />

      <div className="h-[2px] flex-1 bg-black/15" />

      <div className="mono text-[8px] uppercase tracking-widest text-black/35">
        continue
      </div>

    </div>
  ),

  /* -------------------------------------------------------
     LINKS
  ------------------------------------------------------- */

  a: ({
    href,
    children,
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline decoration-2 underline-offset-4 transition-opacity hover:opacity-50"
    >
      {children}
    </a>
  ),

  /* -------------------------------------------------------
     TABLE
  ------------------------------------------------------- */

  table: ({ children }) => (
    <div className="my-8 overflow-x-auto border-2 border-black shadow-[5px_5px_0_var(--black)]">

      <table className="w-full min-w-[520px] border-collapse text-sm">
        {children}
      </table>

    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-(--black) text-white">
      {children}
    </thead>
  ),

  tbody: ({ children }) => (
    <tbody>
      {children}
    </tbody>
  ),

  tr: ({ children }) => (
    <tr className="border-b border-black/15 last:border-0">
      {children}
    </tr>
  ),

  th: ({ children }) => (
    <th className="border-r border-white/15 px-4 py-4 text-left font-mono text-[9px] uppercase tracking-[0.12em] last:border-0">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border-r border-black/10 px-4 py-4 align-top leading-6 last:border-0">
      {children}
    </td>
  ),
};

/* =========================================================
   ANSWER RENDERER
========================================================= */

export default function AnswerRenderer({
  content,
  className = "",
}: AnswerRendererProps) {

  const normalizedContent = useMemo(
    () =>
      normalizeMath(
        content ?? ""
      ),
    [content]
  );

  if (!normalizedContent.trim()) {
    return null;
  }

  return (
    <article
      className={`answer-renderer min-w-0 ${className}`}
    >

      {/* CONTENT */}

      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
        components={
          markdownComponents
        }
      >
        {normalizedContent}
      </ReactMarkdown>

      

    </article>
  );
}