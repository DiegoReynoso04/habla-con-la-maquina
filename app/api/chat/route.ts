import { generateText, type ModelMessage } from 'ai'
import { groq } from '@ai-sdk/groq'

// Modelo configurable por variable de entorno.
// Ver modelos disponibles en https://console.groq.com/docs/models
const MODEL = process.env.CHAT_MODEL ?? 'openai/gpt-oss-20b'

export const maxDuration = 30

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  let body: { messages?: IncomingMessage[] }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 })
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []

  const messages: ModelMessage[] = incoming
    .filter((m) => typeof m?.content === 'string' && m.content.trim().length > 0)
    .slice(-30)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

  if (messages.length === 0) {
    return Response.json({ error: 'No hay mensajes que enviar.' }, { status: 400 })
  }

  const startedAt = Date.now()

  try {
    const result = await generateText({
      model: groq(MODEL),
      system:
        'Eres un asistente útil y conciso. Responde en el idioma del usuario con un formato claro y directo.',
      messages,
    })

    const elapsedMs = Date.now() - startedAt
    const promptTokens = result.usage.inputTokens ?? 0
    const completionTokens = result.usage.outputTokens ?? 0

    return Response.json({
      text: result.text,
      model: result.response?.modelId ?? MODEL,
      elapsedMs,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: result.usage.totalTokens ?? promptTokens + completionTokens,
      },
    })
  } catch (error) {
    console.log('[v0] chat route error:', error)

    // Propagamos el mensaje real del proveedor para que sea depurable en la UI.
    const detail =
      typeof error === 'object' && error !== null && 'responseBody' in error
        ? extractProviderMessage((error as { responseBody?: unknown }).responseBody)
        : error instanceof Error
          ? error.message
          : null

    return Response.json(
      {
        error: detail
          ? `El proveedor rechazó la petición: ${detail}`
          : 'No se pudo obtener respuesta del modelo. Revisa la configuración del proveedor.',
      },
      { status: 502 },
    )
  }
}

function extractProviderMessage(responseBody: unknown): string | null {
  if (typeof responseBody !== 'string') return null
  try {
    const parsed = JSON.parse(responseBody) as { error?: { message?: string } }
    return parsed.error?.message ?? null
  } catch {
    return responseBody.slice(0, 300)
  }
}
