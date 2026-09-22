import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  ScreenId, 
  DocumentItem, 
  ClauseItem, 
  ScenarioSimulation, 
  ChatMessage, 
  UserProfile,
  DocumentVersion,
  VersionChangeItem
} from '../types';
import { ComplianceAuditRecord } from '../types/complianceAuditTypes';
import { INITIAL_COMPLIANCE_AUDIT } from '../backend/data/complianceAuditSeedData';
import { 
  INITIAL_USER, 
  INITIAL_DOCUMENTS, 
  RENTAL_CLAUSES, 
  DEFAULT_SCENARIO, 
  INITIAL_CHAT_MESSAGES 
} from '../data/initialData';
import { INITIAL_DOCUMENT_VERSIONS } from '../data/documentVersionsData';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  currentScreen: ScreenId;
  navigationDirection: 'forward' | 'back' | 'none';
  navigateTo: (screen: ScreenId) => void;
  goBack: () => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  documents: DocumentItem[];
  activeDocument: DocumentItem;
  setActiveDocument: (doc: DocumentItem) => void;
  addDocument: (file: { name: string; size: string; type: 'pdf' | 'docx' }) => void;
  removeDocument: (id: string) => void;
  
  // Graph & Document details state
  activeDocTab: 'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History';
  setActiveDocTab: (tab: 'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History') => void;

  // Multi-Agent Compliance Audit (PS #5) state & actions
  activeComplianceAudit: ComplianceAuditRecord | null;
  complianceAudits: ComplianceAuditRecord[];
  isAuditRunning: boolean;
  startComplianceAudit: (docId?: string) => Promise<ComplianceAuditRecord | null>;
  fetchComplianceAudits: (docId?: string) => Promise<ComplianceAuditRecord[]>;
  selectComplianceAudit: (audit: ComplianceAuditRecord) => void;

  // Document Versions & Change History state
  documentVersions: DocumentVersion[];
  revertToVersion: (versionId: string, note?: string) => Promise<boolean>;
  createVersionRevision: (revision: {
    title: string;
    summary: string;
    changeType: 'clause_amendment' | 'counter_offer' | 'signed_addendum' | 'ai_redline';
    changes: VersionChangeItem[];
  }) => Promise<DocumentVersion>;
  fetchDocumentVersions: (docId: string) => Promise<DocumentVersion[]>;
  
  // Scenario state
  activeScenario: ScenarioSimulation;
  isSimulating: boolean;
  runScenario: (prompt: string) => void;
  scenarioInputText: string;
  setScenarioInputText: (text: string) => void;
  
  // Analysis state
  analysisStep: number;
  startAnalysis: (callback?: () => void) => void;
  
  // Chat / Assistant state
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  
  // Evidence viewer
  selectedEvidenceClause: ClauseItem | null;
  openEvidence: (clause: ClauseItem) => void;
  closeEvidence: () => void;

  // Lawyer prep kit modal
  isBriefModalOpen: boolean;
  setIsBriefModalOpen: (open: boolean) => void;

  // Graph export modal
  isGraphExportModalOpen: boolean;
  setIsGraphExportModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'back' | 'none'>('none');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>(['welcome']);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [activeDocument, setActiveDocument] = useState<DocumentItem>(INITIAL_DOCUMENTS[0]);
  const [activeDocTab, setActiveDocTab] = useState<'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History'>('Graph');
  const [activeComplianceAudit, setActiveComplianceAudit] = useState<ComplianceAuditRecord | null>(INITIAL_COMPLIANCE_AUDIT);
  const [complianceAudits, setComplianceAudits] = useState<ComplianceAuditRecord[]>([INITIAL_COMPLIANCE_AUDIT]);
  const [isAuditRunning, setIsAuditRunning] = useState<boolean>(false);
  const [versionsMap, setVersionsMap] = useState<Record<string, DocumentVersion[]>>(INITIAL_DOCUMENT_VERSIONS);
  
  const [activeScenario, setActiveScenario] = useState<ScenarioSimulation>(DEFAULT_SCENARIO);
  const [scenarioInputText, setScenarioInputText] = useState<string>(
    'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?'
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(3); // Default step 3 (Building legal model)
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [selectedEvidenceClause, setSelectedEvidenceClause] = useState<ClauseItem | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);
  const [isGraphExportModalOpen, setIsGraphExportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (supabase) {
          const { data } = await supabase.from('users').select('*').eq('id', firebaseUser.uid).single();
          if (data) {
             setUser({
                name: data.display_name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                avatarUrl: data.avatar_url || firebaseUser.photoURL || INITIAL_USER.avatarUrl,
                documentsAnalyzed: 0,
                scenariosRun: 0,
                preferences: data.preferences || {
                  language: 'english',
                  responseStyle: 'balanced',
                  explanationPreference: 'simple'
                }
              });
          } else {
             setUser({
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                avatarUrl: firebaseUser.photoURL || INITIAL_USER.avatarUrl,
                documentsAnalyzed: 0,
                scenariosRun: 0,
                preferences: {
                  language: 'english',
                  responseStyle: 'balanced',
                  explanationPreference: 'simple'
                }
             });
          }
        }
      } else {
        setUser(INITIAL_USER);
      }
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (screen: ScreenId) => {
    setNavigationDirection('forward');
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setNavigationDirection('back');
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(h => h.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('home');
    }
  };

  const addDocument = async (file: { name: string; size: string; type: 'pdf' | 'docx' }) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          size: file.size,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const newDoc: DocumentItem = {
          id: created.id,
          name: created.name,
          type: created.type,
          size: created.size,
          uploadedAt: 'Just now',
          status: 'uploaded',
          color: file.type === 'pdf' ? 'red' : 'blue',
          riskCount: created.riskCount || 2,
          clauseCount: created.clauseCount || 9,
          summary: created.summary || `Document uploaded: ${file.name}`
        };
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDocument(newDoc);
        return;
      }
    } catch {
      // Fallback to local store if offline
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: 'Just now',
      status: 'uploaded',
      color: file.type === 'pdf' ? 'red' : 'blue',
      riskCount: 2,
      clauseCount: 9,
      summary: `Document uploaded: ${file.name}`
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocument(newDoc);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const startAnalysis = async (callback?: () => void) => {
    setCurrentScreen('analyzing');
    setAnalysisStep(1);

    const docId = activeDocument?.id || 'doc-rental';

    // Trigger real backend analysis job
    try {
      const token = await auth.currentUser?.getIdToken();
      fetch(`/api/v1/documents/${docId}/analyze`, { 
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }).catch(() => {});
    } catch {
      // Ignore background trigger failure
    }

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setCurrentScreen('legal-graph');
            setActiveDocTab('Graph');
            if (callback) callback();
          }, 600);
          return 6;
        }
        return prev + 1;
      });
    }, 850);
  };

  const runScenario = async (promptText: string) => {
    setIsSimulating(true);
    setCurrentScreen('scenario-input');

    const docId = activeDocument?.id || 'doc-rental';

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/v1/documents/${docId}/scenarios`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          prompt: promptText,
          actorRole: 'tenant',
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const res = json.data;
          const simulated: ScenarioSimulation = {
            id: res.id || `scen-${Date.now()}`,
            inputPrompt: res.inputPrompt || promptText,
            normalizedInterpretation: res.normalizedInterpretation,
            title: res.title || 'Contractual Deviation & Potential Liability',
            totalFinancialImpact: res.totalFinancialImpact || '₹75,000',
            financialBreakdown: (res.financialBreakdown && res.financialBreakdown.length > 0)
              ? res.financialBreakdown
              : DEFAULT_SCENARIO.financialBreakdown,
            keyPoints: (res.keyPoints && res.keyPoints.length > 0)
              ? res.keyPoints
              : [
                  'Notice period: 30 days mandatory notification required',
                  'Early termination clause applies (Section 12.1)',
                  'Security deposit may be forfeited or offset against damages',
                  'Section 74 Indian Contract Act limits compensation to actual loss'
                ],
            relevantClauses: (res.relevantClauses && res.relevantClauses.length > 0)
              ? res.relevantClauses
              : DEFAULT_SCENARIO.relevantClauses,
            timeline: (res.timeline && res.timeline.length > 0)
              ? res.timeline
              : DEFAULT_SCENARIO.timeline,
            status: 'completed',
          };

          setActiveScenario(simulated);
          setIsSimulating(false);
          setCurrentScreen('scenario-result');
          return;
        }
      }
    } catch {
      // Fallback to local deterministic simulation
    }

    // Fallback simulation
    setTimeout(() => {
      const simulated: ScenarioSimulation = {
        id: `scen-${Date.now()}`,
        inputPrompt: promptText,
        normalizedInterpretation: promptText.toLowerCase().includes('rent') || promptText.toLowerCase().includes('mahine')
          ? 'Tenant stops monthly rent remittance for approximately 3 billing cycles and departs without serving a 30-day notice.'
          : `Analysis of contractual condition: "${promptText}". Identifying affected liability caps and breach remedy clauses.`,
        title: promptText.toLowerCase().includes('rent') 
          ? 'Early termination after 3 months'
          : 'Contractual Deviation & Potential Liability',
        totalFinancialImpact: promptText.toLowerCase().includes('rent') ? '₹75,000' : '₹35,000 – ₹50,000',
        financialBreakdown: promptText.toLowerCase().includes('rent') ? DEFAULT_SCENARIO.financialBreakdown : [
          { label: 'Direct Contractual Exposure', amount: '₹35,000', note: 'Based on liquidated damages formula' },
          { label: 'Notice Period Discrepancy', amount: '₹15,000', note: 'Unfulfilled notification window' }
        ],
        keyPoints: [
          'Notice period: 30 days mandatory notification required',
          'Early termination clause applies (Section 12.1)',
          'Security deposit may be forfeited or offset against damages',
          'Landlord/Counterparty may claim additional damages under Section 74 ICA'
        ],
        relevantClauses: DEFAULT_SCENARIO.relevantClauses,
        timeline: DEFAULT_SCENARIO.timeline,
        status: 'completed'
      };

      setActiveScenario(simulated);
      setIsSimulating(false);
      setCurrentScreen('scenario-result');
    }, 1800);
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    const docId = activeDocument?.id || 'doc-rental';

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/v1/documents/${docId}/assistant`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          text,
          history: chatMessages.map(m => ({ role: m.sender, text: m.text })),
          preferences: user.preferences
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const assistantMsg: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'assistant',
            text: json.data.replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clauseRef: json.data.clauseRef,
            suggestedPrompts: ['Show clause', 'Explain in simpler terms', 'What questions should I ask my lawyer?']
          };
          setChatMessages(prev => [...prev, assistantMsg]);
          return;
        }
      }
    } catch {
      // Fallback to local heuristics
    }

    setTimeout(() => {
      let replyText = 'Based on your uploaded document, the agreement specifies that any material variation requires written consent signed by both parties.\n\nNote: This is an informational document synthesis, not formal legal advice.';
      let clauseRef: ChatMessage['clauseRef'] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('rent') || lower.includes('increase') || lower.includes('hike')) {
        replyText = 'Based on your document, the landlord can increase rent only once every 12 months, with a 30-day written notice (Section 8.2).\n\nNote: This is a general explanation based on your document, not legal advice.';
        clauseRef = {
          section: 'Section 8.2',
          page: 4,
          text: 'Rent escalation shall not exceed 7% per annum and requires at least 30 calendar days written notice prior to expiration.'
        };
      } else if (lower.includes('deposit') || lower.includes('security')) {
        replyText = 'Section 5.1 specifies an interest-free refundable deposit of ₹75,000. It must be refunded within 14 days of handover, less legitimate utility and structural repair deductions.\n\nNote: This is a general explanation, not legal advice.';
        clauseRef = {
          section: 'Section 5.1',
          page: 3,
          text: 'Security Deposit of INR 75,000/- refundable upon peaceful handover subject to itemized deductions.'
        };
      } else if (lower.includes('notice') || lower.includes('leave') || lower.includes('terminate')) {
        replyText = 'Clause 12.1 dictates a mandatory 30-day written notice period. Departing prematurely during the lock-in period risks complete forfeiture of the security deposit.\n\nNote: Document finding, not legal advice.';
        clauseRef = {
          section: 'Section 12.1',
          page: 6,
          text: 'Either party may terminate by providing one (1) month written notice. Failure risks liquidated damages.'
        };
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clauseRef,
        suggestedPrompts: ['Show clause', 'Explain in simpler terms', 'What questions should I ask my lawyer?']
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    }, 700);
  };

  const openEvidence = (clause: ClauseItem) => {
    setSelectedEvidenceClause(clause);
  };

  const closeEvidence = () => {
    setSelectedEvidenceClause(null);
  };

  // Document Versions & Revisions
  const documentVersions: DocumentVersion[] = 
    versionsMap[activeDocument.id] || INITIAL_DOCUMENT_VERSIONS['doc-rental'] || [];

  const fetchDocumentVersions = async (docId: string): Promise<DocumentVersion[]> => {
    try {
      const res = await fetch(`/api/v1/documents/${docId}/versions`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setVersionsMap(prev => ({ ...prev, [docId]: json.data }));
          return json.data;
        }
      }
    } catch {
      // fallback to memory map
    }
    return versionsMap[docId] || [];
  };

  const revertToVersion = async (versionId: string, note?: string): Promise<boolean> => {
    const currentList = versionsMap[activeDocument.id] || INITIAL_DOCUMENT_VERSIONS['doc-rental'] || [];
    const targetVer = currentList.find(v => v.id === versionId);
    if (!targetVer) return false;

    // Calculate next version indicator
    const currentVerNum = currentList[0]?.versionNumber || 'v1.2';
    const num = parseFloat(currentVerNum.replace('v', '')) || 1.2;
    const nextVerNum = `v${(num + 0.1).toFixed(1)}`;

    const restoredVersion: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId: activeDocument.id,
      versionNumber: nextVerNum,
      title: `Restored to ${targetVer.versionNumber}`,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      author: {
        name: user.name || 'Current User',
        role: 'User'
      },
      summary: note?.trim() 
        ? `${note.trim()} (Restored baseline parameters from ${targetVer.versionNumber}: ${targetVer.title})`
        : `Reverted active document back to ${targetVer.versionNumber} snapshot (${targetVer.title}).`,
      changeType: 'reverted',
      changeCount: targetVer.changeCount,
      riskCount: targetVer.riskCount,
      clauseCount: targetVer.clauseCount,
      changes: targetVer.changes.map(ch => ({
        ...ch,
        id: `rev-${ch.id}-${Date.now()}`,
        explanation: `Restored: ${ch.explanation}`
      })),
      snapshotClauses: targetVer.snapshotClauses,
      isCurrent: true,
      revertedFromVersion: targetVer.versionNumber
    };

    const updatedList = [
      restoredVersion,
      ...currentList.map(v => ({ ...v, isCurrent: false }))
    ];

    setVersionsMap(prev => ({
      ...prev,
      [activeDocument.id]: updatedList
    }));

    // Update active document state to reflect the reverted version
    const updatedDoc: DocumentItem = {
      ...activeDocument,
      riskCount: targetVer.riskCount,
      clauseCount: targetVer.clauseCount,
      summary: targetVer.summary
    };

    setActiveDocument(updatedDoc);
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));

    // Try backend persistence if API is reachable
    try {
      await fetch(`/api/v1/documents/${activeDocument.id}/versions/${versionId}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
    } catch {
      // Safe fallback, local state is preserved
    }

    return true;
  };

  const createVersionRevision = async (revision: {
    title: string;
    summary: string;
    changeType: 'clause_amendment' | 'counter_offer' | 'signed_addendum' | 'ai_redline';
    changes: VersionChangeItem[];
  }): Promise<DocumentVersion> => {
    const currentList = versionsMap[activeDocument.id] || INITIAL_DOCUMENT_VERSIONS['doc-rental'] || [];
    const currentVerNum = currentList[0]?.versionNumber || 'v1.2';
    const num = parseFloat(currentVerNum.replace('v', '')) || 1.2;
    const nextVerNum = `v${(num + 0.1).toFixed(1)}`;

    const newVer: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId: activeDocument.id,
      versionNumber: nextVerNum,
      title: revision.title,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      author: {
        name: user.name || 'User',
        role: 'User'
      },
      summary: revision.summary,
      changeType: revision.changeType,
      changeCount: revision.changes.length,
      riskCount: revision.changes.some(c => c.riskImpact === 'mitigated') ? 1 : 2,
      clauseCount: currentList[0]?.clauseCount || 14,
      changes: revision.changes,
      isCurrent: true
    };

    const updatedList = [
      newVer,
      ...currentList.map(v => ({ ...v, isCurrent: false }))
    ];

    setVersionsMap(prev => ({
      ...prev,
      [activeDocument.id]: updatedList
    }));

    try {
      await fetch(`/api/v1/documents/${activeDocument.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVer)
      });
    } catch {
      // Safe fallback
    }

    return newVer;
  };

  // Multi-Agent Compliance Audit (PS #5) Handlers
  const selectComplianceAudit = (audit: ComplianceAuditRecord) => {
    setActiveComplianceAudit(audit);
  };

  const fetchComplianceAudits = async (docId?: string): Promise<ComplianceAuditRecord[]> => {
    const targetDocId = docId || activeDocument.id;
    try {
      const res = await fetch(`/api/v1/documents/${targetDocId}/compliance-audits`);
      if (res.ok) {
        const data = await res.json();
        if (data.audits && Array.isArray(data.audits)) {
          setComplianceAudits(data.audits);
          if (data.audits.length > 0 && (!activeComplianceAudit || activeComplianceAudit.documentId !== targetDocId)) {
            setActiveComplianceAudit(data.audits[0]);
          }
          return data.audits;
        }
      }
    } catch (err) {
      console.error('Failed to fetch compliance audits:', err);
    }
    return complianceAudits;
  };

  const startComplianceAudit = async (docId?: string): Promise<ComplianceAuditRecord | null> => {
    const targetDocId = docId || activeDocument.id;
    setIsAuditRunning(true);

    try {
      const res = await fetch(`/api/v1/documents/${targetDocId}/compliance-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        throw new Error(`Failed to start audit: ${res.statusText}`);
      }

      const data = await res.json();
      const initiatedAudit = data.audit as ComplianceAuditRecord;
      setActiveComplianceAudit(initiatedAudit);
      setComplianceAudits(prev => [initiatedAudit, ...prev.filter(a => a.id !== initiatedAudit.id)]);

      // Polling loop with backoff until completed or failed
      const auditId = initiatedAudit.id;
      let attempts = 0;
      const maxAttempts = 40;

      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;

        try {
          const pollRes = await fetch(`/api/v1/documents/${targetDocId}/compliance-audit/${auditId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            const currentAudit = pollData.audit as ComplianceAuditRecord;
            setActiveComplianceAudit(currentAudit);
            setComplianceAudits(prev => [currentAudit, ...prev.filter(a => a.id !== currentAudit.id)]);

            if (currentAudit.status === 'completed' || currentAudit.status === 'failed') {
              setIsAuditRunning(false);
              return currentAudit;
            }
          }
        } catch (pollErr) {
          console.error('Error polling compliance audit:', pollErr);
        }
      }

      setIsAuditRunning(false);
      return initiatedAudit;
    } catch (err) {
      console.error('Error initiating compliance audit:', err);
      setIsAuditRunning(false);
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigationDirection,
        navigateTo,
        goBack,
        user,
        setUser,
        documents,
        activeDocument,
        setActiveDocument,
        addDocument,
        removeDocument,
        activeDocTab,
        setActiveDocTab,
        activeComplianceAudit,
        complianceAudits,
        isAuditRunning,
        startComplianceAudit,
        fetchComplianceAudits,
        selectComplianceAudit,
        documentVersions,
        revertToVersion,
        createVersionRevision,
        fetchDocumentVersions,
        activeScenario,
        isSimulating,
        runScenario,
        scenarioInputText,
        setScenarioInputText,
        analysisStep,
        startAnalysis,
        chatMessages,
        sendChatMessage,
        selectedEvidenceClause,
        openEvidence,
        closeEvidence,
        isBriefModalOpen,
        setIsBriefModalOpen,
        isGraphExportModalOpen,
        setIsGraphExportModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
