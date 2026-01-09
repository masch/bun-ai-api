import { expect, test, describe, mock, beforeAll, afterAll } from "bun:test";

mock.module("../services/groq", () => ({
    groqServices: {
        name: "Mock Groq",
        chat: async () => (async function* () { yield "mock groq response"; })()
    }
}));

mock.module("../services/cerebras", () => ({
    cerebrasServices: {
        name: "Mock Cerebras",
        chat: async () => (async function* () { yield "mock cerebras response"; })()
    }
}));

mock.module("../services/gemini", () => ({
    geminiServices: {
        name: "Mock Gemini",
        chat: async () => (async function* () { yield "mock gemini response"; })()
    }
}));

const { app } = await import("../index");
const handler = (req: Request) => app.fetch(req);

// Better to just spy on console
const originalLog = console.log;
const originalError = console.error;

describe("Chat Endpoints", () => {
    beforeAll(() => {
        console.log = () => { };
        console.error = () => { };
    });

    afterAll(() => {
        console.log = originalLog;
        console.error = originalError;
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
        const req = new Request("http://localhost/chat", {
            method: "POST",
            body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
            headers: { "Content-Type": "application/json" }
        });

        const res = await handler(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");

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

        // Note: Since this is a separate test file, the service rotation index 
        // will start fresh if the app instance is fresh or the services module is fresh.
        // However, if Bun caches the imported app across tests, it might be different.
        // In Bun, each test file usually runs in its own environment.

        const res1 = await callChat();
        const res2 = await callChat();
        const res3 = await callChat();
        const res4 = await callChat();

        expect(res1).toBe("mock groq response");
        expect(res2).toBe("mock cerebras response");
        expect(res3).toBe("mock gemini response");
        expect(res4).toBe("mock groq response");
    });
});
