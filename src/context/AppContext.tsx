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
import { LegalGraph } from '../backend/types/backendTypes';
import { INITIAL_COMPLIANCE_AUDIT } from '../backend/data/complianceAuditSeedData';
import { 
  INITIAL_USER, 
  INITIAL_DOCUMENTS, 
  DEFAULT_SCENARIO, 
  INITIAL_CHAT_MESSAGES 
} from '../data/initialData';
import { INITIAL_DOCUMENT_VERSIONS } from '../data/documentVersionsData';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthToken } from '../utils/apiAuth';

import { DocumentProvider, useDocumentContext } from './DocumentContext';
import { ScenarioProvider, useScenarioContext } from './ScenarioContext';
import { ComplianceProvider, useComplianceContext } from './ComplianceContext';
import { ComparisonProvider, useComparisonContext } from './ComparisonContext';

export interface AppContextType {
  currentScreen: ScreenId;
  navigationDirection: 'forward' | 'back' | 'none';
  navigateTo: (screen: ScreenId) => void;
  goBack: () => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  documents: DocumentItem[];
  activeDocument: DocumentItem;
  setActiveDocument: (doc: DocumentItem) => void;
  addDocument: (file: { name: string; size: string; type: 'pdf' | 'docx'; rawFile?: File }) => Promise<void>;
  removeDocument: (id: string) => void;
  
  // Graph & Document details state
  activeDocTab: 'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History';
  setActiveDocTab: (tab: 'Overview' | 'Graph' | 'Clauses' | 'Risks' | 'Audit' | 'History') => void;
  currentGraph: LegalGraph | null;
  isGraphLoading: boolean;
  graphError: string | null;
  fetchDocumentGraph: (docId?: string) => Promise<LegalGraph | null>;
  regenerateDocumentGraph: (docId?: string) => Promise<LegalGraph | null>;

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

  // Lawyer prep kit modal & state
  activeLawyerKit: any | null;
  isLawyerKitLoading: boolean;
  fetchLawyerKit: (docId?: string) => Promise<any | null>;
  generateLawyerKit: (docId?: string, scenarioId?: string) => Promise<any | null>;
  downloadLawyerKitPdf: (docId?: string) => Promise<void>;
  isBriefModalOpen: boolean;
  setIsBriefModalOpen: (open: boolean) => void;

