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

export interface LegalAuthority {
  id: string;
  sourceType?: 'constitution' | 'central_act' | 'state_act' | 'rule' | 'regulation' | 'judgment';
  title: string;
  actOrCourt: string;
  sectionOrArticle: string;
  subSectionOrPara?: string;
  officialSourceUrl?: string;
  summary: string;
  relevanceExplanation?: string;
  hierarchyLevel?: number;
  retrievedAt?: string;
  precedentCitation?: string;
  court?: string;
}

export interface ScenarioSimulation {
  id: string;
  documentId?: string;
  inputPrompt: string;
  normalizedInterpretation: string;
  title: string;
  documentSays?: string;
  lawSays?: string;
  lexflowAnalysis?: string;
  totalFinancialImpact: string;
  totalFinancialImpactMinor?: number;
  financialBreakdown: { label: string; amount: string; note: string; calculationFormula?: string; sourceClauseId?: string }[];
  keyPoints: string[];
  relevantClauses: { section: string; title: string; excerpt: string; page: number; clauseId?: string }[];
  applicableLaw?: LegalAuthority[];
  timeline: { step: number; time: string; event: string; status: 'past' | 'trigger' | 'consequence'; clauseRef?: string }[];
  risks?: Array<{ title: string; description: string; level: 'low' | 'medium' | 'high' | 'critical' }>;
  protections?: Array<{ title: string; description: string }>;
  conflicts?: Array<{ clauseA: string; clauseB: string; description: string }>;
  evidence?: Array<{ type: string; title?: string; exactExcerpt?: string; section?: string; page?: number; sourceUrl?: string }>;
  suggestedNextSteps?: string[];
  disclaimer?: string;
  targetNodeIds?: string[];
  status: 'completed' | 'simulating' | 'needs_clarification' | 'failed';
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

export interface LawyerKitKeyFact {
  label: string;
  value: string;
  clauseRef?: string;
  page?: number;
  evidenceId?: string;
}

export interface LawyerKitKeyClause {
  clauseId: string;
  section: string;
  title: string;
  excerpt: string;
  page: number;
  importance: string;
  evidenceId?: string;
}

export interface LawyerKitProtection {
  title: string;
  description: string;
  clauseRef?: string;
  page?: number;
  remedy?: string;
  evidenceId?: string;
}

export interface LawyerKitTimelineItem {
  dateOrRelative: string;
  event: string;
  source: string;
  consequence?: string;
}

export interface LawyerKitScenarioFinding {
  scenarioId?: string;
  question: string;
  normalizedScenario: string;
  affectedClauses: string[];
  affectedGraphNodes: string[];
  consequences: string[];
  financialImpact: string;
  financialBreakdown: Array<{ label: string; amount: string; note: string; calculationFormula?: string }>;
  timeline: Array<{ step: number; time: string; event: string; status: 'past' | 'trigger' | 'consequence'; clauseRef?: string }>;
  uncertainty?: string;
}

export interface LawyerPrepKit {
  id: string;
  userId?: string;
  documentId: string;
  documentVersionId?: string;
  documentName: string;
  title?: string;
  generatedAt: string;
  executiveSummary: string;
  keyFacts: LawyerKitKeyFact[];
  keyClauses: LawyerKitKeyClause[];
  parties: Array<{ id: string; name: string; role: string; address?: string }>;
  keyObligations: Array<{ id: string; party: string; description: string; deadline?: string; sourceClauseId?: string; sourcePage?: number }>;
  importantDeadlines: Array<{ id: string; event: string; targetDate?: string; triggerCondition?: string; sourceClauseId?: string; sourcePage?: number }>;
  potentialRisks: Array<{ id: string; documentId: string; title: string; level: string; perspective: string; clauseRef: string; description: string; recommendation: string; potentialImpact: string; evidence: any[] }>;
  risks?: Array<{ id: string; documentId: string; title: string; level: string; perspective: string; clauseRef: string; description: string; recommendation: string; potentialImpact: string; evidence: any[] }>;
  contractualProtections: string[];
  protections?: LawyerKitProtection[];
  potentialConflicts: Array<{ id: string; documentId: string; clauseAId: string; clauseBId: string; clauseARef: string; clauseBRef: string; interactionDescription: string; impactLevel: string; resolutionRecommendation: string }>;
  conflicts?: Array<{ id: string; documentId: string; clauseAId: string; clauseBId: string; clauseARef: string; clauseBRef: string; interactionDescription: string; impactLevel: string; resolutionRecommendation: string }>;
  scenarioTested?: string;
  potentialFinancialExposure?: string;
  scenarioFindings?: LawyerKitScenarioFinding;
  timeline?: LawyerKitTimelineItem[];
  questionsForLegalProfessional: string[];
  questionsForLawyer?: string[];
  documentsToBring: string[];
  assumptions: string[];
  uncertainty?: string;
  evidenceSummary: Array<{ type: string; documentId?: string; clauseId?: string; section?: string; page?: number; exactExcerpt?: string; act?: string; statuteSection?: string; sourceUrl?: string; citation?: string }>;
  evidence?: Array<{ type: string; documentId?: string; clauseId?: string; section?: string; page?: number; exactExcerpt?: string; act?: string; statuteSection?: string; sourceUrl?: string; citation?: string }>;
  authoritativeLegalSources: Array<{ id: string; title: string; actOrCourt: string; sectionOrArticle: string; summary: string; officialSourceUrl?: string }>;
  applicableLaw?: Array<{ id: string; title: string; actOrCourt: string; sectionOrArticle: string; summary: string; officialSourceUrl?: string }>;
  pdfStoragePath?: string;
  disclaimer: string;
}

export type LawyerKitData = LawyerPrepKit;

