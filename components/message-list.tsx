'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/chat-types'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Estilos de cada elemento de Markdown para que combinen con la burbuja del chat.
// rehype-raw + rehype-sanitize permiten etiquetas HTML sueltas que a veces mete el
// modelo (como <br> dentro de una celda de tabla) pero filtran cualquier cosa peligrosa
// (script, iframe, atributos on*, etc.) usando la lista blanca por defecto de hast-util-sanitize.
const markdownComponents: Components = {
  p: ({ node, children, className, ...props }) => (
    <p className={cn(className, 'mb-2 text-pretty last:mb-0')} {...props}>
      {children}
    </p>
  ),
  strong: ({ node, children, className, ...props }) => (
    <strong className={cn(className, 'font-semibold')} {...props}>
      {children}
    </strong>
  ),
  em: ({ node, children, className, ...props }) => (
    <em className={cn(className, 'italic')} {...props}>
      {children}
    </em>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn(className, 'mb-2 ml-4 list-disc space-y-1 last:mb-0')} {...props}>
      {children}
    </ul>
  ),
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn(className, 'mb-2 ml-4 list-decimal space-y-1 last:mb-0')} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn(className)} {...props}>
      {children}
    </li>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className={cn(className, 'text-primary underline underline-offset-2')}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h3 className={cn(className, 'mb-2 mt-1 text-base font-semibold first:mt-0')} {...props}>
      {children}
    </h3>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h3 className={cn(className, 'mb-2 mt-1 text-base font-semibold first:mt-0')} {...props}>
      {children}
    </h3>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h4 className={cn(className, 'mb-1.5 mt-1 text-sm font-semibold first:mt-0')} {...props}>
      {children}
    </h4>
  ),
  blockquote: ({ node, children, className, ...props }) => (
    <blockquote
      className={cn(className, 'mb-2 border-l-2 border-border pl-3 text-muted-foreground last:mb-0')}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ node, children, className, ...props }) => (
    <code className={cn(className, 'rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.85em]')} {...props}>
      {children}
    </code>
  ),
  pre: ({ node, children, className, ...props }) => (
    <pre
      className={cn(
        className,
        'mb-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[0.85em] leading-relaxed last:mb-0 [&>code]:bg-transparent [&>code]:p-0',
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ node, children, className, ...props }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className={cn(className, 'w-full border-collapse text-left text-[0.9em]')} {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, className, ...props }) => (
    <thead className={cn(className, 'border-b border-border')} {...props}>
      {children}
    </thead>
  ),
  th: ({ node, children, className, ...props }) => (
    <th className={cn(className, 'px-2 py-1.5 font-semibold')} {...props}>
      {children}
    </th>
  ),
  td: ({ node, children, className, ...props }) => (
    <td className={cn(className, 'border-t border-border px-2 py-1.5 align-top')} {...props}>
      {children}
    </td>
  ),
  hr: ({ node, className, ...props }) => <hr className={cn(className, 'my-3 border-border')} {...props} />,
}

export function MessageList({
  messages,
  isLoading,
  error,
}: {
  messages: Message[]
  isLoading: boolean
  error: string | null
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {messages.length === 0 && !isLoading ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Sesión vacía
            </p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              Escribe un mensaje para iniciar la conversación. El historial y el consumo de tokens se
              guardan en este navegador.
            </p>
          </div>
        ) : null}

        {messages.map((message) => {
          const isUser = message.role === 'user'
          return (
            <div
              key={message.id}
              className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>{isUser ? 'Tú' : 'Asistente'}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={new Date(message.createdAt).toISOString()}>
                  {formatTime(message.createdAt)}
                </time>
              </div>

              <div
                className={
                  isUser
                    ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground'
                    : 'max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-card-foreground'
                }
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>

              {message.meta ? (
                <p className="px-1 font-mono text-[10px] text-muted-foreground">
                  {message.meta.totalTokens} tok · {message.meta.elapsedMs} ms ·{' '}
                  {message.meta.model}
                </p>
              ) : null}
            </div>
          )
        })}

        {isLoading ? (
          <div className="flex flex-col items-start gap-1.5">
            <div className="px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Asistente
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
              <span className="flex gap-1" aria-hidden="true">
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary" />
              </span>
              <span className="text-sm text-muted-foreground">Escribiendo…</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
