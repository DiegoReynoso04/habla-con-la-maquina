[English](README.md) | Español

# Chat Usage Dashboard

Interfaz de chat conectada a la API de [Groq](https://groq.com) que, además de conversar, muestra en tiempo real el consumo de tokens de la sesión (tokens de prompt y de completado, tiempo de respuesta, tokens por segundo…) y guarda un historial de conversaciones en el navegador.

Proyecto del **bootcamp de AI Engineering de 4Geeks Academy**: "Construyendo una interfaz de chat con una API de IA real". La interfaz base se generó con [v0 de Vercel](https://v0.app) y la conexión con la API la implementé a mano con `fetch`, sin SDKs de terceros, como pedía el enunciado.

## Tecnologías

- **[Next.js 16](https://nextjs.org/)** (App Router): frontend y endpoint de API interno.
- **[React 19](https://react.dev/)** y **[TypeScript](https://www.typescriptlang.org/)**.
- **[Tailwind CSS 4](https://tailwindcss.com/)**, **[shadcn](https://ui.shadcn.com/)** y **[Base UI](https://base-ui.com/)**: estilos y componentes.
- **[lucide-react](https://lucide.dev/)**: iconos.
- **[react-markdown](https://github.com/remarkjs/react-markdown)** (+ `remark-gfm`, `rehype-raw`, `rehype-sanitize`): muestra el Markdown que devuelve el modelo (tablas, negritas, listas) filtrando cualquier HTML peligroso.
- **[API de Groq](https://console.groq.com/docs)**: inferencia del modelo. Se llama con `fetch` al endpoint `https://api.groq.com/openai/v1/chat/completions` (formato compatible con OpenAI), sin SDK intermedio.
- **[Vercel Analytics](https://vercel.com/analytics)**: analítica básica, solo en producción.

## Estructura de carpetas

```
habla-con-la-maquina/
├── app/
│   ├── api/chat/route.ts       # Endpoint POST que llama a la API de Groq
│   ├── globals.css             # Variables de tema y estilos base
│   ├── layout.tsx              # Layout raíz (fuentes, metadata, analytics)
│   └── page.tsx                # Página principal (renderiza <ChatWindow />)
├── components/
│   ├── ui/                     # Componentes base de shadcn/ui
│   ├── chat-window.tsx         # Componente principal: estado, envío de mensajes, historial
│   ├── history-sidebar.tsx     # Panel lateral con las conversaciones guardadas
│   ├── message-input.tsx       # Caja de texto para escribir mensajes
│   ├── message-list.tsx        # Lista de mensajes + renderizado de Markdown
│   └── stats-sidebar.tsx       # Panel con las estadísticas de uso de tokens
├── lib/
│   ├── chat-types.ts           # Tipos y helpers (conversaciones, estadísticas, acumulación de tokens)
│   └── utils.ts                # Helper `cn()` para combinar clases de Tailwind
└── public/                     # Archivos estáticos
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/DiegoReynoso04/habla-con-la-maquina.git
   cd habla-con-la-maquina
   ```
2. Instala las dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```
   > `--legacy-peer-deps` evita conflictos de *peer dependencies*: algunos paquetes todavía no declaran soporte oficial para React 19.
3. Crea un archivo `.env.local` en la raíz con tu clave de Groq:
   ```env
   GROQ_API_KEY=tu_clave_de_groq
   CHAT_MODEL=openai/gpt-oss-20b
   ```
   Consigue una clave gratuita en [console.groq.com/keys](https://console.groq.com/keys).
4. Arranca el servidor de desarrollo y abre [http://localhost:3000](http://localhost:3000):
   ```bash
   npm run dev
   ```

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `GROQ_API_KEY` | Sí | Clave de la API de Groq. Solo se usa en el servidor (`app/api/chat/route.ts`) y nunca llega al navegador. |
| `CHAT_MODEL` | No | Modelo de Groq. Por defecto, `openai/gpt-oss-20b`. Ver [modelos disponibles](https://console.groq.com/docs/models). |

**Importante:** el archivo debe llamarse `.env.local`. El `.gitignore` solo excluye los archivos que terminan en `.local`, así que es la forma de asegurarte de que tu clave nunca se sube al repositorio.

## Uso

- Escribe un mensaje y pulsa **Enter** para enviarlo (**Shift + Enter** añade un salto de línea).
- **Panel izquierdo (historial):** nueva conversación, lista de conversaciones anteriores y botón para borrarlas.
- **Panel derecho (uso de tokens):** total de tokens, tokens de prompt y de completado, tiempo de la última respuesta, tokens por segundo, tiempo medio de respuesta y modelo usado. "Borrar sesión" reinicia los mensajes y las estadísticas de la conversación actual.
- En pantallas pequeñas, los dos paneles se abren como paneles deslizables desde la cabecera.
- El historial y las estadísticas se guardan en el `localStorage` del navegador: sobreviven a las recargas, pero solo en ese navegador y dispositivo (no hay backend ni base de datos).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción (requiere `build` antes) |

> El paquete `ai` (Vercel AI SDK) quedó del scaffold inicial de v0 y ya no se usa: la llamada a Groq se reescribió con `fetch`. Se puede quitar con `npm uninstall ai`.

## Autor

**Diego Reynoso Flores** · [GitHub](https://github.com/DiegoReynoso04)
