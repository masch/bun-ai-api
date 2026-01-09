import { mock } from "bun:test";

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
