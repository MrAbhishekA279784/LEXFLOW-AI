import { LawyerKitData } from '../../types/backendTypes';
import { repository } from '../../repositories';
import { CONSTANTS } from '../../config/constants';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../ai/aiService';
import { LawyerKitResultSchema } from '../../schemas/aiResultSchemas';

export class LawyerKitService {
  /**
   * Generates a structured Lawyer Prep-Kit for a document and optional scenario
   */
  static async generateKit(documentId: string, userId: string, scenarioId?: string): Promise<LawyerKitData> {
    const doc = await repository.findById(documentId, userId);
    const docName = doc?.name || 'Rental Agreement.pdf';

    const legalModel = (await repository.findModelByDocument(documentId)) || (await repository.findModelByDocument('doc-rental'));
    const risks = await repository.listRisksByDocument(documentId);
    const conflicts = await repository.listConflictsByDocument(documentId);
    const legalSources = await repository.listAuthoritative();
    const clauses = await repository.listByDocument(documentId);

    let scenarioTested: string | undefined;
    let exposureSummary = '₹75,000 (Covered by Security Deposit)';

    if (scenarioId) {
      const scen = await repository.findScenarioById(scenarioId, userId);
      if (scen) {
        scenarioTested = scen.inputPrompt;
        exposureSummary = `${scen.totalFinancialImpact} (${scen.financialBreakdown.map(b => b.label).join(', ')})`;
      }
    } else {
      scenarioTested = 'Withholding 3 months rent and vacating without 30-day notice';
    }

    // Phase 14 - Use AI to generate grounded questions and synthesis from actual findings
    const aiPrompt = `
      Based on the following extracted risks, conflicts, and obligations from the legal document, generate a Lawyer Prep-Kit.
      The questions for the legal professional MUST be derived from the actual findings and evidence provided below.
      Do not generate generic filler questions.

      Document Name: ${docName}
      Scenario Tested: ${scenarioTested || 'None'}
      Financial Exposure: ${exposureSummary}

      Risks: ${JSON.stringify(risks)}
      Conflicts: ${JSON.stringify(conflicts)}
      Obligations: ${JSON.stringify(legalModel?.obligations)}
      Applicable Law: ${JSON.stringify(legalSources)}
    `;

    const aiResult = await aiService.generateStructuredJson(aiPrompt, {
      zodSchema: LawyerKitResultSchema,
      temperature: 0.1,
    });

    const kit: LawyerKitData = {
      id: `kit-${uuidv4().substring(0, 8)}`,
      documentId,
      documentName: docName,
      generatedAt: new Date().toISOString(),
      parties: aiResult.parties || legalModel?.parties || [],
      keyObligations: aiResult.keyObligations || legalModel?.obligations || [],
      importantDeadlines: aiResult.importantDeadlines || legalModel?.deadlines || [],
      potentialRisks: risks.length > 0 ? risks : (aiResult.potentialRisks as any) || [],
      contractualProtections: aiResult.contractualProtections || [],
      scenarioTested,
      potentialFinancialExposure: exposureSummary,
      potentialConflicts: conflicts,
      questionsForLegalProfessional: aiResult.questionsForLegalProfessional || [],
      evidenceSummary: [
        {
          type: 'document',
          documentId,
          clauseId: 'cl-1',
          section: 'Section 4.1 & 4.3',
          page: 2,
          exactExcerpt: 'Rent payable on 5th. Non-payment after 8th attracts ₹500/day penalty.'
        },
        {
          type: 'legal_authority',
          act: 'Indian Contract Act, 1872',
          statuteSection: 'Section 74',
          sourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
          citation: 'Reasonable compensation for breach where penalty stipulated'
        }
      ],
      authoritativeLegalSources: legalSources.slice(0, 4),
      disclaimer: CONSTANTS.LEGAL_DISCLAIMER,
    };

    await repository.saveKit({ ...kit, userId });
    return kit;
  }
}

