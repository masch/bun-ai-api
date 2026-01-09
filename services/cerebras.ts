import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { AIService, ChatMessage } from '../types';

const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });

interface CerebrasResponseChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

export const cerebrasServices: AIService = {
  name: 'Cerebras',
  chat: async (messages: ChatMessage[]) => {
    const stream = (await cerebras.chat.completions.create({
      messages: messages as unknown as Cerebras.Chat.ChatCompletionCreateParams['messages'],
      model: 'zai-glm-4.6',
      stream: true,
      max_completion_tokens: 40960,
      temperature: 0.6,
      top_p: 0.95,
    })) as AsyncIterable<CerebrasResponseChunk>;

    return (async function* () {
      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || '';
      }
    })();
  },
};
