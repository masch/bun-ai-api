import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { handleHealthCheck } from "./handlers/health";
import { handleChat } from "./handlers/chat";
import { handleNotFound } from "./handlers/notfound";

const app = new Hono();

// Add logger middleware for better visibility
app.use('*', logger());

// Health check endpoint
app.get('/healthcheck', (c) => handleHealthCheck());

// Chat endpoint
app.post('/chat', (c) => handleChat(c.req.raw));

// Fallback for 404
app.notFound(handleNotFound);

export default {
    port: process.env.PORT ?? 3000,
    fetch: app.fetch,
};

// Also export app for testing
export { app };
