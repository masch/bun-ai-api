import type { AIService } from '../types';
import { cerebrasServices } from './cerebras';
import { geminiServices } from './gemini';
import { groqServices } from './groq';

export const services: AIService[] = [groqServices, cerebrasServices, geminiServices];

let currentServiceIndex = 0;

export function getNextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}
