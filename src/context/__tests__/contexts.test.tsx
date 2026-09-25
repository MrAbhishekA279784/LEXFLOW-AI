import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentProvider, useDocumentContext } from '../DocumentContext';
import { ComplianceProvider, useComplianceContext } from '../ComplianceContext';
import { ScenarioProvider, useScenarioContext } from '../ScenarioContext';
import { ComparisonProvider, useComparisonContext } from '../ComparisonContext';

describe('Phase 4 — React Context & Custom Hooks Test Suite', () => {
  it('DocumentContext: should manage active document and tab state', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <DocumentProvider>{children}</DocumentProvider>
    );

    const { result } = renderHook(() => useDocumentContext(), { wrapper });

    expect(result.current.documents.length).toBeGreaterThan(0);
    expect(result.current.activeDocument).toBeDefined();

    act(() => {
      result.current.setActiveDocTab('Clauses');
    });

    expect(result.current.activeDocTab).toBe('Clauses');
  });

  it('DocumentContext: addDocument should prepend new uploaded agreement', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <DocumentProvider>{children}</DocumentProvider>
    );

    const { result } = renderHook(() => useDocumentContext(), { wrapper });

    const initialCount = result.current.documents.length;

    await act(async () => {
      await result.current.addDocument({
        name: 'New_Vendor_Agreement.pdf',
        size: '1.5 MB',
        type: 'pdf',
      });
    });

    expect(result.current.documents.length).toBe(initialCount + 1);
    expect(result.current.documents[0].name).toBe('New_Vendor_Agreement.pdf');
  });

  it('ComplianceContext: should manage active compliance audit record and selection', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ComplianceProvider>{children}</ComplianceProvider>
    );

    const { result } = renderHook(() => useComplianceContext(), { wrapper });

    expect(result.current.activeComplianceAudit).toBeDefined();
    expect(result.current.isAuditRunning).toBe(false);
  });

  it('ScenarioContext: should manage Hinglish scenario prompt execution and simulation states', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ScenarioProvider>{children}</ScenarioProvider>
    );

    const { result } = renderHook(() => useScenarioContext(), { wrapper });

    expect(result.current.activeScenario).toBeDefined();

    await act(async () => {
      await result.current.runScenario('Lock in period me vacate karne par kitna deposit milega?');
    });

    expect(result.current.activeScenario).toBeDefined();
    expect(result.current.activeScenario?.normalizedInterpretation).toBeDefined();
  });

  it('ComparisonContext: should manage dual document comparison state', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );

    const { result } = renderHook(() => useComparisonContext(), { wrapper });

    expect(result.current.comparisonResults).toBeDefined();
    expect(result.current.isComparing).toBe(false);
  });
});
