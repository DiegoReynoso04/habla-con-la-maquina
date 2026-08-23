'use client'

import { MessageSquareIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/lib/chat-types'

function formatDate(ts: number) {
  const date = new Date(ts)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function HistorySidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="border-b border-sidebar-border p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-sidebar-foreground">
          Historial
        </h2>
        <Button variant="outline" size="lg" className="w-full justify-start gap-2" onClick={onNew}>
          <PlusIcon className="size-4" aria-hidden="true" />
          Nueva conversación
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sorted.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Sin conversaciones
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sorted.map((conv) => {
              const isActive = conv.id === activeId
              return (
                <li key={conv.id}>
                  <div
                    className={
                      isActive
                        ? 'group flex items-center gap-1 rounded-lg bg-sidebar-accent pr-1'
                        : 'group flex items-center gap-1 rounded-lg pr-1 hover:bg-sidebar-accent/60'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(conv.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-left"
                    >
                      <MessageSquareIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={
                            isActive
                              ? 'block truncate text-sm font-medium text-sidebar-accent-foreground'
                              : 'block truncate text-sm text-sidebar-foreground'
                          }
                        >
                          {conv.title}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {conv.messages.length} msj · {formatDate(conv.updatedAt)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(conv.id)
                      }}
                      aria-label={`Borrar conversación: ${conv.title}`}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2Icon className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
