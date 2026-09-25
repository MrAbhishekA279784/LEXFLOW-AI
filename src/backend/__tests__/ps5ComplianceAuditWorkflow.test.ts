import { describe, it, expect } from 'vitest';
import { ComplianceAuditService } from '../services/complianceAudit/complianceAuditService';
import { repository } from '../repositories';
import { v4 as uuidv4 } from 'uuid';

describe('Phase 14 — College PS#5 Compliance Audit End-to-End Workflow Test Suite', () => {
  const userId = 'usr-ps5-test-' + uuidv4().substring(0, 8);

  it('should execute full PS#5 workflow: Reviewer -> Skeptic -> Multi-turn Debate -> Escalation Brief', async () => {
    // 1. Create document
    const doc = await repository.create({
      userId,
      name: 'Bangalore_Commercial_Tenancy_PS5.pdf',
      type: 'pdf',
      status: 'analyzed',
      summary: 'Bangalore commercial lease with forfeiture risk and 3-year lock-in.',
    });

    // 2. Execute full compliance audit orchestration
    const auditRecord = await ComplianceAuditService.startAudit(doc.id, userId);

    expect(auditRecord).toBeDefined();
    expect(auditRecord.documentId).toBe(doc.id);
    expect(auditRecord.status).toBeDefined();
    expect(auditRecord.overallExecutiveSummary).toBeDefined();
    expect(auditRecord.summaryMetrics).toBeDefined();

    // 3. Verify persistence
    const savedAudit = await repository.getComplianceAuditById?.(auditRecord.id, userId);
    expect(savedAudit).toBeDefined();
    expect(savedAudit?.id).toBe(auditRecord.id);
  });
});
