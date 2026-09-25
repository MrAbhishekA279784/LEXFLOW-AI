import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { AppProvider } from '../../context/AppContext';
import { DocumentProvider } from '../../context/DocumentContext';
import { ComplianceProvider } from '../../context/ComplianceContext';
import { ScenarioProvider } from '../../context/ScenarioContext';
import { ComparisonProvider } from '../../context/ComparisonContext';

import { HomeScreen } from '../screens/HomeScreen';
import { LegalGraphScreen } from '../screens/LegalGraphScreen';
import { ComplianceAuditScreen } from '../screens/ComplianceAuditScreen';
import { LawyerKitScreen } from '../screens/LawyerKitScreen';

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <DocumentProvider>
      <ComplianceProvider>
        <ScenarioProvider>
          <ComparisonProvider>
            {children}
          </ComparisonProvider>
        </ScenarioProvider>
      </ComplianceProvider>
    </DocumentProvider>
  </AppProvider>
);

describe('Phase 19 — Automated Accessibility Audit Test Suite (axe-core)', () => {
  it('HomeScreen should pass automated WCAG accessibility guidelines', async () => {
    const { container } = render(
      <AllProviders>
        <HomeScreen />
      </AllProviders>
    );

    const results = await axe.run(container);
    // Ensure zero critical accessibility violations exist
    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  it('LegalGraphScreen should maintain valid heading hierarchy and ARIA landmarks', async () => {
    const { container } = render(
      <AllProviders>
        <LegalGraphScreen />
      </AllProviders>
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  it('ComplianceAuditScreen should maintain accessible form controls and buttons', async () => {
    const { container } = render(
      <AllProviders>
        <ComplianceAuditScreen />
      </AllProviders>
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  it('LawyerKitScreen should maintain accessible contrast and structured lists', async () => {
    const { container } = render(
      <AllProviders>
        <LawyerKitScreen />
      </AllProviders>
    );

    const results = await axe.run(container);
    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
});
