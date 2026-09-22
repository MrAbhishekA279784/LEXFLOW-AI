export type ScreenId = 
  | 'welcome'
  | 'auth'
  | 'home'
  | 'upload'
  | 'analyzing'
  | 'legal-graph'
  | 'scenario-input'
  | 'scenario-result'
  | 'lawyer-kit'
  | 'compare'
  | 'assistant'
  | 'more'
  | 'settings'
  | 'help'
  | 'terms'
  | 'document-history'
  | 'compliance-audit';

export interface VersionChangeItem {
  id: string;
  clauseSection: string;
  clauseTitle: string;
  changeType: 'modified' | 'added' | 'removed';
  originalText?: string;
  updatedText?: string;
  riskImpact: 'mitigated' | 'increased' | 'neutral';
  explanation: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: string;
  title: string;
  timestamp: string;
  createdAt: string;
  author: {
    name: string;
    role: 'User' | 'Landlord' | 'Counsel' | 'AI Assistant' | 'Counterparty' | 'System';
  };
  summary: string;
  changeType: 'initial_upload' | 'clause_amendment' | 'counter_offer' | 'reverted' | 'ai_redline' | 'signed_addendum';
  changeCount: number;
  riskCount: number;
  clauseCount: number;
  changes: VersionChangeItem[];
  snapshotClauses?: ClauseItem[];
  isCurrent: boolean;
  revertedFromVersion?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx';
  size: string;
  uploadedAt: string;
  status: 'analyzed' | 'uploaded' | 'analyzing' | 'failed' | 'completed' | 'processing' | 'extracting' | 'building_model' | 'building_graph' | 'detecting_risks' | 'retrieving_law' | 'generating_evidence';
  color: 'red' | 'blue' | 'amber';
  riskCount?: number;
  clauseCount?: number;
  summary?: string;
}

export interface ClauseItem {
  id: string;
  section: string;
  title: string;
  summary: string;
  fullText: string;
  riskLevel: 'low' | 'medium' | 'high';
  party: 'tenant' | 'landlord' | 'mutual';
  pageNumber: number;
  penalties?: string;
  obligations?: string[];
  rights?: string[];
}

export interface RiskItem {
  id: string;
  title: string;
  level: 'critical' | 'moderate' | 'low';
  perspective: 'adversarial' | 'protection';
  clauseRef: string;
  description: string;
  recommendation: string;
  potentialImpact: string;
}

export interface ScenarioSimulation {
  id: string;
  inputPrompt: string;
  normalizedInterpretation: string;
  title: string;
  totalFinancialImpact: string;
  financialBreakdown: { label: string; amount: string; note: string }[];
  keyPoints: string[];
  relevantClauses: { section: string; title: string; excerpt: string; page: number }[];
  timeline: { step: number; time: string; event: string; status: 'past' | 'trigger' | 'consequence' }[];
  status: 'completed' | 'simulating' | 'needs_clarification';
}

export interface ComparisonDiff {
  category: 'added' | 'removed' | 'modified';
  title: string;
  docAValue?: string;
  docBValue?: string;
  riskImpact: 'higher' | 'lower' | 'neutral';
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  clauseRef?: {
    section: string;
    page: number;
    text: string;
  };
  suggestedPrompts?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  documentsAnalyzed: number;
  scenariosRun: number;
  preferences?: {
    language: 'english' | 'hinglish';
    responseStyle: 'concise' | 'balanced' | 'detailed';
    explanationPreference: 'simple' | 'technical';
  };
}
