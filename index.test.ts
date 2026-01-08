import { expect, test, describe, mock, beforeAll, afterAll } from "bun:test";

mock.module("./services/groq", () => ({
    groqServices: {
        name: "Mock Groq",
        chat: async () => (async function* () { yield "mock groq response"; })()
    }
}));

mock.module("./services/cerebras", () => ({
    cerebrasServices: {
        name: "Mock Cerebras",
        chat: async () => (async function* () { yield "mock cerebras response"; })()
    }
}));

mock.module("./services/gemini", () => ({
    geminiServices: {
        name: "Mock Gemini",
        chat: async () => (async function* () { yield "mock gemini response"; })()
    }
}));

const { app } = await import("./index");
const handler = (req: Request) => app.fetch(req);

// Better to just spy on console
const originalLog = console.log;
const originalError = console.error;

describe("API Endpoints", () => {
    beforeAll(() => {
        console.log = () => { };
        console.error = () => { };
    });

    afterAll(() => {
        console.log = originalLog;
        console.error = originalError;
    });

    test("GET /healthcheck should return OK", async () => {
        const req = new Request("http://localhost/healthcheck");
        const res = await handler(req);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("OK");
    });

    test("GET /invalid-path should return 404", async () => {
        const req = new Request("http://localhost/invalid-path");
        const res = await handler(req);
        expect(res.status).toBe(404);
        expect(await res.text()).toBe("Not Found");
    });

    test("POST /invalid-path should return 404", async () => {
        const req = new Request("http://localhost/invalid-path", { method: "POST" });
        const res = await handler(req);
        expect(res.status).toBe(404);
        expect(await res.text()).toBe("Not Found");
    });

    test("POST /chat with empty body should return 400", async () => {
        const req = new Request("http://localhost/chat", { method: "POST" });
        const res = await handler(req);
        expect(res.status).toBe(400);
        expect(await res.text()).toBe("Invalid JSON");
    });

    test("POST /chat with invalid messages should return 400", async () => {
        const req = new Request("http://localhost/chat", {
            method: "POST",
            body: JSON.stringify({ wrong: "field" }),
            headers: { "Content-Type": "application/json" }
        });
        const res = await handler(req);
        expect(res.status).toBe(400);
        expect(await res.text()).toBe("Missing or invalid messages");
    });

    test("POST /chat should return a stream from service", async () => {
        // We expect the first service (Groq) to be used first
        const req = new Request("http://localhost/chat", {
            method: "POST",
            body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
            headers: { "Content-Type": "application/json" }
        });

        const res = await handler(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");

        // Read the stream
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        let result = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += new TextDecoder().decode(value);
        }

        expect(result).toBeTruthy();
        expect(result).toBe("mock groq response");
    });

    test("POST /chat should rotate through services", async () => {
        // We already used Groq in the previous test, so next should be Cerebras if state is shared
        // or Groq if it's a new load. Since we imported once, state is likely shared.

        const callChat = async () => {
            const req = new Request("http://localhost/chat", {
                method: "POST",
                body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
                headers: { "Content-Type": "application/json" }
            });
            const res = await handler(req);
            const reader = res.body?.getReader();
            if (!reader) throw new Error("No reader");
            let result = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                result += new TextDecoder().decode(value);
            }
            return result;
        };

        // Assuming we start back at index 0 or continue from 1.
        // Let's just check if it changes.
        const res2 = await callChat();
        const res3 = await callChat();
        const res4 = await callChat();

        // The order should be: Groq (used in prev test), Cerebras, Gemini, Groq...
        // Current test output showed "Mock Groq" for the previous test.
        expect(res2).toBe("mock cerebras response");
        expect(res3).toBe("mock gemini response");
        expect(res4).toBe("mock groq response");
    });
});
