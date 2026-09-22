import { 
  FinancialBreakdownItem, 
  ExtractedPayment, 
  ExtractedPenalty, 
  ExtractedTerminationClause 
} from '../../types/backendTypes';

export interface CalculationInput {
  payments: ExtractedPayment[];
  penalties: ExtractedPenalty[];
  termination?: ExtractedTerminationClause[];
  scenarioEvents: Array<{
    type: 'miss_payment' | 'vacate_property' | 'break_notice' | 'damage_property' | 'sublet' | 'refuse_escalation' | 'custom';
    durationMonths?: number;
    amount?: number;
    description?: string;
  }>;
}

export interface CalculationResult {
  totalImpactRupees: string;
  totalImpactMinor: number; // in paise (e.g. 7500000 = 75,000 INR)
  breakdown: FinancialBreakdownItem[];
  isFullyDetermined: boolean;
  undeterminedNotes: string[];
}

export class DeterministicCalculator {
  /**
   * Helper to calculate unpaid rent in paise and formatted string
   */
  static calculateUnpaidRent(monthlyRent: number, months: number): { totalPaise: number; formatted: string; explanation: string } {
    const totalPaise = monthlyRent * 100 * months;
    return {
      totalPaise,
      formatted: this.formatINR(totalPaise),
      explanation: `${months} month${months > 1 ? 's' : ''} at ₹${monthlyRent.toLocaleString('en-IN')}/month`,
    };
  }

  /**
   * Helper to calculate late fees in paise and formatted string respecting grace period
   */
  static calculateLateFees(dailyRate: number, daysDelayed: number, gracePeriodDays = 0): { chargeableDays: number; totalPaise: number; formatted: string } {
    const chargeableDays = Math.max(0, daysDelayed - gracePeriodDays);
    const totalPaise = dailyRate * 100 * chargeableDays;
    return {
      chargeableDays,
      totalPaise,
      formatted: this.formatINR(totalPaise),
    };
  }

  /**
   * Helper to calculate complete financial exposure with deposit offsets
   */
  static calculateFinancialExposure(params: {
    monthlyRent: number;
    monthsUnpaid: number;
    dailyLateFee?: number;
    daysDelayed?: number;
    gracePeriodDays?: number;
    securityDeposit?: number;
    utilityDeductions?: number;
    damageDeductions?: number;
  }): {
    totalGrossExposureFormatted: string;
    netPayableByTenantFormatted: string;
    breakdown: FinancialBreakdownItem[];
  } {
    const rentCalc = this.calculateUnpaidRent(params.monthlyRent, params.monthsUnpaid);
    const lateCalc = this.calculateLateFees(
      params.dailyLateFee || 0,
      params.daysDelayed || 0,
      params.gracePeriodDays || 0
    );

    const grossPaise = rentCalc.totalPaise + lateCalc.totalPaise;
    const utilitiesPaise = (params.utilityDeductions || 0) * 100;
    const damagesPaise = (params.damageDeductions || 0) * 100;
    const depositPaise = (params.securityDeposit || 0) * 100;

    const netPaise = grossPaise + utilitiesPaise + damagesPaise - depositPaise;

    const breakdown: FinancialBreakdownItem[] = [
      {
        label: `Unpaid Rent (${params.monthsUnpaid} mos)`,
        amount: rentCalc.formatted,
        amountMinor: rentCalc.totalPaise,
        calculationFormula: `₹${params.monthlyRent} × ${params.monthsUnpaid}`,
        note: 'Contractual monthly rent accrual',
      },
      {
        label: `Late Fees (${lateCalc.chargeableDays} chargeable days)`,
        amount: lateCalc.formatted,
        amountMinor: lateCalc.totalPaise,
        calculationFormula: `₹${params.dailyLateFee || 0}/day × ${lateCalc.chargeableDays} days`,
        note: 'Accumulated late fee penalty',
      },
      {
        label: 'Security Deposit Offset',
        amount: `-₹${(params.securityDeposit || 0).toLocaleString('en-IN')}`,
        amountMinor: -depositPaise,
        calculationFormula: 'Offset against outstanding dues',
        note: 'Held by landlord',
      },
      {
        label: 'Deductions (Utilities & Damages)',
        amount: `₹${((params.utilityDeductions || 0) + (params.damageDeductions || 0)).toLocaleString('en-IN')}`,
        amountMinor: utilitiesPaise + damagesPaise,
        calculationFormula: 'Itemized damage and utility liabilities',
        note: 'Recoverable from tenant',
      },
    ];

    return {
      totalGrossExposureFormatted: this.formatINR(grossPaise),
      netPayableByTenantFormatted: this.formatINR(netPaise),
      breakdown,
    };
  }

  /**
   * Formats paise (minor unit) into Indian Rupee formatted string (e.g. ₹75,000)
   */
  static formatINR(minorUnits: number): string {
    const rupees = Math.round(minorUnits / 100);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  }

