import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

interface MarkdownContentProps {
  /** Markdown source pulled from Notion (via notion-to-md). */
  content: string;
  className?: string;
}

/**
 * Renders Notion-sourced Markdown (headings, lists, code blocks, images, math)
 * as styled HTML. Shared between diary entries and blog article bodies so both
 * surfaces render Notion formatting identically.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={`markdown-content flex flex-col gap-4 ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h2 style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.3 }} className="text-2xl mt-2">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.35 }} className="text-xl mt-2">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.4 }} className="text-lg mt-1">{children}</h4>
          ),
          p: ({ children }) => (
            <p style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>{children}</p>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{children}</a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 flex flex-col gap-1" style={{ color: 'var(--foreground)', lineHeight: '1.75' }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 flex flex-col gap-1" style={{ color: 'var(--foreground)', lineHeight: '1.75' }}>{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="pl-4 border-l-2" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>{children}</blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = /language-/.test(codeClassName ?? '');
            if (!isBlock) {
              return (
                <code
                  className="rounded px-1.5 py-0.5 text-sm"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <code className={codeClassName}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre
              className="rounded-lg p-4 overflow-x-auto text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            <span className="block rounded-lg overflow-hidden my-2">
              <ImageWithFallback src={src ?? ''} alt={alt ?? ''} className="w-full h-auto" />
            </span>
          ),
          hr: () => <hr style={{ borderColor: 'var(--border)' }} />,
          table: ({ children }) => (
            <div className="overflow-x-auto">
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
