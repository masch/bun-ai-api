import { groqServices } from "./services/groq";
import { cerebrasServices } from "./services/cerebras";
import { geminiServices } from "./services/gemini";
import type { AIService, ChatMessage } from "./types";
import { handleHealthCheck } from "./handlers/health";

const services: AIService[] = [
    groqServices,
    cerebrasServices,
    geminiServices
    // OpenRouter
];
let currentServiceIndex = 0;

function getNextService() {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}

const server = Bun.serve({
    port: process.env.PORT ?? 3000,
    async fetch(req) {
        const { pathname } = new URL(req.url);

        if (req.method === 'GET' && pathname === '/health') {
            return handleHealthCheck();
        }

        if (req.method !== 'POST' || pathname !== '/chat') {
            return new Response('Not Found', { status: 404 });
        }

        const { messages } = await req.json() as { messages: ChatMessage[] };
        const service = getNextService();

        console.log(`Using service ${service?.name}`)
        const stream = await service?.chat(messages);

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    },
});

console.log(`Listening on http://localhost:${server.port}`);
