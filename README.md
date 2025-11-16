# TBD GPT - Unified AI Interface

A modern, unified web interface for multiple AI assistants including Claude, ChatGPT, Gemini, and Perplexity. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

### 🤖 Multi-Provider Support
- **Claude** - Anthropic's advanced AI assistant
- **ChatGPT** - OpenAI's conversational AI
- **Gemini** - Google's multimodal AI
- **Perplexity** - AI-powered search and answers

### 💬 Conversation Management
- Create and organize multiple conversations
- Search through conversation history
- Filter conversations by AI provider
- Delete unwanted conversations
- Auto-save all conversations locally

### 🎨 Customization
- Light/Dark/System theme support
- Adjustable font sizes
- Code syntax highlighting themes
- Provider-specific color coding
- Collapsible sidebar

### 📤 Export & Share
- Export conversations as JSON
- Export conversations as Markdown
- Export conversations as plain text
- Copy individual messages

### 🔒 Privacy-Focused
- All data stored locally in browser
- API keys never leave your device
- No server-side data collection
- Complete offline functionality (after API configuration)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TBD-GPT
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server (binds to `0.0.0.0:4000`):
```bash
npm run dev
```

4. Open [http://localhost:4000](http://localhost:4000) in your browser

### Configuration

1. Copy `.env.example` to `.env.local`
```bash
cp .env.example .env.local
```
2. Fill in the OpenRouter env vars (`OPENROUTER_API_KEY`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`).
3. Start the app (locally or via Docker) and add your API key in the in-app settings modal as well.

**Note**: This app uses OpenRouter.ai as a unified backend for all AI providers. OpenRouter provides access to Claude, GPT-4, Gemini, Perplexity and many other models through a single API key, making it easier to manage and more cost-effective.

### Docker

You can build and run the app inside a container:

```bash
docker build -t elint-gpt .
docker run --env-file .env.local -p 4000:4000 elint-gpt
```

The container exposes port `4000` and binds to all interfaces (`0.0.0.0`), mirroring the local dev/start scripts.

To keep configuration files editable from your host, use the provided `docker-compose.yml`, which mounts the core config files (`next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`) into the container read-only:

```bash
docker compose up --build
```

Your `.env.local` is automatically loaded (via `env_file`). Update configs locally and restart the compose service to see changes without rebuilding the whole image.

## Project Structure

```
tbd-gpt/
├── src/
│   ├── app/
│   │   ├── api/               # App Router API routes (e.g., /api/chat)
│   │   ├── globals.css        # Global styles with Tailwind
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Main application page
│   ├── components/            # UI building blocks
│   ├── data/                  # Prompt library data
│   ├── lib/                   # Helpers (e.g., LLM configs)
│   └── types/                 # Shared TypeScript types
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.mjs         # PostCSS configuration
├── eslint.config.mjs          # ESLint configuration
├── docker-compose.yml         # Compose setup with mounted configs
├── Dockerfile                 # Multi-stage build for production
└── README.md
```

## Environment Variables

```
OPENROUTER_API_KEY=sk-or-your-key
OPENROUTER_SITE_URL=http://localhost:4000
OPENROUTER_APP_NAME=TBD-GPT
```

`OPENROUTER_API_KEY` is required. The `SITE_URL` and `APP_NAME` values help OpenRouter attribute requests to your deployment.

## Available Scripts

- `npm run dev` - Start development server on 0.0.0.0:4000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
