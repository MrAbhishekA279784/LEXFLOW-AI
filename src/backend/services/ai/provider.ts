import { z } from 'zod';

export interface GenerateTextOptions {
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface GenerateStructuredJsonOptions<T> {
  systemInstruction?: string;
  schemaDescription?: string;
  temperature?: number;
  timeoutMs?: number;
  zodSchema?: z.ZodSchema<T>;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: GenerateTextOptions): Promise<string>;
  generateStructuredJson<T>(prompt: string, options?: GenerateStructuredJsonOptions<T>): Promise<T>;
  generateEmbedding(text: string): Promise<number[]>;
}
