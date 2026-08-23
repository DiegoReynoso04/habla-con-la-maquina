'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/lib/chat-types'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
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
