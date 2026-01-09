import { getNextService } from '../services';
import type { ChatMessage } from '../types';

export async function handleChat(req: Request) {
  let messages: ChatMessage[];
  try {
    const body = (await req.json()) as { messages: ChatMessage[] };
    messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Missing or invalid messages', { status: 400 });
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new Response('Invalid JSON', { status: 400 });
  }

  try {
    const service = getNextService();
    console.log(`Using service ${service?.name}`);
    const stream = await service?.chat(messages);

    return new Response(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
