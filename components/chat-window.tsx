'use client'

import { useCallback, useEffect, useState } from 'react'
import { ActivityIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageInput } from '@/components/message-input'
import { MessageList } from '@/components/message-list'
import { StatsSidebar } from '@/components/stats-sidebar'
import {
  accumulate,
  emptyStats,
  STORAGE_KEY,
  type Message,
  type MessageMeta,
  type SessionStats,
} from '@/lib/chat-types'

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<SessionStats>(emptyStats)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Restaurar la sesión anterior desde localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { messages?: Message[]; stats?: SessionStats }
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages)
        if (parsed.stats) setStats({ ...emptyStats, ...parsed.stats })
      }
    } catch (err) {
      console.log('[v0] no se pudo restaurar la sesión:', err)
    }
    setRestored(true)
  }, [])

  // Persistir historial y estadísticas.
  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, stats }))
    } catch (err) {
      console.log('[v0] no se pudo guardar la sesión:', err)
    }
  }, [messages, stats, restored])

  const send = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: newId(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      }
      const history = [...messages, userMessage]

      setMessages(history)
      setError(null)
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.error ?? 'Error en la petición.')

        const meta: MessageMeta = {
          model: data.model,
          elapsedMs: data.elapsedMs,
          promptTokens: data.usage?.promptTokens ?? 0,
          completionTokens: data.usage?.completionTokens ?? 0,
          totalTokens: data.usage?.totalTokens ?? 0,
        }

        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'assistant',
            content: data.text || '(respuesta vacía)',
            createdAt: Date.now(),
            meta,
          },
        ])
        setStats((prev) => accumulate(prev, meta))
      } catch (err) {
        console.log('[v0] error enviando mensaje:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido.')
      } finally {
        setIsLoading(false)
      }
    },
    [messages],
  )

  const clearSession = useCallback(() => {
    setMessages([])
    setStats(emptyStats)
    setError(null)
    setSidebarOpen(false)
  }, [])

  return (
    <div className="flex h-dvh flex-col bg-background lg:flex-row">
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">Consola de chat</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {stats.lastModel ?? 'listo para conectar'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-baseline gap-1.5 sm:flex lg:hidden">
              <span className="font-mono text-lg tabular-nums text-primary">
                {stats.promptTokens + stats.completionTokens}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                tokens
              </span>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-controls="stats-panel"
            >
              <ActivityIcon className="size-4" aria-hidden="true" />
              Uso
            </Button>
          </div>
        </header>

        <MessageList messages={messages} isLoading={isLoading} error={error} />
        <MessageInput onSend={send} isLoading={isLoading} />
      </main>

      {/* Sidebar fijo en escritorio */}
      <aside className="hidden w-72 shrink-0 border-l border-sidebar-border lg:block">
        <StatsSidebar stats={stats} messageCount={messages.length} onClear={clearSession} />
      </aside>

      {/* Sidebar colapsable en móvil */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar panel de uso"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            id="stats-panel"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-xs flex-col border-l border-sidebar-border bg-sidebar shadow-xl"
          >
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon-lg" onClick={() => setSidebarOpen(false)}>
                <XIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <StatsSidebar stats={stats} messageCount={messages.length} onClear={clearSession} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
