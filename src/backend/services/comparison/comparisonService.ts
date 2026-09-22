import { repository } from '../../repositories';
import { aiService } from '../ai/aiService';
import { ComparisonResultSchema, ComparisonDiffItemSchema } from '../../schemas/aiResultSchemas';
import { PromptSecurity } from '../../utils/promptSecurity';
import { z } from 'zod';

export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;

export class ComparisonService {
  /**
   * Compares two documents clause-by-clause, evaluating shift in rights, liabilities, and risk score
   */
  static async compareDocuments(docAId: string, docBId: string, _userId?: string): Promise<ComparisonResult> {
    const docA = await repository.findById(docAId);
    const docB = await repository.findById(docBId);

    const clausesA = await repository.listByDocument(docAId);
    const clausesB = await repository.listByDocument(docBId);

    const docAName = docA?.name || 'Document A';
    const docBName = docB?.name || 'Document B';

    // Construct prompt for structured comparison
    const prompt = `Compare these two legal documents and output a structured comparison with risk and protection deltas:

DOCUMENT A (${docAName}):
${clausesA.map(c => `[${c.section}] ${c.title}: ${c.fullText} (Page ${c.pageNumber})`).join('\n\n')}

DOCUMENT B (${docBName}):
${clausesB.map(c => `[${c.section}] ${c.title}: ${c.fullText} (Page ${c.pageNumber})`).join('\n\n')}

Identify every key contractual change (added, removed, modified clauses), determine if the shift is 'more_restrictive', 'more_protective', or 'neutral' for the party, calculate risk/protection deltas, and provide a clear synthesis recommendation.`;

    const systemInstruction = PromptSecurity.getBaseSystemInstruction(
      'You are the LEXFLOW Document Comparison Engine. Compare two document versions clause-by-clause and calculate exact contractual and risk differentials.'
    );

    const result = await aiService.generateStructuredJson<ComparisonResult>(prompt, {
      systemInstruction,
      zodSchema: ComparisonResultSchema,
      temperature: 0.1,
    });

    return result;
  }
}
