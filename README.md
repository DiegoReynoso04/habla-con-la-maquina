# Chat Usage Dashboard

Interfaz de chat conectada a la API de [Groq](https://groq.com) que, además de conversar, muestra en tiempo real el consumo de tokens de la sesión (tokens de prompt, de completado, tiempo de respuesta, tokens por segundo, etc.) y mantiene un historial de conversaciones guardado en el navegador.

Proyecto realizado para **4Geeks Academy** — "Construyendo una Interfaz de Chat con una API de IA Real". La interfaz base se generó con [v0 de Vercel](https://v0.app) y la conexión con la API se implementó a mano con `fetch`, sin SDKs de terceros, para cumplir con el enunciado del ejercicio.

## Tecnologías y herramientas utilizadas

- **[Next.js 16](https://nextjs.org/)** (App Router) — framework de React, maneja tanto el frontend como el endpoint de API interno.
- **[React 19](https://react.dev/)** — librería de UI.
- **[TypeScript](https://www.typescriptlang.org/)** — tipado estático.
- **[Tailwind CSS 4](https://tailwindcss.com/)** — estilos.
- **[shadcn](https://ui.shadcn.com/)** + **[Base UI](https://base-ui.com/)** — componentes de interfaz (botones, etc.) sin estilos propios, estilizados con Tailwind.
- **[lucide-react](https://lucide.dev/)** — íconos.
- **[react-markdown](https://github.com/remarkjs/react-markdown)** (+ `remark-gfm`, `rehype-raw`, `rehype-sanitize`) — renderiza en formato legible (tablas, negritas, listas, saltos de línea) el Markdown que devuelve el modelo, filtrando cualquier HTML peligroso.
- **[Groq API](https://console.groq.com/docs)** — proveedor de inferencia del modelo de lenguaje. Se llama directamente con `fetch` al endpoint `https://api.groq.com/openai/v1/chat/completions` (formato compatible con OpenAI), sin ningún SDK intermediario.
- **[Vercel Analytics](https://vercel.com/analytics)** — analítica básica, activa solo en producción.

## Estructura de carpetas

```
chat-usage-dashboard/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Endpoint POST que llama a la API de Groq
│   ├── globals.css             # Variables de tema y estilos base
│   ├── layout.tsx              # Layout raíz (fuentes, metadata, analytics)
│   └── page.tsx                # Página principal (renderiza <ChatWindow />)
├── components/
│   ├── ui/                     # Componentes base de shadcn/ui (Button, etc.)
│   ├── chat-window.tsx         # Componente principal: estado, envío de mensajes, historial
│   ├── history-sidebar.tsx     # Panel lateral con las conversaciones guardadas
│   ├── message-input.tsx       # Caja de texto para escribir mensajes
│   ├── message-list.tsx        # Lista de mensajes + renderizado de Markdown
│   └── stats-sidebar.tsx       # Panel con las estadísticas de uso de tokens
├── lib/
│   ├── chat-types.ts           # Tipos y helpers (conversaciones, estadísticas, acumulación de tokens)
│   └── utils.ts                # Helper `cn()` para combinar clases de Tailwind
├── public/                     # Archivos estáticos (favicon, íconos)
├── .env.local                  # Variables de entorno locales (no se versiona)
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Instalación

1. Cloná el repositorio y entrá a la carpeta del proyecto:
   ```bash
   git clone https://github.com/DiegoReynoso04/habla-con-la-maquina.git
   cd habla-con-la-maquina
   ```

2. Instalá las dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```
   > El flag `--legacy-peer-deps` evita conflictos de *peer dependencies* porque algunos paquetes todavía no declaran soporte oficial para React 19.

3. Creá un archivo `.env.local` en la raíz del proyecto (mismo nivel que `package.json`) con tu clave de Groq:
   ```env
   GROQ_API_KEY=tu_clave_de_groq
   CHAT_MODEL=openai/gpt-oss-20b
   ```
   Conseguí tu clave gratis en [console.groq.com/keys](https://console.groq.com/keys).

4. Corré el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `GROQ_API_KEY` | Sí | Clave secreta de la API de Groq. Se usa en el servidor (`app/api/chat/route.ts`) para autenticar cada petición con el header `Authorization: Bearer`. Nunca se expone al navegador. |
| `CHAT_MODEL` | No | Modelo de Groq a usar. Por defecto `openai/gpt-oss-20b`. Ver modelos disponibles en [console.groq.com/docs/models](https://console.groq.com/docs/models). |

**Importante:** el archivo con tus variables de entorno debe llamarse `.env.local` (no `.env` a secas). El `.gitignore` del proyecto solo excluye archivos que terminan en `.local`, así que es la única forma de asegurarte de que tu clave nunca se suba al repositorio.

## Uso

- Escribí un mensaje en el campo de abajo y presioná **Enter** para enviarlo (**Shift + Enter** para agregar un salto de línea sin enviar).
- **Panel izquierdo (Historial):** botón para iniciar una conversación nueva, lista de conversaciones anteriores (podés volver a cualquiera con un clic) y un ícono de basurero para borrar la que ya no necesites.
- **Panel derecho (Uso de tokens):** estadísticas acumuladas de la conversación activa — total de tokens, tokens de prompt, tokens de completado, tiempo de la última respuesta, tokens por segundo, tiempo medio de respuesta y el modelo usado. El botón "Borrar sesión" reinicia los mensajes y las estadísticas de la conversación actual.
- En pantallas chicas, ambos paneles se acceden como paneles deslizables desde los botones del encabezado.
- Todo el historial y las estadísticas se guardan en el `localStorage` del navegador, así que persisten entre recargas de la página (pero son locales a ese navegador y dispositivo — no hay backend ni base de datos).

## Dependencias externas

Además de los paquetes de npm listados en `package.json`, el proyecto depende de un servicio externo:

- **[API de Groq](https://console.groq.com/docs/api-reference)** — provee la inferencia del modelo de lenguaje. Requiere una cuenta gratuita y una API key propia (ver sección de variables de entorno). No requiere tarjeta de crédito para el uso básico.

Paquetes de npm más relevantes (ver `package.json` para la lista completa con versiones):

- `next`, `react`, `react-dom` — framework y librería de UI.
- `@base-ui/react`, `shadcn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` — sistema de componentes y utilidades de estilos.
- `lucide-react` — íconos.
- `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize` — renderizado seguro de Markdown/HTML en las respuestas del asistente.
- `@vercel/analytics` — analítica (solo en producción).
- `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `typescript` — herramientas de build y tipado (dependencias de desarrollo).

> Nota: el paquete `ai` (Vercel AI SDK) quedó instalado del scaffold inicial de v0, pero ya no se usa: la llamada a Groq se reescribió con `fetch` nativo para cumplir con el requisito de no usar SDKs de terceros. Se puede quitar de forma segura con `npm uninstall ai`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo en `http://localhost:3000`. |
| `npm run build` | Genera el build de producción. |
| `npm run start` | Sirve el build de producción (requiere correr `build` antes). |
