import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { app } from "../index";

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

        const res1 = await callChat();
        const res2 = await callChat();
        const res3 = await callChat();

        expect(res1).toBe("mock cerebras response");
        expect(res2).toBe("mock gemini response");
        expect(res3).toBe("mock groq response");
    });
});
