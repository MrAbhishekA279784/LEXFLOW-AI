import { GoogleGenAI } from '@google/genai';
import { AIProvider, GenerateStructuredJsonOptions, GenerateTextOptions } from '../provider';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import { CONSTANTS } from '../../../config/constants';
import { deterministicFallbackProvider } from './deterministicFallbackProvider';
import { PromptSecurity } from '../../../utils/promptSecurity';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private client: GoogleGenAI | null = null;
  private quotaExceededUntil = 0;

  private isQuotaExceeded(): boolean {
    return Date.now() < this.quotaExceededUntil;
  }

  private markQuotaExceeded(): void {
    // 60-second circuit breaker cooldown to prevent hammering the API and exhausting/spamming quota
    this.quotaExceededUntil = Date.now() + 60_000;
  }

  private getCandidateModels(): string[] {
    const primary = env.AI_MODEL || 'gemini-3.8-flash';
    const candidates = [primary];
    if (!candidates.includes('gemini-flash-latest')) {
      candidates.push('gemini-flash-latest');
    }
    if (!candidates.includes('gemini-3.1-flash-lite')) {
      candidates.push('gemini-3.1-flash-lite');
    }
    return candidates;
  }

  private classifyError(err: unknown): { is503: boolean; is429: boolean; safeMessage: string } {
    const errStr = String(err);
    const safeMessage = PromptSecurity.sanitizeForLogging(errStr);
    const is503 = errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE') || errStr.includes('temporarily unavailable');
    const is429 = errStr.includes('429') || errStr.includes('exceeded your current quota') || errStr.includes('Quota exceeded') || errStr.includes('RESOURCE_EXHAUSTED');
    return { is503, is429, safeMessage };
  }

  private getClient(): GoogleGenAI | null {
    if (this.client) return this.client;
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '' || env.AI_PROVIDER === 'fallback' || process.env.NODE_ENV === 'test') {
      return null;
    }
    this.client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return this.client;
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<string> {
    if (this.isQuotaExceeded()) {
      return deterministicFallbackProvider.generateText(prompt, options);
    }

    const client = this.getClient();
    if (!client) {
      logger.info('Gemini API key not configured; using deterministic fallback provider');
      return deterministicFallbackProvider.generateText(prompt, options);
    }

    const candidateModels = this.getCandidateModels();
    const timeoutMs = options?.timeoutMs || CONSTANTS.AI_REQUEST_TIMEOUT_MS;

    const baseSystem = PromptSecurity.getBaseSystemInstruction(
      options?.systemInstruction || 'You are the LEXFLOW Legal Intelligence Engine. Analyze legal documents with factual precision.'
    );

    let attempts = 0;
    const maxRetries = CONSTANTS.AI_MAX_RETRIES;

    while (attempts <= maxRetries) {
      const currentModel = candidateModels[attempts % candidateModels.length];
      try {
        attempts++;
        const generatePromise = client.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            systemInstruction: baseSystem,
            temperature: options?.temperature ?? 0.2,
          }
        });

        // Bounded timeout with Promise.race
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const text = response.text || '';
        if (!text) {
          throw new Error('Empty response received from Gemini');
        }
        return text;
      } catch (err) {
        const { is503, is429, safeMessage } = this.classifyError(err);

        if (is429) {
          this.markQuotaExceeded();
          logger.warn('[GeminiProvider] Quota limit encountered (429). Activating 60s cooldown; seamlessly serving deterministic legal fallback.');
          return deterministicFallbackProvider.generateText(prompt, options);
        }

        if (is503) {
          logger.warn(`[GeminiProvider] Model ${currentModel} returned 503 (high demand). Attempt ${attempts}/${maxRetries + 1}.`);
          if (attempts > maxRetries) {
            logger.warn('[GeminiProvider] Gemini 503 retries exhausted; switching safely to deterministic fallback.');
            return deterministicFallbackProvider.generateText(prompt, options);
          }
          const jitter = Math.random() * 400;
          const backoff = Math.min(2500, 800 * Math.pow(1.5, attempts - 1) + jitter);
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }

        logger.warn(`Gemini generation attempt ${attempts} failed: ${safeMessage}`);
        if (attempts > maxRetries) {
          logger.warn('Gemini retries exhausted; switching safely to deterministic fallback');
          return deterministicFallbackProvider.generateText(prompt, options);
        }
        // Jittered backoff
        await new Promise(r => setTimeout(r, 600 * attempts + Math.random() * 200));
      }
    }

    return deterministicFallbackProvider.generateText(prompt, options);
  }

  async generateStructuredJson<T>(prompt: string, options?: GenerateStructuredJsonOptions<T>): Promise<T> {
    if (this.isQuotaExceeded()) {
      return deterministicFallbackProvider.generateStructuredJson<T>(prompt, options);
    }

    const client = this.getClient();
    if (!client) {
      return deterministicFallbackProvider.generateStructuredJson<T>(prompt, options);
    }

    const candidateModels = this.getCandidateModels();
    const timeoutMs = options?.timeoutMs || CONSTANTS.AI_REQUEST_TIMEOUT_MS;

    const baseSystem = PromptSecurity.getBaseSystemInstruction(
      options?.systemInstruction || 'You are the LEXFLOW Structured Legal Engine. Output strictly valid JSON conforming to the requested schema.'
    );

    let attempts = 0;
    const maxRetries = CONSTANTS.AI_MAX_RETRIES;

    const fullPrompt = `${prompt}\n\nIMPORTANT FORMATTING REQUIREMENT:\nReturn ONLY a strictly valid, parseable JSON object matching the schema. No markdown ticks, no preamble, no commentary.`;

    while (attempts <= maxRetries) {
      const currentModel = candidateModels[attempts % candidateModels.length];
      try {
        attempts++;
        const generatePromise = client.models.generateContent({
          model: currentModel,
          contents: fullPrompt,
          config: {
            systemInstruction: baseSystem,
            responseMimeType: 'application/json',
            temperature: options?.temperature ?? 0.1,
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI JSON request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const rawText = response.text || '{}';
        
        // Clean markdown backticks if present
        const cleanedJson = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsed = JSON.parse(cleanedJson);

        // If Zod schema provided, validate strictly
        if (options?.zodSchema) {
          const validation = options.zodSchema.safeParse(parsed);
          if (validation.success) {
            return validation.data;
          }
          logger.warn('AI JSON output failed Zod schema validation, attempting repair fallback', {
            errors: validation.error.flatten(),
          });
          throw new Error(`Zod validation error: ${validation.error.message}`);
        }

        return parsed as T;
      } catch (err) {
        const { is503, is429, safeMessage } = this.classifyError(err);

        if (is429) {
          this.markQuotaExceeded();
          logger.warn('[GeminiProvider] Quota limit encountered (429). Activating 60s cooldown; seamlessly serving deterministic legal fallback.');
          return deterministicFallbackProvider.generateStructuredJson<T>(prompt, options);
        }

        if (is503) {
          logger.warn(`[GeminiProvider] Model ${currentModel} returned 503 (high demand). Attempt ${attempts}/${maxRetries + 1}.`);
          if (attempts > maxRetries) {
            logger.warn('[GeminiProvider] Gemini 503 retries exhausted; switching to deterministic fallback');
            return deterministicFallbackProvider.generateStructuredJson<T>(prompt, options);
          }
          const jitter = Math.random() * 400;
          const backoff = Math.min(2500, 800 * Math.pow(1.5, attempts - 1) + jitter);
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }

        logger.warn(`Gemini JSON attempt ${attempts} failed: ${safeMessage}`);
        if (attempts > maxRetries) {
          logger.warn('Gemini JSON retries exhausted; switching to deterministic fallback');
          return deterministicFallbackProvider.generateStructuredJson<T>(prompt, options);
        }
        await new Promise(r => setTimeout(r, 600 * attempts + Math.random() * 200));
      }
    }

    return deterministicFallbackProvider.generateStructuredJson<T>(prompt, options);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return deterministicFallbackProvider.generateEmbedding(text);
  }
}

export const geminiProvider = new GeminiProvider();
