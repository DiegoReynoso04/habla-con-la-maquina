'use client'

import { Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tokensPerSecond, type SessionStats } from '@/lib/chat-types'

function format(n: number) {
  return n.toLocaleString('es-ES')
}

function Metric({
  label,
  value,
  unit,
  emphasis,
}: {
  label: string
  value: string
  unit?: string
  emphasis?: boolean
}) {
  return (
    <div className="border-b border-sidebar-border px-5 py-4 last:border-b-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          emphasis
            ? 'mt-1 font-mono text-3xl leading-none tabular-nums text-primary'
            : 'mt-1 font-mono text-xl leading-none tabular-nums text-foreground'
        }
      >
        {value}
        {unit ? <span className="ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  )
}

export function StatsSidebar({
  stats,
  messageCount,
  onClear,
}: {
  stats: SessionStats
  messageCount: number
  onClear: () => void
}) {
  const total = stats.promptTokens + stats.completionTokens
  const tps = tokensPerSecond(stats)
  const avgMs = stats.requests > 0 ? Math.round(stats.totalElapsedMs / stats.requests) : null

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Uso de tokens (sesión)
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {format(stats.requests)} peticiones · {format(messageCount)} mensajes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Metric label="Total de tokens" value={format(total)} emphasis />
        <Metric label="Tokens de prompt" value={format(stats.promptTokens)} />
        <Metric label="Tokens de completado" value={format(stats.completionTokens)} />
        <Metric
          label="Tiempo de respuesta"
          value={stats.lastElapsedMs != null ? format(stats.lastElapsedMs) : '—'}
          unit={stats.lastElapsedMs != null ? 'ms' : undefined}
        />
        <Metric
          label="Tokens por segundo"
          value={tps != null ? tps.toFixed(1) : '—'}
          unit={tps != null ? 'tok/s' : undefined}
        />
        <Metric
          label="Tiempo medio"
          value={avgMs != null ? format(avgMs) : '—'}
          unit={avgMs != null ? 'ms' : undefined}
        />
        <div className="px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Modelo
          </p>
          <p className="mt-1 break-all font-mono text-xs text-foreground">
            {stats.lastModel ?? 'sin datos'}
          </p>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <Button variant="outline" size="lg" className="w-full" onClick={onClear}>
          <Trash2Icon className="size-4" aria-hidden="true" />
          Borrar sesión
        </Button>
      </div>
    </div>
  )
}
