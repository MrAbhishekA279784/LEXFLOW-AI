/**
 * LEXFLOW Token Budget and Centralized AI Configuration
 * Controls context allocations, model parameters, and safety limits.
 */

import { env } from '../../../config/env';

export interface AgentModelConfig {
  model: string;
  maxOutputTokens: number;
  temperature: number;
  maxContextTokens: number;
}

export const AI_CONFIG = {
  provider: 'gemini' as const,
  defaultModel: env.AI_MODEL || 'gemini-3.8-flash',
  maxRetries: 2,
  timeoutMs: 30_000,
  
  // Context allocations
  AGENT_CONTEXT_MAX_TOKENS: 3500,
  AGENT_OUTPUT_MAX_TOKENS: 1500,
  SKEPTIC_CONTEXT_MAX_TOKENS: 2500,
  DEBATE_CONTEXT_MAX_TOKENS: 2000,

  // Debate limits
  MAX_DEBATE_ROUNDS: 3,
  MAX_AGENT_CALLS_PER_ANALYSIS: 8,

  // Per-agent fine-tuned parameters
  opposingCounsel: {
    model: env.AI_MODEL || 'gemini-3.8-flash',
    maxOutputTokens: 1400,
    temperature: 0.15,
    maxContextTokens: 3500,
  },
  defense: {
    model: env.AI_MODEL || 'gemini-3.8-flash',
    maxOutputTokens: 1400,
    temperature: 0.15,
    maxContextTokens: 3500,
  },
  complianceReviewer: {
    model: env.AI_MODEL || 'gemini-3.8-flash',
    maxOutputTokens: 1600,
    temperature: 0.1,
    maxContextTokens: 3500,
  },
  skeptic: {
    model: env.AI_MODEL || 'gemini-3.8-flash',
    maxOutputTokens: 1400,
    temperature: 0.1,
    maxContextTokens: 2500,
  },
  synthesis: {
    model: env.AI_MODEL || 'gemini-3.8-flash',
    maxOutputTokens: 1500,
    temperature: 0.2,
    maxContextTokens: 3000,
  }
};

/**
 * Rough character-to-token estimator (~4 chars per token for English legal text)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
