'use client';
import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renderiza o texto de uma mensagem do chat (usuário ou IA) como Markdown.
 * A IA (Groq/OpenAI/etc.) sempre responde em Markdown (**negrito**, listas,
 * títulos, código) — sem isso o texto aparecia cru na tela (asteriscos e
 * tudo). Usado tanto em /iaagent quanto no popup flutuante (IAAgentPopup).
 *
 * Não usa o plugin @tailwindcss/typography (não instalado, Tailwind v4 é
 * CSS-first) — cada elemento é estilizado manualmente via `components`.
 *
 * `inverted` deixa negrito/links/código legíveis em bolhas com fundo
 * escuro/colorido (mensagens do próprio usuário, ex: gradiente accent).
 */
export default function MarkdownMessage({ text, inverted = false, compact = false }: { text: string; inverted?: boolean; compact?: boolean }) {
  const strongColor = inverted ? 'text-white' : 'text-slate-900 dark:text-white';
  const linkColor = inverted ? 'text-white underline' : 'text-[var(--color-accent)] underline';
  const codeBg = inverted ? 'bg-white/15' : 'bg-black/5 dark:bg-white/10';

  const components: Components = {
    p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className={`font-bold ${strongColor}`}>{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer" className={linkColor}>
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="my-1.5 pl-5 list-disc space-y-0.5">{children}</ul>,
    ol: ({ children }) => <ol className="my-1.5 pl-5 list-decimal space-y-0.5">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold my-1.5">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-1.5 pl-3 border-l-2 border-current/30 italic opacity-90">{children}</blockquote>
    ),
    code: ({ children, className }) => {
      const isBlock = /language-/.test(className || '');
      if (isBlock) {
        return (
          <code className={`block whitespace-pre-wrap font-mono text-[13px] ${className || ''}`}>{children}</code>
        );
      }
      return <code className={`px-1 py-0.5 rounded font-mono text-[13px] ${codeBg}`}>{children}</code>;
    },
    pre: ({ children }) => (
      <pre className={`my-2 p-3 rounded-lg overflow-x-auto ${codeBg}`}>{children}</pre>
    ),
    hr: () => <hr className="my-2 border-current/20" />,
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto">
        <table className="text-sm border-collapse">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border border-current/20 px-2 py-1 text-left font-bold">{children}</th>,
    td: ({ children }) => <td className="border border-current/20 px-2 py-1">{children}</td>,
  };

  return (
    <div className={`${compact ? 'text-[13px]' : 'text-[15px]'} leading-relaxed break-words`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
