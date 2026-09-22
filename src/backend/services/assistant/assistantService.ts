import { repository } from '../../repositories';
import { aiService } from '../ai/aiService';
import { HybridRetrievalService } from '../retrieval/hybridRetrievalService';
import { LegalKnowledgeEngine } from '../legalKnowledge/legalKnowledgeEngine';
import { CONSTANTS } from '../../config/constants';
import { PromptSecurity } from '../../utils/promptSecurity';
import { AssistantResultSchema } from '../../schemas/aiResultSchemas';
import { z } from 'zod';

export type AssistantResult = z.infer<typeof AssistantResultSchema>;

export class AssistantService {
  /**
   * Answers user questions about a document using hybrid clause retrieval and authoritative statutory law
   */
  static async askAssistant(
    documentId: string, 
    queryText: string, 
    _history?: Array<{ role: string; text: string }>,
    preferences?: { language?: string; responseStyle?: string; explanationPreference?: string }
  ): Promise<AssistantResult> {
    let clauses = await repository.listByDocument(documentId);
    if (!clauses || clauses.length === 0) {
      clauses = await repository.listByDocument('doc-rental');
    }

    // 1. Retrieve most relevant contract clauses
    const { relevantClauses } = HybridRetrievalService.retrieve(queryText, clauses, null, 2);
    const topClause = relevantClauses[0];

    // 2. Retrieve authoritative statutory law
    const issues = LegalKnowledgeEngine.extractLegalIssues(queryText);
    const applicableLaw = await LegalKnowledgeEngine.retrieveApplicableLaw(issues);

    let styleInstruction = 'Answer accurately using ONLY the provided document clauses and retrieved legal authorities. Cite specific sections and pages.';
    if (preferences) {
      const { language, responseStyle, explanationPreference } = preferences;
      if (language === 'hinglish') {
        styleInstruction += ' Respond primarily in Hinglish (a mix of Hindi written in English script and English).';
      }
      if (responseStyle === 'concise') {
        styleInstruction += ' Keep the response very concise and to the point.';
      } else if (responseStyle === 'detailed') {
        styleInstruction += ' Provide a very detailed response with thorough analysis of the surrounding provisions.';
      }
      if (explanationPreference === 'simple') {
        styleInstruction += ' Explain legal concepts in simple, easy-to-understand terms for a layperson.';
      } else if (explanationPreference === 'technical') {
        styleInstruction += ' Use precise technical legal terminology suitable for a legal professional.';
      }
    }

    // 3. Prompt construction with strict boundary isolation
    const systemInstruction = PromptSecurity.getBaseSystemInstruction(
      `You are the LEXFLOW Legal Q&A Assistant. ${styleInstruction} Do not guarantee outcomes.`
    );

    const wrappedUser = PromptSecurity.wrapUntrustedUserInput(queryText);
    const wrappedDoc = PromptSecurity.wrapUntrustedDocument(
      relevantClauses.map(c => `[${c.section}] ${c.title} (Page ${c.pageNumber}): ${c.fullText}`).join('\n\n'),
      documentId
    );
    const wrappedLaw = PromptSecurity.wrapRetrievedAuthorities(applicableLaw);

    const prompt = `${wrappedUser}

${wrappedDoc}

${wrappedLaw}

Respond with a precise, factual, evidence-backed answer. If the document is silent on a matter, explicitly state that. Always cite the clause and statutory section where applicable.`;

    const reply = await aiService.generateText(prompt, {
      systemInstruction,
      temperature: 0.2,
    });

    const authoritiesList = applicableLaw.map(a => ({
      title: a.title,
      sectionOrArticle: a.sectionOrArticle,
      summary: a.summary,
    }));

    return {
      reply,
      clauseRef: topClause ? {
        section: topClause.section,
        page: topClause.pageNumber,
        text: topClause.summary || topClause.fullText,
      } : undefined,
      authorities: authoritiesList,
      suggestedPrompts: [
        'What happens if I miss the rent due date?',
        'Can the landlord deduct painting costs from my deposit?',
        'What questions should I ask my lawyer regarding this contract?'
      ],
      disclaimer: CONSTANTS.LEGAL_DISCLAIMER,
    };
  }
}