  // Graph export modal
  isGraphExportModalOpen: boolean;
  setIsGraphExportModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const docCtx = useDocumentContext();
  const scenarioCtx = useScenarioContext();
  const complianceCtx = useComplianceContext();
  const comparisonCtx = useComparisonContext();

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'back' | 'none'>('none');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>(['welcome']);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [analysisStep, setAnalysisStep] = useState<number>(3);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [selectedEvidenceClause, setSelectedEvidenceClause] = useState<ClauseItem | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);
  const [isGraphExportModalOpen, setIsGraphExportModalOpen] = useState<boolean>(false);
  const [activeLawyerKit, setActiveLawyerKit] = useState<any | null>(null);
  const [isLawyerKitLoading, setIsLawyerKitLoading] = useState<boolean>(false);

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

  const startAnalysis = async (callback?: () => void) => {
    setCurrentScreen('analyzing');
    setAnalysisStep(1);

    const docId = docCtx.activeDocument?.id || 'doc-rental';

    try {
      const token = await getAuthToken();
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
            docCtx.setActiveDocTab('Graph');
            if (callback) callback();
          }, 600);
          return 6;
        }
        return prev + 1;
      });
    }, 850);
  };

  const runScenario = (promptText: string) => {
    setCurrentScreen('scenario-input');
    scenarioCtx.runScenario(promptText, docCtx.activeDocument?.id);
    setTimeout(() => {
      setCurrentScreen('scenario-result');
    }, 1300);
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

    const docId = docCtx.activeDocument?.id || 'doc-rental';

    try {
      const token = await getAuthToken();
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
      // Local fallback
    }

    setTimeout(() => {
      let replyText = 'Based on your uploaded document, the agreement specifies that any material variation requires written consent signed by both parties.\n\nNote: Information synthesized from primary contract text.';
      let clauseRef: ChatMessage['clauseRef'] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('rent') || lower.includes('increase') || lower.includes('hike')) {
        replyText = 'Based on your document, the landlord can increase rent only once every 12 months, with a 30-day written notice (Section 8.2).';
        clauseRef = {
          section: 'Section 8.2',
          page: 4,
          text: 'Rent escalation shall not exceed 7% per annum and requires at least 30 calendar days written notice prior to expiration.'
        };
      } else if (lower.includes('deposit') || lower.includes('security')) {
        replyText = 'Section 5.1 specifies an interest-free refundable deposit of ₹75,000. It must be refunded within 14 days of handover, less legitimate utility deductions.';
        clauseRef = {
          section: 'Section 5.1',
          page: 3,
          text: 'Security Deposit of INR 75,000/- refundable upon peaceful handover subject to itemized deductions.'
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

  const openEvidence = (clause: ClauseItem) => setSelectedEvidenceClause(clause);
  const closeEvidence = () => setSelectedEvidenceClause(null);

  const fetchLawyerKit = async (docId?: string): Promise<any | null> => {
    const targetDocId = docId || docCtx.activeDocument?.id || 'doc-rental';
    try {
      setIsLawyerKitLoading(true);
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${targetDocId}/lawyer-kit`, {
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setActiveLawyerKit(json.data);
          setIsLawyerKitLoading(false);
          return json.data;
        }
      }
      setIsLawyerKitLoading(false);
      return null;
    } catch {
      setIsLawyerKitLoading(false);
      return null;
    }
  };

  const generateLawyerKit = async (docId?: string, scenarioId?: string): Promise<any | null> => {
    const targetDocId = docId || docCtx.activeDocument?.id || 'doc-rental';
    try {
      setIsLawyerKitLoading(true);
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${targetDocId}/lawyer-kit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ scenarioId: scenarioId || scenarioCtx.activeScenario?.id })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setActiveLawyerKit(json.data);
          setIsLawyerKitLoading(false);
          return json.data;
        }
      }
      setIsLawyerKitLoading(false);
      return null;
    } catch {
      setIsLawyerKitLoading(false);
      return null;
    }
  };

  const downloadLawyerKitPdf = async (docId?: string): Promise<void> => {
    const targetDocId = docId || docCtx.activeDocument?.id || 'doc-rental';
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/v1/documents/${targetDocId}/lawyer-kit/export`, {
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Lexflow_Lawyer_Prep_Kit_${(docCtx.activeDocument?.name || 'Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        window.print();
      }
    } catch {
      window.print();
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
        documents: docCtx.documents,
        activeDocument: docCtx.activeDocument,
        setActiveDocument: docCtx.setActiveDocument,
        addDocument: docCtx.addDocument,
        removeDocument: docCtx.removeDocument,
        activeDocTab: docCtx.activeDocTab,
        setActiveDocTab: docCtx.setActiveDocTab,
        currentGraph: docCtx.currentGraph,
        isGraphLoading: docCtx.isGraphLoading,
        graphError: docCtx.graphError,
        fetchDocumentGraph: docCtx.fetchDocumentGraph,
        regenerateDocumentGraph: docCtx.regenerateDocumentGraph,
        activeComplianceAudit: complianceCtx.activeComplianceAudit,
        complianceAudits: complianceCtx.complianceAudits,
        isAuditRunning: complianceCtx.isAuditRunning,
        startComplianceAudit: complianceCtx.startComplianceAudit,
        fetchComplianceAudits: complianceCtx.fetchComplianceAudits,
        selectComplianceAudit: complianceCtx.selectComplianceAudit,
        documentVersions: docCtx.documentVersions,
        revertToVersion: docCtx.revertToVersion,
        createVersionRevision: docCtx.createVersionRevision,
        fetchDocumentVersions: docCtx.fetchDocumentVersions,
        activeScenario: scenarioCtx.activeScenario,
        isSimulating: scenarioCtx.isSimulating,
        runScenario,
        scenarioInputText: scenarioCtx.scenarioInputText,
        setScenarioInputText: scenarioCtx.setScenarioInputText,
        analysisStep,
        startAnalysis,
        chatMessages,
        sendChatMessage,
        selectedEvidenceClause,
        openEvidence,
        closeEvidence,
        activeLawyerKit,
        isLawyerKitLoading,
        fetchLawyerKit,
        generateLawyerKit,
        downloadLawyerKitPdf,
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <DocumentProvider>
      <ScenarioProvider>
        <ComplianceProvider>
          <ComparisonProvider>
            <AppStateProvider>
              {children}
            </AppStateProvider>
          </ComparisonProvider>
        </ComplianceProvider>
      </ScenarioProvider>
    </DocumentProvider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
