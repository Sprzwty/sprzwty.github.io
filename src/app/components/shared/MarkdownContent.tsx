import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useI18n, localeSerifFontFamily, localeReadingLetterSpacing } from '../../context/i18n';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

/** Monospace stays on the system stack even inside serif reading copy. */
const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

interface MarkdownContentProps {
  /** Markdown source pulled from Notion (via notion-to-md). */
  content: string;
  className?: string;
}

/**
 * Renders Notion-sourced Markdown (headings, lists, code blocks, images, math) as styled,
 * book-like reading copy. Set in the Noto Serif family (matched across Latin/SC/JP cuts so
 * mixed-language diary entries stay visually consistent) with type-aware vertical rhythm —
 * headings get breathing room above and cling to the paragraph that follows, rather than every
 * block being spaced identically. Shared between diary entries and blog article bodies.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const { locale } = useI18n();

  return (
    <div
      className={`markdown-content ${className ?? ''}`}
      style={{ fontFamily: localeSerifFontFamily[locale], letterSpacing: localeReadingLetterSpacing[locale] }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h2 style={{ color: 'var(--foreground)', fontWeight: 600, lineHeight: 1.3 }} className="text-2xl mt-10 mb-4 first:mt-0">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 style={{ color: 'var(--foreground)', fontWeight: 600, lineHeight: 1.35 }} className="text-xl mt-8 mb-3 first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 style={{ color: 'var(--foreground)', fontWeight: 600, lineHeight: 1.4 }} className="text-lg mt-6 mb-2 first:mt-0">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="mb-5 last:mb-0" style={{ color: 'var(--foreground)', lineHeight: '1.85' }}>{children}</p>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>{children}</a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-5 last:mb-0 flex flex-col gap-2" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-5 last:mb-0 flex flex-col gap-2" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="pl-5 mb-5 last:mb-0 italic"
              style={{ borderLeft: '3px solid var(--primary)', color: 'var(--muted-foreground)', lineHeight: '1.8' }}
            >
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = /language-/.test(codeClassName ?? '');
            if (!isBlock) {
              return (
                <code
                  className="rounded px-1.5 py-0.5 text-sm"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: MONO_STACK, letterSpacing: 'normal' }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <code className={codeClassName} style={{ fontFamily: MONO_STACK, letterSpacing: 'normal' }}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre
              className="rounded-lg p-4 mb-5 last:mb-0 overflow-x-auto text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: MONO_STACK, letterSpacing: 'normal' }}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            <span className="block rounded-lg overflow-hidden my-6">
              <ImageWithFallback src={src ?? ''} alt={alt ?? ''} className="w-full h-auto" />
            </span>
          ),
          hr: () => <hr className="my-8" style={{ borderColor: 'var(--border)' }} />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-5 last:mb-0">
              <table className="w-full text-sm border-collapse" style={{ color: 'var(--foreground)' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border px-3 py-2 text-left" style={{ borderColor: 'var(--border)' }}>{children}</th>
          ),
          td: ({ children }) => (
            <td className="border px-3 py-2" style={{ borderColor: 'var(--border)' }}>{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
