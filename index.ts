import { handleHealthCheck } from "./handlers/health";
import { handleChat } from "./handlers/chat";

export const handler = async (req: Request) => {
    const { pathname } = new URL(req.url);

    if (req.method === 'GET' && pathname === '/healthcheck') {
        return handleHealthCheck();
    }

    if (req.method === 'POST' && pathname === '/chat') {
        return handleChat(req);
    }

    return new Response('Not Found', { status: 404 });
};

if (import.meta.main) {
    const server = Bun.serve({
        port: process.env.PORT ?? 3000,
        fetch: handler,
    });
    console.log(`Listening on http://localhost:${server.port}`);
}
