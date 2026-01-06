import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIService, ChatMessage } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiServices: AIService = {
    name: 'Gemini',
    chat: async (messages: ChatMessage[]) => {
        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: systemMessage?.content,
        });

        // Convert messages to Gemini format
        const history = chatMessages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const lastMessage = chatMessages[chatMessages.length - 1];
        if (!lastMessage) {
            throw new Error('No chat messages provided');
        }

        const result = await model.generateContentStream({
            contents: [
                ...history,
                {
                    role: lastMessage.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: lastMessage.content }],
                }
            ],
        });

        return (async function* () {
            for await (const chunk of result.stream) {
                yield chunk.text();
            }
        })();
    }
}
