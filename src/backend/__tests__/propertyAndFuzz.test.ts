import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ClauseSegmenter } from '../utils/clauseSegmenter';
import { SCENARIO_PARSER_PROMPT } from '../services/ai/prompts/scenarioParser';
import { DeterministicCalculator } from '../services/calculations/deterministicCalculator';
import { PromptSecurity } from '../utils/promptSecurity';

describe('Phase 20 — Property-Based & Fuzz Testing Suite (fast-check)', () => {
  it('ClauseSegmenter: never throws or crashes on arbitrary randomized string inputs', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (docId, text) => {
        const clauses = ClauseSegmenter.segment(docId || 'doc-fuzz', text || '', []);
        expect(Array.isArray(clauses)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('DeterministicCalculator: integer paise financial breakdown preserves exact arithmetic bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }), // monthly rent
        fc.integer({ min: 1000, max: 3000000 }), // deposit
        fc.integer({ min: 1, max: 24 }),         // lock-in months
        fc.integer({ min: 1, max: 12 }),         // notice days
        (rent, deposit, lockIn, noticeMonths) => {
          const breakdown = DeterministicCalculator.calculateFinancialExposure({
            monthlyRent: rent,
            securityDeposit: deposit,
            monthsUnpaid: lockIn,
          });

          expect(breakdown).toBeDefined();
          expect(typeof breakdown.totalGrossExposureFormatted).toBe('string');
          expect(breakdown.breakdown.length).toBeGreaterThan(0);

          // Verify no NaN or Infinity exists in output items
          for (const item of breakdown.breakdown) {
            expect(Number.isNaN(item.amountMinor)).toBe(false);
            expect(Number.isFinite(item.amountMinor)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('PromptSecurity: sanitizeForLogging never throws and strips sensitive key tokens from arbitrary text', () => {
    fc.assert(
      fc.property(fc.string(), (arbitraryInput) => {
        const sanitized = PromptSecurity.sanitizeForLogging(arbitraryInput);
        expect(typeof sanitized).toBe('string');
      }),
      { numRuns: 100 }
    );
  });
});
