export type Role = 'user' | 'assistant'

export type Message = {
  id: string
  role: Role
  content: string
  createdAt: number
  /** Métricas devueltas por la IA (solo en mensajes del asistente). */
  meta?: MessageMeta
}

export type MessageMeta = {
  model: string
  elapsedMs: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export type SessionStats = {
  promptTokens: number
  completionTokens: number
  requests: number
  totalElapsedMs: number
  lastModel: string | null
  lastElapsedMs: number | null
  lastCompletionTokens: number | null
}

export const emptyStats: SessionStats = {
  promptTokens: 0,
  completionTokens: 0,
  requests: 0,
  totalElapsedMs: 0,
  lastModel: null,
  lastElapsedMs: null,
  lastCompletionTokens: null,
}

export const STORAGE_KEY = 'v0-chat-session-v1'

export function accumulate(stats: SessionStats, meta: MessageMeta): SessionStats {
  return {
    promptTokens: stats.promptTokens + meta.promptTokens,
    completionTokens: stats.completionTokens + meta.completionTokens,
    requests: stats.requests + 1,
    totalElapsedMs: stats.totalElapsedMs + meta.elapsedMs,
    lastModel: meta.model,
    lastElapsedMs: meta.elapsedMs,
    lastCompletionTokens: meta.completionTokens,
  }
}

/** Tokens por segundo de la última respuesta. */
export function tokensPerSecond(stats: SessionStats): number | null {
  if (!stats.lastElapsedMs || stats.lastCompletionTokens == null) return null
  return (stats.lastCompletionTokens / stats.lastElapsedMs) * 1000
}
