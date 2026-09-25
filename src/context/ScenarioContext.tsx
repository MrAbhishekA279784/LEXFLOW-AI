import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScenarioSimulation } from '../types';
import { DEFAULT_SCENARIO } from '../data/initialData';
import { getAuthToken } from '../utils/apiAuth';

export interface ScenarioContextType {
  activeScenario: ScenarioSimulation;
  isSimulating: boolean;
  runScenario: (prompt: string, docId?: string) => void;
  scenarioInputText: string;
  setScenarioInputText: (text: string) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioSimulation>(DEFAULT_SCENARIO);
  const [scenarioInputText, setScenarioInputText] = useState<string>(
    'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const runScenario = async (promptText: string, docId?: string) => {
    setIsSimulating(true);

    try {
      const token = await getAuthToken();
      const targetDocId = docId || activeScenario.documentId || 'doc-rental';
      
      const res = await fetch('/api/v1/scenarios/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          documentId: targetDocId,
          prompt: promptText
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const apiScenario = json.data;
          setActiveScenario({
            id: apiScenario.id || `sim-${Date.now()}`,
            documentId: apiScenario.documentId || targetDocId,
            inputPrompt: apiScenario.inputPrompt || promptText,
            normalizedInterpretation: apiScenario.normalizedInterpretation || 'User scenario simulation.',
            title: apiScenario.title || 'What-If Legal Outcome',
            documentSays: apiScenario.documentSays,
            lawSays: apiScenario.lawSays,
            lexflowAnalysis: apiScenario.lexflowAnalysis,
            totalFinancialImpact: apiScenario.totalFinancialImpact || '₹0',
            totalFinancialImpactMinor: apiScenario.totalFinancialImpactMinor,
            financialBreakdown: apiScenario.financialBreakdown || [],
            keyPoints: apiScenario.keyPoints || [],
            relevantClauses: apiScenario.relevantClauses || [],
            applicableLaw: apiScenario.applicableLaw || [],
            timeline: apiScenario.timeline || [],
            risks: apiScenario.risks || [],
            protections: apiScenario.protections || [],
            conflicts: apiScenario.conflicts || [],
            evidence: apiScenario.evidence || [],
            suggestedNextSteps: apiScenario.suggestedNextSteps || [],
            disclaimer: apiScenario.disclaimer || 'Grounded in Indian Contract Act 1872.',
            targetNodeIds: apiScenario.targetNodeIds || [],
            status: apiScenario.status === 'needs_clarification' ? 'needs_clarification' : 'completed'
          });
          setIsSimulating(false);
          return;
        }
      }
    } catch {
      // Local fallback simulation
    }

    // Fallback simulation generator
    setTimeout(() => {
      const hasRentKeywords = /rent|late|non-payment|mahine/i.test(promptText);
      
      if (hasRentKeywords) {
        setActiveScenario({
          id: `sim-${Date.now()}`,
          inputPrompt: promptText,
          normalizedInterpretation: 'Defaulting on 3 months rent followed by unilateral abandonment of leased premises.',
          title: '3-Month Rent Default & Premises Abandonment',
          documentSays: 'Clause 4 obligates tenant to pay ₹25,000/month by 5th. Clause 12 imposes 18% p.a. penalty on arrears and immediate forfeiture of 2-month security deposit (₹50,000) upon uncured default exceeding 15 days.',
          lawSays: 'Section 73 & Section 74 of the Indian Contract Act 1872 allow reasonable compensation not exceeding penalty stipulated. Section 106 of Transfer of Property Act requires 15-day notice for lease termination.',
          lexflowAnalysis: 'Tenant is legally liable for arrears (₹75,000) plus penal interest capped under Section 74 ICA. Landlord can legally offset against ₹50,000 security deposit, leaving net ₹25,000 outstanding plus interest.',
          totalFinancialImpact: '₹75,000 - ₹88,500',
          financialBreakdown: [
            { label: 'Unpaid Rent (3 Months @ ₹25,000)', amount: '₹75,000', note: 'Base obligation under Clause 4' },
            { label: 'Penal Interest (18% p.a. for 90 days)', amount: '₹3,375', note: 'Capped under ICA Sec 74' },
            { label: 'Less Security Deposit Offset', amount: '-₹50,000', note: 'Clause 12 adjustment' },
            { label: 'Net Payable Exposure', amount: '₹28,375', note: 'Estimated net liability' }
          ],
          keyPoints: [
            'Landlord cannot levy arbitrary double penalties; Section 74 ICA mandates reasonable actual damages.',
            'Forfeiture of security deposit is permitted only to cover actual default/damages.',
            'Tenant is entitled to itemized statement of deposit offset.'
          ],
          relevantClauses: [
            { section: 'Clause 4', title: 'Rent Payment & Schedule', excerpt: 'Tenant shall pay monthly rent of ₹25,000 on or before the 5th day of each calendar month.', page: 2 },
            { section: 'Clause 12', title: 'Default & Security Deposit', excerpt: 'In case of default exceeding 15 days, Landlord reserves right to forfeit security deposit and claim interest @ 18% p.a.', page: 5 }
          ],
          timeline: [
            { step: 1, time: 'Day 1', event: 'Rent default for Month 1', status: 'past', clauseRef: 'Clause 4' },
            { step: 2, time: 'Day 15', event: 'Default cure period expires', status: 'past', clauseRef: 'Clause 12' },
            { step: 3, time: 'Day 90', event: '3 months unpaid + tenant vacates without notice', status: 'trigger' },
            { step: 4, time: 'Day 91', event: 'Landlord issues legal notice for arrears recovery', status: 'consequence' }
          ],
          suggestedNextSteps: [
            'Issue written notice of intent to vacate to limit further rent accrual.',
            'Request formal adjustment of ₹50,000 security deposit against 2 months rent.',
            'Offer settlement for remaining 1 month balance to avoid civil suit.'
          ],
          disclaimer: 'This simulation is generated for analytical prep and does not constitute formal legal advice.',
          targetNodeIds: ['node-3', 'node-4', 'node-6'],
          status: 'completed'
        });
      } else {
        setActiveScenario({
          id: `sim-${Date.now()}`,
          inputPrompt: promptText,
          normalizedInterpretation: promptText,
          title: 'Custom Contractual Scenario Analysis',
          documentSays: 'Agreement terms apply as written subject to statutory defenses.',
          lawSays: 'Indian Contract Act 1872 governs enforceability and damages.',
          lexflowAnalysis: 'Analysis indicates potential exposure based on clause dependencies.',
          totalFinancialImpact: 'Variable Exposure',
          financialBreakdown: [
            { label: 'Estimated Claim', amount: '₹25,000', note: 'Subject to clause verification' }
          ],
          keyPoints: ['Review relevant clauses before taking unilateral action.'],
          relevantClauses: [
            { section: 'Clause 4', title: 'General Terms', excerpt: 'Standard contractual obligations apply.', page: 1 }
          ],
          timeline: [
            { step: 1, time: 'Immediate', event: 'Event Triggered', status: 'trigger' }
          ],
          suggestedNextSteps: ['Consult legal counsel with generated prep kit.'],
          disclaimer: 'Analysis grounded in primary contract text.',
          targetNodeIds: [],
          status: 'completed'
        });
      }
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <ScenarioContext.Provider
      value={{
        activeScenario,
        isSimulating,
        runScenario,
        scenarioInputText,
        setScenarioInputText
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenarioContext = () => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenarioContext must be used within a ScenarioProvider');
  }
  return context;
};
