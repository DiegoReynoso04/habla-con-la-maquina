'use client'

import { useCallback, useEffect, useState } from 'react'
import { ActivityIcon, PanelLeftIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageInput } from '@/components/message-input'
import { MessageList } from '@/components/message-list'
import { StatsSidebar } from '@/components/stats-sidebar'
import { HistorySidebar } from '@/components/history-sidebar'
import {
  accumulate,
  CONVERSATIONS_STORAGE_KEY,
  deriveTitle,
  emptyStats,
  newConversation,
  STORAGE_KEY,
  type Conversation,
  type Message,
  type MessageMeta,
} from '@/lib/chat-types'

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function ChatWindow() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Restaurar el historial de conversaciones (o migrar la sesión única de la versión anterior).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONVERSATIONS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          conversations?: Conversation[]
          activeId?: string | null
        }
        if (Array.isArray(parsed.conversations) && parsed.conversations.length > 0) {
          setConversations(parsed.conversations)
          setActiveId(parsed.activeId ?? parsed.conversations[0].id)
          return
        }
      }

      // No hay historial nuevo todavía: intentamos migrar la sesión vieja (una sola conversación).
      const legacyRaw = localStorage.getItem(STORAGE_KEY)
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as {
          messages?: Message[]
          stats?: Partial<typeof emptyStats>
        }
        if (Array.isArray(legacy.messages) && legacy.messages.length > 0) {
          const migrated: Conversation = {
            id: newId(),
            title: deriveTitle(legacy.messages),
            createdAt: legacy.messages[0]?.createdAt ?? Date.now(),
            updatedAt: Date.now(),
            messages: legacy.messages,
            stats: { ...emptyStats, ...legacy.stats },
          }
          setConversations([migrated])
          setActiveId(migrated.id)
          return
        }
      }

      // Nada que restaurar: arrancamos con una conversación vacía.
      const fresh = newConversation(newId())
      setConversations([fresh])
      setActiveId(fresh.id)
    } catch (err) {
      console.log('[v0] no se pudo restaurar el historial:', err)
      const fresh = newConversation(newId())
      setConversations([fresh])
      setActiveId(fresh.id)
    } finally {
      setRestored(true)
    }
  }, [])

  // Persistir el historial completo de conversaciones.
  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify({ conversations, activeId }))
    } catch (err) {
      console.log('[v0] no se pudo guardar el historial:', err)
    }
  }, [conversations, activeId, restored])

  const active = conversations.find((c) => c.id === activeId) ?? null
  const messages = active?.messages ?? []
  const stats = active?.stats ?? emptyStats

  const send = useCallback(
    async (text: string) => {
      const current = conversations.find((c) => c.id === activeId)
      if (!current) return

      const userMessage: Message = {
        id: newId(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      }
      const history = [...current.messages, userMessage]

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: history,
                title: c.messages.length === 0 ? deriveTitle(history) : c.title,
                updatedAt: Date.now(),
              }
            : c,
        ),
      )
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

        const assistantMessage: Message = {
          id: newId(),
          role: 'assistant',
          content: data.text || '(respuesta vacía)',
          createdAt: Date.now(),
          meta,
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: [...c.messages, assistantMessage],
                  stats: accumulate(c.stats, meta),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        )
      } catch (err) {
        console.log('[v0] error enviando mensaje:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido.')
      } finally {
        setIsLoading(false)
      }
    },
    [activeId, conversations],
  )

  const createAndSelectConversation = useCallback(() => {
    const fresh = newConversation(newId())
    setConversations((prev) => [fresh, ...prev])
    setActiveId(fresh.id)
    setError(null)
    setHistoryOpen(false)
  }, [])

  const selectConversation = useCallback((id: string) => {
    setActiveId(id)
    setError(null)
    setHistoryOpen(false)
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        if (id !== activeId) return next

        if (next.length > 0) {
          setActiveId(next[0].id)
          return next
        }

        const fresh = newConversation(newId())
        setActiveId(fresh.id)
        return [fresh]
      })
    },
    [activeId],
  )

  const clearActiveConversation = useCallback(() => {
    if (!activeId) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [], stats: emptyStats, title: 'Nueva conversación', updatedAt: Date.now() }
          : c,
      ),
    )
    setError(null)
    setStatsOpen(false)
  }, [activeId])

  return (
    <div className="flex h-dvh flex-col bg-background lg:flex-row">
      {/* Historial fijo en escritorio */}
      <aside className="hidden w-72 shrink-0 border-r border-sidebar-border lg:block">
        <HistorySidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={createAndSelectConversation}
          onDelete={deleteConversation}
        />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon-lg"
              className="lg:hidden"
              onClick={() => setHistoryOpen(true)}
              aria-expanded={historyOpen}
              aria-controls="history-panel"
            >
              <PanelLeftIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Historial</span>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight">
                {active?.title ?? 'Consola de chat'}
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {stats.lastModel ?? 'listo para conectar'}
              </p>
            </div>
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
              onClick={() => setStatsOpen(true)}
              aria-expanded={statsOpen}
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

      {/* Sidebar de estadísticas fijo en escritorio */}
      <aside className="hidden w-72 shrink-0 border-l border-sidebar-border lg:block">
        <StatsSidebar stats={stats} messageCount={messages.length} onClear={clearActiveConversation} />
      </aside>

      {/* Historial colapsable en móvil */}
      {historyOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar historial"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setHistoryOpen(false)}
          />
          <div
            id="history-panel"
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col border-r border-sidebar-border bg-sidebar shadow-xl"
          >
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon-lg" onClick={() => setHistoryOpen(false)}>
                <XIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <HistorySidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={selectConversation}
                onNew={createAndSelectConversation}
                onDelete={deleteConversation}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Sidebar de estadísticas colapsable en móvil */}
      {statsOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar panel de uso"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setStatsOpen(false)}
          />
          <div
            id="stats-panel"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-xs flex-col border-l border-sidebar-border bg-sidebar shadow-xl"
          >
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon-lg" onClick={() => setStatsOpen(false)}>
                <XIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <StatsSidebar stats={stats} messageCount={messages.length} onClear={clearActiveConversation} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
