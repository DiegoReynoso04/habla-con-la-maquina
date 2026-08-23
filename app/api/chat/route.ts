// Endpoint de Groq (compatible con el formato de chat completions de OpenAI).
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Modelo configurable por variable de entorno.
// Ver modelos disponibles en https://console.groq.com/docs/models
const MODEL = process.env.CHAT_MODEL ?? 'openai/gpt-oss-20b'

export const maxDuration = 30

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

type GroqUsage = {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

type GroqResponse = {
  model?: string
  choices?: { message?: { content?: string } }[]
  usage?: GroqUsage
  error?: { message?: string }
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'Falta configurar GROQ_API_KEY en el servidor (archivo .env.local).' },
      { status: 500 },
    )
  }

  let body: { messages?: IncomingMessage[] }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 })
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []

  const messages = incoming
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
    // Llamada directa a la API de Groq con fetch, sin SDK ni librerías de envoltorio.
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente útil y conciso. Responde en el idioma del usuario con un formato claro y directo.',
          },
          ...messages,
        ],
      }),
    })

    const elapsedMs = Date.now() - startedAt

    let data: GroqResponse
    try {
      data = (await response.json()) as GroqResponse
    } catch {
      return Response.json(
        { error: `La API de Groq devolvió una respuesta inválida (estado ${response.status}).` },
        { status: 502 },
      )
    }

    // La API respondió pero con un código distinto de 2xx: mostramos el motivo real.
    if (!response.ok) {
      const detail = data?.error?.message ?? `estado ${response.status}`
      console.log('[chat route] Groq error:', detail)
      return Response.json(
        { error: `El proveedor rechazó la petición: ${detail}` },
        { status: 502 },
      )
    }

    const text = data.choices?.[0]?.message?.content ?? ''
    const promptTokens = data.usage?.prompt_tokens ?? 0
    const completionTokens = data.usage?.completion_tokens ?? 0
    const totalTokens = data.usage?.total_tokens ?? promptTokens + completionTokens

    return Response.json({
      text: text || '(respuesta vacía)',
      model: data.model ?? MODEL,
      elapsedMs,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
    })
  } catch (error) {
    // Errores de red (sin conexión, timeout, DNS, etc.) — nunca dejamos que la app se rompa.
    console.log('[chat route] network error:', error)
    return Response.json(
      { error: 'No se pudo contactar a la API de Groq. Revisa tu conexión a internet o la clave configurada.' },
      { status: 502 },
    )
  }
}
