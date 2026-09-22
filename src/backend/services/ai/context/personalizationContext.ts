/**
 * LEXFLOW Personalization Context
 * Loads user preferences from Supabase/memory and applies explanation styling.
 * 
 * CRITICAL DIRECTIVE:
 * Personalization can change HOW the answer is explained.
 * It must NEVER change:
 * - legal facts
 * - cited statutes
 * - contract clauses
 * - calculations
 * - evidence
 * - compliance status
 * - risk classification
 * - legal applicability
 */

import { getSupabaseClient } from '../../../db/client';
import { memoryStore } from '../../../repositories/memoryStore';
import { logger } from '../../../utils/logger';

export interface UserAIPreferences {
  userId: string;
  displayName?: string;
  language: 'English' | 'Hinglish' | 'Hindi';
  responseStyle: 'professional' | 'friendly' | 'direct' | 'simplified';
  explanationMode: 'detailed' | 'concise' | 'bulleted';
  formatPreference: 'bullets' | 'paragraphs' | 'executive_summary';
}

const DEFAULT_PREFERENCES: Omit<UserAIPreferences, 'userId'> = {
  language: 'English',
  responseStyle: 'professional',
  explanationMode: 'detailed',
  formatPreference: 'bullets',
};

// In-memory cache for user preferences
const preferencesCache = new Map<string, UserAIPreferences>();

export async function getUserAIContext(userId: string): Promise<UserAIPreferences> {
  if (preferencesCache.has(userId)) {
    return preferencesCache.get(userId)!;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_ai_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data && !error) {
        const profile: UserAIPreferences = {
          userId,
          displayName: data.display_name || undefined,
          language: data.language || 'English',
          responseStyle: data.response_style || 'professional',
          explanationMode: data.explanation_mode || 'detailed',
          formatPreference: data.format_preference || 'bullets',
        };
        preferencesCache.set(userId, profile);
        return profile;
      }
    } catch (err) {
      logger.warn(`Failed to fetch user_ai_preferences for ${userId} from Supabase: ${String(err)}`);
    }
  }

  // Fallback / default
  const defaultProfile: UserAIPreferences = {
    userId,
    ...DEFAULT_PREFERENCES
  };
  preferencesCache.set(userId, defaultProfile);
  return defaultProfile;
}

export async function saveUserAIContext(prefs: UserAIPreferences): Promise<UserAIPreferences> {
  preferencesCache.set(prefs.userId, prefs);
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('user_ai_preferences').upsert({
        user_id: prefs.userId,
        display_name: prefs.displayName,
        language: prefs.language,
        response_style: prefs.responseStyle,
        explanation_mode: prefs.explanationMode,
        format_preference: prefs.formatPreference,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (err) {
      logger.warn(`Failed to upsert user_ai_preferences for ${prefs.userId}: ${String(err)}`);
    }
  }
  return prefs;
}

/**
 * Applies personalized phrasing ONLY to the explanatory layer.
 * Underlying legal facts, statutes, and citations remain 100% invariant.
 */
export function formatPersonalizedSummary(params: {
  baseSummary: string;
  preferences: UserAIPreferences;
  userName?: string;
}): string {
  const { baseSummary, preferences } = params;
  const name = preferences.displayName || params.userName;
  const greeting = name ? `${name}, ` : '';

  if (preferences.language === 'Hinglish') {
    if (preferences.responseStyle === 'friendly' || preferences.responseStyle === 'simplified') {
      return `${greeting}simple terms mein, is audit ka main outcome yeh hai:\n\n${baseSummary}\n\n*Note: Yeh informational analysis hai, legal advice nahi. Detailed steps ke liye Lawyer Prep-Kit refer karein.*`;
    }
    return `${greeting}is document analysis ke key statutory aur contractual findings niche diye gaye hain:\n\n${baseSummary}`;
  }

  if (preferences.responseStyle === 'direct') {
    return `Executive Analysis:\n${baseSummary}`;
  }

  if (preferences.responseStyle === 'friendly') {
    return `${greeting}here is what our legal stress-test revealed regarding your contract:\n\n${baseSummary}`;
  }

  return baseSummary;
}
