export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'extracting' 
  | 'analyzing' 
  | 'building_model' 
  | 'building_graph' 
  | 'detecting_risks' 
  | 'retrieving_law' 
  | 'generating_evidence' 
  | 'completed' 
  | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Perspective = 'adversarial' | 'protection' | 'synthesis';
export type ActorRole = 'tenant' | 'landlord' | 'employer' | 'employee' | 'client' | 'contractor' | 'mutual' | string;

export interface ExtractedParty {
  id: string;
  name: string;
  role: ActorRole;
  identifier?: string;
  sourceClauseId?: string;
  sourcePage?: number;
}

export interface ExtractedObligation {
  id: string;
  actor: ActorRole;
  action: string;
  description: string;
  frequency?: 'once' | 'daily' | 'monthly' | 'annually' | 'on_demand';
  dueDay?: number;
  conditions?: string[];
  sourceClauseId: string;
  sourcePage: number;
  confidence: number;
}

export interface ExtractedRight {
  id: string;
  beneficiary: ActorRole;
  description: string;
  conditions?: string[];
  sourceClauseId: string;
  sourcePage: number;
  confidence: number;
}

export interface ExtractedPayment {
  id: string;
  payer: ActorRole;
  payee: ActorRole;
  purpose: 'rent' | 'deposit' | 'maintenance' | 'service_fee' | 'utility' | 'other';
  amount: number; // in base currency units (e.g. INR)
  currency: string;
  frequency: 'once' | 'monthly' | 'quarterly' | 'annually';
  dueDay?: number;
  gracePeriodDays?: number;
  sourceClauseId: string;
  sourcePage: number;
}

export interface ExtractedDeadline {
  id: string;
  actor: ActorRole;
  description: string;
  durationDays?: number;
  triggerEvent: string;
  mandatory: boolean;
  sourceClauseId: string;
  sourcePage: number;
}

export interface ExtractedPenalty {
  id: string;
  actorSubject: ActorRole;
  triggerCondition: string;
  penaltyType: 'daily_fine' | 'percentage' | 'forfeiture' | 'flat_fee' | 'damages' | 'termination';
  rate?: number;
  rateUnit?: 'per_day' | 'percentage_per_annum' | 'fixed';
  description: string;
  sourceClauseId: string;
  sourcePage: number;
}

export interface ExtractedCondition {
  id: string;
  description: string;
  predicate: string;
  outcomes: string[];
  sourceClauseId: string;
  sourcePage: number;
}

export interface ExtractedTerminationClause {
  id: string;
  noticePeriodDays: number;
  grounds: 'convenience' | 'for_cause' | 'mutual_consent' | 'lock_in_breach';
  lockInMonths?: number;
  consequences: string[];
  sourceClauseId: string;
  sourcePage: number;
}

export interface LegalModelData {
  documentId: string;
  parties: ExtractedParty[];
  obligations: ExtractedObligation[];
  rights: ExtractedRight[];
  deadlines: ExtractedDeadline[];
  conditions: ExtractedCondition[];
  payments: ExtractedPayment[];
  penalties: ExtractedPenalty[];
  termination: ExtractedTerminationClause[];
  events: string[];
  dependencies: { fromEntityId: string; toEntityId: string; type: string }[];
  conflicts: { clauseAId: string; clauseBId: string; description: string }[];
}

export type GraphNodeType = 
  | 'Party'
  | 'Obligation'
  | 'Right'
  | 'Payment'
  | 'Deadline'
  | 'Condition'
  | 'Event'
  | 'Penalty'
  | 'Consequence'
  | 'Action'
  | 'Statute'
  | 'Section'
  | 'Rule'
  | 'Regulation'
  | 'Judgment';

export type GraphRelationshipType = 
  | 'OWES'
  | 'REQUIRES'
  | 'TRIGGERS'
  | 'DEPENDS_ON'
  | 'LEADS_TO'
  | 'EXPIRES_ON'
  | 'PROTECTED_BY'
  | 'CONFLICTS_WITH'
  | 'SUPPORTED_BY'
  | 'APPLIES_TO';

export interface GraphNode {
  id: string;
  documentId?: string;
  type: GraphNodeType;
  label: string;
  description?: string;
  data?: Record<string, any>;
  sourceClauseId?: string;
  sourcePage?: number;
  evidenceId?: string;
  position?: { x: number; y: number };
  createdAt?: string;
}

export interface GraphEdge {
  id: string;
  documentId?: string;
  source: string;
  target: string;
  relationship: GraphRelationshipType;
  label?: string;
  weight?: number;
  metadata?: Record<string, any>;
  sourceClauseId?: string;
  evidenceId?: string;
  createdAt?: string;
}

export interface LegalGraph {
  documentId?: string;
  versionId?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    generatedAt: string;
    nodeCount: number;
    edgeCount: number;
    isValid?: boolean;
    errors?: string[];
  };
}