  /**
   * Evaluates deterministic financial consequences strictly based on provided contract payments & penalties.
   * If a value is not in the contract, it explicitly flags it rather than guessing.
   */
  static calculate(input: CalculationInput): CalculationResult {
    const breakdown: FinancialBreakdownItem[] = [];
    let totalMinor = 0;
    let isFullyDetermined = true;
    const undeterminedNotes: string[] = [];

    const rentPayment = input.payments.find(p => p.purpose === 'rent');
    const depositPayment = input.payments.find(p => p.purpose === 'deposit');
    const latePenalty = input.penalties.find(p => p.penaltyType === 'daily_fine' || p.rateUnit === 'per_day');

    for (const event of input.scenarioEvents) {
      if (event.type === 'miss_payment') {
        const months = event.durationMonths || 1;
        if (rentPayment && rentPayment.amount > 0) {
          const rentRateMinor = rentPayment.amount * 100;
          const rentArrearsMinor = rentRateMinor * months;
          totalMinor += rentArrearsMinor;

          breakdown.push({
            label: `Unpaid Rent (${months} month${months > 1 ? 's' : ''})`,
            amount: this.formatINR(rentArrearsMinor),
            amountMinor: rentArrearsMinor,
            calculationFormula: `${this.formatINR(rentRateMinor)} × ${months} month${months > 1 ? 's' : ''}`,
            note: `Contractually due under ${rentPayment.sourceClauseId || 'Payment Clause'} (Section 4.1)`,
            sourceClauseId: rentPayment.sourceClauseId,
          });

          // Late fee calculation if penalty clause exists
          if (latePenalty && latePenalty.rate && latePenalty.rate > 0) {
            // Assume 30 days per month default late accrual (beyond grace period if specified)
            const graceDays = rentPayment.gracePeriodDays || 0;
            const billableDaysPerMonth = Math.max(1, 30 - graceDays);
            const totalDaysLate = billableDaysPerMonth * months;
            const penaltyRateMinor = latePenalty.rate * 100;
            const penaltyTotalMinor = penaltyRateMinor * totalDaysLate;
            totalMinor += penaltyTotalMinor;

            breakdown.push({
              label: `Contractual Late Fee Penalty (${totalDaysLate} days)`,
              amount: this.formatINR(penaltyTotalMinor),
              amountMinor: penaltyTotalMinor,
              calculationFormula: `₹${latePenalty.rate}/day × ${totalDaysLate} days (post-${graceDays}d grace)`,
              note: `Triggered by ${latePenalty.sourceClauseId || 'Penalty Clause'} (Section 4.3)`,
              sourceClauseId: latePenalty.sourceClauseId,
            });
          }
        } else {
          isFullyDetermined = false;
          undeterminedNotes.push('Rent amount cannot be determined from the available contract information.');
        }
      }

      if (event.type === 'vacate_property' || event.type === 'break_notice') {
        if (depositPayment && depositPayment.amount > 0) {
          const depositMinor = depositPayment.amount * 100;
          breakdown.push({
            label: 'Security Deposit Held by Landlord',
            amount: `${this.formatINR(depositMinor)} (Subject to Offset)`,
            amountMinor: depositMinor,
            calculationFormula: `Initial deposit retained under ${depositPayment.sourceClauseId || 'Deposit Clause'}`,
            note: 'Contractually available for landlord to offset against rent arrears, subject to statutory limits under Section 74 Indian Contract Act.',
            sourceClauseId: depositPayment.sourceClauseId,
          });
        }
      }

      if (event.type === 'damage_property') {
        if (event.amount && event.amount > 0) {
          const damageMinor = event.amount * 100;
          totalMinor += damageMinor;
          breakdown.push({
            label: 'Estimated Property Repair / Repainting',
            amount: this.formatINR(damageMinor),
            amountMinor: damageMinor,
            note: 'Direct physical restoration liability',
          });
        } else {
          undeterminedNotes.push('Specific property damage amount requires physical repair inspection or receipts; cannot be determined from contract text alone.');
        }
      }
    }

    // Default fallback if no specific events triggered numbers
    if (breakdown.length === 0) {
      if (rentPayment && rentPayment.amount > 0) {
        const standardMinor = rentPayment.amount * 100;
        breakdown.push({
          label: 'Baseline Monthly Contractual Value',
          amount: this.formatINR(standardMinor),
          amountMinor: standardMinor,
          note: 'Contractual monthly base rate',
          sourceClauseId: rentPayment.sourceClauseId,
        });
        totalMinor = standardMinor;
      } else {
        undeterminedNotes.push('Amount cannot be determined from the available contract information.');
      }
    }

    return {
      totalImpactRupees: this.formatINR(totalMinor),
      totalImpactMinor: totalMinor,
      breakdown,
      isFullyDetermined,
      undeterminedNotes,
    };
  }

  /**
   * Deterministic date and notice difference calculation
   */
  static calculateNoticeDeadline(startDate: Date, noticeDays: number): Date {
    const result = new Date(startDate);
    result.setDate(result.getDate() + noticeDays);
    return result;
  }

  /**
   * Computes statutory interest under Indian Interest Act / judicial standards (e.g. 6% to 9% p.a.)
   */
  static calculateStatutoryInterest(principalMinor: number, days: number, annualRatePercentage = 6): number {
    const yearFraction = days / 365;
    return Math.round(principalMinor * (annualRatePercentage / 100) * yearFraction);
  }
}
