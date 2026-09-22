import { describe, it, expect } from 'vitest';
import { DeterministicCalculator } from '../services/calculations/deterministicCalculator';

describe('DeterministicCalculator Engine', () => {
  it('should accurately calculate unpaid rent without floating-point errors', () => {
    const result = DeterministicCalculator.calculateUnpaidRent(25000, 3);
    expect(result.totalPaise).toBe(7500000);
    expect(result.formatted).toBe('₹75,000');
    expect(result.explanation).toContain('3 months at ₹25,000/month');
  });

  it('should calculate late fees respecting grace periods accurately', () => {
    // 15 days delayed, grace period 5 days -> 10 chargeable days at ₹500/day = ₹5,000
    const result = DeterministicCalculator.calculateLateFees(500, 15, 5);
    expect(result.chargeableDays).toBe(10);
    expect(result.totalPaise).toBe(500000);
    expect(result.formatted).toBe('₹5,000');
  });

  it('should calculate zero late fees if delayed days is within grace period', () => {
    const result = DeterministicCalculator.calculateLateFees(500, 4, 5);
    expect(result.chargeableDays).toBe(0);
    expect(result.totalPaise).toBe(0);
    expect(result.formatted).toBe('₹0');
  });

  it('should compute complete financial exposure with deposit offsets', () => {
    const calculation = DeterministicCalculator.calculateFinancialExposure({
      monthlyRent: 25000,
      monthsUnpaid: 3,
      dailyLateFee: 500,
      daysDelayed: 10,
      gracePeriodDays: 5,
      securityDeposit: 75000,
      utilityDeductions: 5000,
      damageDeductions: 10000,
    });

    expect(calculation.totalGrossExposureFormatted).toBe('₹77,500'); // 75k rent + 2.5k late fee
    expect(calculation.netPayableByTenantFormatted).toBe('₹17,500'); // 77.5k + 5k util + 10k dam - 75k dep = 17.5k
    expect(calculation.breakdown.length).toBeGreaterThanOrEqual(4);
  });
});