export interface LegalAuthority {
  id: string;
  sourceType: 'constitution' | 'central_act' | 'state_act' | 'rule' | 'regulation' | 'judgment';
  title: string;
  actOrCourt: string;
  sectionOrArticle: string;
  subSectionOrPara?: string;
  officialSourceUrl?: string;
  summary: string;
  relevanceExplanation: string;
  retrievedAt: string;
  hierarchyLevel: number; // 1: Constitution, 2: Central Act, 3: State Act, 4: Rules, 5: Precedent
  precedentCitation?: string;
  court?: string;
}

export interface EvidenceItem {
  type: 'document' | 'legal_authority' | 'judgment';
  documentId?: string;
  clauseId?: string;
  section?: string;
  page?: number;
  exactExcerpt?: string;
  act?: string;
  statuteSection?: string;
  sourceUrl?: string;
  court?: string;
  citation?: string;
  retrievalTimestamp?: string;
  explanation?: string;
  courtOrStatute?: string;
  officialSourceUrl?: string;
}

export interface NormalizedScenario {
  rawPrompt: string;
  actor: ActorRole;
  events: Array<{
    type: 'miss_payment' | 'vacate_property' | 'break_notice' | 'damage_property' | 'sublet' | 'refuse_escalation' | 'custom';
    durationMonths?: number;
    amount?: number;
    description?: string;
  }>;
  intent: 'understand_consequences' | 'financial_exposure' | 'defense_options' | 'dispute_resolution';
  isClear: boolean;
  clarificationOptions?: string[];
}

export interface ScenarioResultTimelineStep {
  step: number;
  time: string;
  event: string;
  status: 'past' | 'trigger' | 'consequence';
  clauseRef?: string;
}

export interface FinancialBreakdownItem {
  label: string;
  amount: string;
  amountMinor: number; // in paise or integer units
  calculationFormula?: string;
  note: string;
  sourceClauseId?: string;
}

export interface ScenarioSimulationResult {
  id: string;
  documentId: string;
  inputPrompt: string;
  normalizedInterpretation: string;
  title: string;
  documentSays: string;
  lawSays: string;
  lexflowAnalysis: string;
  totalFinancialImpact: string;
  totalFinancialImpactMinor: number;
  financialBreakdown: FinancialBreakdownItem[];
  keyPoints: string[];
  relevantClauses: Array<{
    clauseId: string;
    section: string;
    title: string;
    excerpt: string;
    page: number;
  }>;
  applicableLaw: LegalAuthority[];
  timeline: ScenarioResultTimelineStep[];
  risks: Array<{
    title: string;
    description: string;
    level: RiskLevel;
  }>;
  protections: Array<{
    title: string;
    description: string;
  }>;
  conflicts: Array<{
    clauseA: string;
    clauseB: string;
    description: string;
  }>;
  evidence: EvidenceItem[];
  suggestedNextSteps: string[];
  disclaimer: string;
  targetNodeIds?: string[];
  userId?: string;
  status: 'completed' | 'needs_clarification' | 'failed';
}

export interface RiskFinding {
  id: string;
  documentId: string;
  title: string;
  level: 'critical' | 'moderate' | 'low';
  perspective: 'adversarial' | 'protection';
  clauseRef: string;
  description: string;
  recommendation: string;
  potentialImpact: string;
  evidence: EvidenceItem[];
}

export interface ConflictFinding {
  id: string;
  documentId: string;
  clauseAId: string;
  clauseBId: string;
  clauseARef: string;
  clauseBRef: string;
  interactionDescription: string;
  impactLevel: 'high' | 'medium' | 'low';
  resolutionRecommendation: string;
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
  financialBreakdown: FinancialBreakdownItem[];
  timeline: ScenarioResultTimelineStep[];
  uncertainty?: string;
}

export interface LawyerKitData {
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
  parties: ExtractedParty[];
  keyObligations: ExtractedObligation[];
  importantDeadlines: ExtractedDeadline[];
  potentialRisks: RiskFinding[];
  risks?: RiskFinding[];
  contractualProtections: string[];
  protections?: LawyerKitProtection[];
  potentialConflicts: ConflictFinding[];
  conflicts?: ConflictFinding[];
  scenarioTested?: string;
  potentialFinancialExposure?: string;
  scenarioFindings?: LawyerKitScenarioFinding;
  timeline?: LawyerKitTimelineItem[];
  questionsForLegalProfessional: string[];
  questionsForLawyer?: string[];
  documentsToBring: string[];
  assumptions: string[];
  uncertainty?: string;
  evidenceSummary: EvidenceItem[];
  evidence?: EvidenceItem[];
  authoritativeLegalSources: LegalAuthority[];
  applicableLaw?: LegalAuthority[];
  pdfStoragePath?: string;
  disclaimer: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}
