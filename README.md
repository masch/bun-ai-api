# 🚀 Bun AI API Proxy

A high-performance, streaming-first AI API proxy built with [Bun](https://bun.sh). It provides a unified `/chat` interface and automatically rotates through multiple AI providers using a round-robin strategy.

## ✨ Features

- ⚡ **Ultra-Fast**: Powered by Bun's native server and high-speed runtime.
- 🔄 **Smart Rotation**: Automatically rotates between providers (Groq, Cerebras, Gemini) on every request.
- 🌊 **Real-time Streaming**: Full support for Server-Sent Events (SSE) for low-latency responses.
- 🛠️ **Unified API**: Send one standard request format, and the proxy handles provider-specific implementation details.

## 🤖 Supported Models

| Provider | Model |
| :--- | :--- |
| **Google** | `gemini-3-flash-preview` |
| **Groq** | `moonshotai/kimi-k2-instruct-0905` |
| **Cerebras** | `zai-glm-4.6` |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GROQ_API_KEY=your_groq_key
CEREBRAS_API_KEY=your_cerebras_key
GEMINI_API_KEY=your_gemini_key
```

### 3. Start the Server

```bash
bun run dev
```
The server will start on `http://localhost:3000`.

## 📡 Usage

### Chat Endpoint
**POST** `/chat`

Example request using `curl`:

```bash
curl -N -X POST http://localhost:3000/chat \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "Hello! Can you tell me your AI model name and version?"}]}'
```

Example request using `make`:
```bash
make test
```

You can override the target API URL by passing it as an argument:
```bash
make test API_URL=https://your-proxy-server.com
```

## 🛠️ Development

This project uses a `Makefile` for common tasks:

- `make install`: Install dependencies.
- `make dev`: Run the server in watch mode.
- `make test`: Send a test request to the local server.

## 📂 Project Structure

- `index.ts`: Main entry point and server logic.
- `services/`: Provider-specific implementations (Gemini, Groq, Cerebras).
- `types.ts`: Shared TypeScript interfaces.

## 📝 TODO

- [ ] Add API_KEY authentication.
- [x] Add unit test.
- [x] Refactor to external handlers.
- [x] Add healthcheck endpoint.
- [x] Auto deploy on main branch push.
- [x] Add Gemini AI service integration.
- [x] Add Groq AI service integration.
- [x] Add Cerebras AI service integration.
- [x] Deploy on production.

