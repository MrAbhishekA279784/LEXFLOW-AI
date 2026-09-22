import { AIProvider, GenerateStructuredJsonOptions, GenerateTextOptions } from './provider';
import { geminiProvider } from './providers/geminiProvider';
import { deterministicFallbackProvider } from './providers/deterministicFallbackProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class AIService implements AIProvider {
  private activeProvider: AIProvider;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const isRealKey = Boolean(apiKey && !apiKey.startsWith('MY_') && apiKey.trim().length > 15);
    const isTest = Boolean(process.env.VITEST || process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test');

    if (env.AI_PROVIDER === 'gemini' && isRealKey && !isTest) {
      this.activeProvider = geminiProvider;
      logger.info('AIService initialized with GeminiProvider');
    } else {
      this.activeProvider = deterministicFallbackProvider;
      logger.info('AIService initialized with DeterministicFallbackProvider');
    }
  }

  get name(): string {
    return this.activeProvider.name;
  }

  setProvider(provider: AIProvider): void {
    this.activeProvider = provider;
    logger.info(`AIService provider switched to: ${provider.name}`);
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<string> {
    return this.activeProvider.generateText(prompt, options);
  }

  async generateStructuredJson<T>(prompt: string, options?: GenerateStructuredJsonOptions<T>): Promise<T> {
    return this.activeProvider.generateStructuredJson<T>(prompt, options);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.activeProvider.generateEmbedding(text);
  }
}

export const aiService = new AIService();
