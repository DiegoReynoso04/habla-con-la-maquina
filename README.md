English | [Español](README.es.md)

# Chat Usage Dashboard

Chat interface connected to the [Groq](https://groq.com) API that, besides chatting, shows the session's token usage in real time (prompt and completion tokens, response time, tokens per second…) and keeps a conversation history in the browser.

Project for the **AI Engineering bootcamp at 4Geeks Academy**: "Building a chat interface with a real AI API". The base UI was generated with [Vercel v0](https://v0.app) and I implemented the API connection by hand with `fetch`, with no third-party SDKs, as the assignment required.

## Tech stack

- **[Next.js 16](https://nextjs.org/)** (App Router): frontend and internal API endpoint.
- **[React 19](https://react.dev/)** and **[TypeScript](https://www.typescriptlang.org/)**.
- **[Tailwind CSS 4](https://tailwindcss.com/)**, **[shadcn](https://ui.shadcn.com/)** and **[Base UI](https://base-ui.com/)**: styles and components.
- **[lucide-react](https://lucide.dev/)**: icons.
- **[react-markdown](https://github.com/remarkjs/react-markdown)** (+ `remark-gfm`, `rehype-raw`, `rehype-sanitize`): renders the model's Markdown (tables, bold, lists) while filtering out unsafe HTML.
- **[Groq API](https://console.groq.com/docs)**: model inference. Called with `fetch` at `https://api.groq.com/openai/v1/chat/completions` (OpenAI-compatible format), with no SDK in between.
- **[Vercel Analytics](https://vercel.com/analytics)**: basic analytics, production only.

## Folder structure

```
habla-con-la-maquina/
├── app/
│   ├── api/chat/route.ts       # POST endpoint that calls the Groq API
│   ├── globals.css             # Theme variables and base styles
│   ├── layout.tsx              # Root layout (fonts, metadata, analytics)
│   └── page.tsx                # Main page (renders <ChatWindow />)
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── chat-window.tsx         # Main component: state, sending messages, history
│   ├── history-sidebar.tsx     # Side panel with saved conversations
│   ├── message-input.tsx       # Message text box
│   ├── message-list.tsx        # Message list + Markdown rendering
│   └── stats-sidebar.tsx       # Token usage statistics panel
├── lib/
│   ├── chat-types.ts           # Types and helpers (conversations, stats, token accumulation)
│   └── utils.ts                # `cn()` helper to merge Tailwind classes
└── public/                     # Static files
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DiegoReynoso04/habla-con-la-maquina.git
   cd habla-con-la-maquina
   ```
2. Install the dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   > `--legacy-peer-deps` avoids peer dependency conflicts: some packages don't officially declare React 19 support yet.
3. Create a `.env.local` file in the root with your Groq key:
   ```env
   GROQ_API_KEY=your_groq_key
   CHAT_MODEL=openai/gpt-oss-20b
   ```
   Get a free key at [console.groq.com/keys](https://console.groq.com/keys).
4. Start the development server and open [http://localhost:3000](http://localhost:3000):
   ```bash
   npm run dev
   ```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key. Used only on the server (`app/api/chat/route.ts`); it never reaches the browser. |
| `CHAT_MODEL` | No | Groq model. Defaults to `openai/gpt-oss-20b`. See [available models](https://console.groq.com/docs/models). |

**Important:** the file must be named `.env.local`. The `.gitignore` only excludes files ending in `.local`, which is what keeps your key out of the repository.

## Usage

- Type a message and press **Enter** to send it (**Shift + Enter** adds a line break).
- **Left panel (history):** new conversation, list of previous conversations and a button to delete them.
- **Right panel (token usage):** total tokens, prompt and completion tokens, last response time, tokens per second, average response time and model used. The "Borrar sesión" (clear session) button resets the messages and stats of the current conversation.
- On small screens, both panels open as slide-over panels from the header.
- History and stats are saved in the browser's `localStorage`: they survive reloads, but only on that browser and device (there is no backend or database).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server at `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serves the production build (run `build` first) |

> The `ai` package (Vercel AI SDK) is left over from the initial v0 scaffold and is no longer used: the Groq call was rewritten with `fetch`. It can be removed with `npm uninstall ai`.

## Author

**Diego Reynoso Flores** · [GitHub](https://github.com/DiegoReynoso04)
