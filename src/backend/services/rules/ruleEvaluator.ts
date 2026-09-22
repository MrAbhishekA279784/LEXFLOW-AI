import { LegalModelData } from '../../types/backendTypes';

export interface RuleEvaluationContext {
  model: LegalModelData;
  scenarioEvents: Array<{
    type: string;
    durationMonths?: number;
    amount?: number;
    description?: string;
  }>;
}

export interface RuleTriggerResult {
  ruleId: string;
  conditionName: string;
  isTriggered: boolean;
  consequences: string[];
  governingClauseRef?: string;
  statutoryCheck: string;
}

export class RuleEvaluator {
  /**
   * Deterministically evaluates whether conditions and breach thresholds are satisfied.
   */
  static evaluate(context: RuleEvaluationContext): RuleTriggerResult[] {
    const results: RuleTriggerResult[] = [];
    const { model, scenarioEvents } = context;

    const hasMissedPayment = scenarioEvents.some(e => e.type === 'miss_payment');
    const missedMonths = scenarioEvents.find(e => e.type === 'miss_payment')?.durationMonths || 0;
    const hasVacatedEarly = scenarioEvents.some(e => e.type === 'vacate_property' || e.type === 'break_notice');

    // Rule 1: Rent Grace Period & Late Fee Trigger
    const rentClause = model.payments.find(p => p.purpose === 'rent');
    const penaltyClause = model.penalties.find(p => p.penaltyType === 'daily_fine');

    if (hasMissedPayment) {
      results.push({
        ruleId: 'RULE-LATE-PENALTY',
        conditionName: 'Grace Period Expiration & Late Penalty Accrual',
        isTriggered: true,
        consequences: [
          `Rent non-payment past the 5th and post-grace period triggers late surcharge of ₹${penaltyClause?.rate || 500}/day.`,
          'Landlord accrues legal right to issue formal demand notice for rent arrears.'
        ],
        governingClauseRef: penaltyClause?.sourceClauseId || 'Section 4.3',
        statutoryCheck: 'Under Indian Contract Act Sec 74, punitive daily fines compounding beyond reasonable compensation are scrutinizable by civil courts.'
      });
    }

    // Rule 2: Material Default Threshold (>30 days non-payment)
    if (missedMonths >= 1) {
      results.push({
        ruleId: 'RULE-MATERIAL-BREACH',
        conditionName: 'Material Contractual Default Threshold',
        isTriggered: true,
        consequences: [
          'Failure to remedy non-payment within 30 days classifies as a fundamental material breach.',
          'Lessor acquires unconditional right to terminate tenancy and demand immediate handover.'
        ],
        governingClauseRef: 'Section 4.3 & Section 12.1',
        statutoryCheck: 'Transfer of Property Act, 1882 Section 111(g) requires formal written notice of forfeiture determination.'
      });
    }

    // Rule 3: Early Departure Without 30-Day Notice (Lock-in / Notice breach)
    if (hasVacatedEarly) {
      const termClause = model.termination[0];
      results.push({
        ruleId: 'RULE-NOTICE-BREACH',
        conditionName: 'Unilateral Vacating Without 30-Day Mandatory Notice',
        isTriggered: true,
        consequences: [
          `Breach of mandatory ${termClause?.noticePeriodDays || 30}-day notice period.`,
          'Contract permits lessor to adjust notice period rent directly from security deposit balance.',
          'Tenant remains liable for electricity, water utility settlement, and peaceful key restoration.'
        ],
        governingClauseRef: termClause?.sourceClauseId || 'Section 12.1',
        statutoryCheck: 'Under Kailash Nath Associates v. DDA (2015), total deposit retention is lawful only to the extent of actual accrued arrears and provable damages.'
      });
    }

    return results;
  }
}
