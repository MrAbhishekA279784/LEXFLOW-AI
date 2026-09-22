-- ==============================================================================
-- LEXFLOW — Database Migration 003: Multi-Agent AI System Schema
-- Supports 4-Agent Architecture, Debates, Findings, Challenges, Telemetry & Preferences
-- ==============================================================================

-- 1. User AI Preferences (Personalization without modifying legal facts)
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    response_style VARCHAR(50) DEFAULT 'professional' CHECK (response_style IN ('professional', 'friendly', 'direct', 'simplified')),
    explanation_mode VARCHAR(50) DEFAULT 'detailed' CHECK (explanation_mode IN ('detailed', 'concise', 'bulleted')),
    format_preference VARCHAR(50) DEFAULT 'bullets' CHECK (format_preference IN ('bullets', 'paragraphs', 'executive_summary')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AI Runs (Master execution tracker & telemetry)
CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('FULL_AUDIT', 'TARGETED_ANALYSIS', 'SCENARIO_STRESS_TEST', 'COMPLIANCE_AUDIT')),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cached')),
    model VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(20) DEFAULT 'v1.0',
    context_hash VARCHAR(64),
    input_token_count INT DEFAULT 0,
    output_token_count INT DEFAULT 0,
    total_token_count INT DEFAULT 0,
    agent_calls INT DEFAULT 0,
    debate_calls INT DEFAULT 0,
    is_cached BOOLEAN DEFAULT FALSE,
    latency_ms INT DEFAULT 0,
    error_code VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Agent Runs (Individual agent lifecycle: Opposing, Defense, Reviewer, Skeptic)
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('opposing_counsel', 'defense_protection', 'compliance_reviewer', 'skeptic')),
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'verification_incomplete')),
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    finding_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Agent Messages (Visible debate timeline and conversation entries)
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL,
    pair_type VARCHAR(50) NOT NULL CHECK (pair_type IN ('risk_defense', 'compliance_skeptic')),
    round_number INT NOT NULL DEFAULT 1,
    finding_id_ref VARCHAR(100),
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('finding', 'challenge', 'rebuttal', 'verification', 'synthesis')),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    referenced_clause_refs JSONB DEFAULT '[]'::jsonb,
    referenced_authority_ids JSONB DEFAULT '[]'::jsonb,
    evidence_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Agent Findings (Structured findings from Opposing, Defense, or Reviewer)
CREATE TABLE IF NOT EXISTS agent_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    finding_id VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    claim TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    document_says TEXT,
    law_says TEXT,
    lexflow_analysis TEXT,
    clause_refs JSONB DEFAULT '[]'::jsonb,
    legal_authority_ids JSONB DEFAULT '[]'::jsonb,
    evidence_ids JSONB DEFAULT '[]'::jsonb,
    proposed_mitigation TEXT,
    confidence NUMERIC DEFAULT 0.85,
    status VARCHAR(50) DEFAULT 'IDENTIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Agent Challenges (Skeptic or Counterpoint challenges)
CREATE TABLE IF NOT EXISTS agent_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    finding_id_ref VARCHAR(100) NOT NULL,
    challenger_agent VARCHAR(50) NOT NULL,
    challenge_outcome VARCHAR(50) NOT NULL CHECK (challenge_outcome IN ('CONFIRMED', 'PARTIALLY_SUPPORTED', 'DISPUTED', 'INSUFFICIENT_EVIDENCE', 'NOT_APPLICABLE')),
    challenge_argument TEXT NOT NULL,
    alternative_interpretation TEXT,
    missing_information JSONB DEFAULT '[]'::jsonb,
    is_materially_disputed BOOLEAN DEFAULT FALSE,
    counter_clause_refs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Debate Rounds (Controlled Pair Exchanges)
CREATE TABLE IF NOT EXISTS debate_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    pair_type VARCHAR(50) NOT NULL CHECK (pair_type IN ('risk_defense', 'compliance_skeptic')),
    finding_id_ref VARCHAR(100) NOT NULL,
    round_number INT NOT NULL,
    initiator_argument TEXT NOT NULL,
    counter_argument TEXT NOT NULL,
    unresolved_question TEXT,
    early_stopped BOOLEAN DEFAULT FALSE,
    early_stop_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Analysis Results (Final synthesized legal audit output)
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID UNIQUE NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    synthesis_data JSONB NOT NULL,
    personalized_explanation TEXT,
    human_review_recommended BOOLEAN DEFAULT FALSE,
    dispute_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_user_ai_preferences_user_id ON user_ai_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_document_id ON ai_runs(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_user_id ON ai_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_context_hash ON ai_runs(context_hash);
CREATE INDEX IF NOT EXISTS idx_agent_runs_ai_run_id ON agent_runs(ai_run_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_ai_run_id ON agent_messages(ai_run_id);
CREATE INDEX IF NOT EXISTS idx_agent_findings_ai_run_id ON agent_findings(ai_run_id);
CREATE INDEX IF NOT EXISTS idx_agent_challenges_ai_run_id ON agent_challenges(ai_run_id);
CREATE INDEX IF NOT EXISTS idx_debate_rounds_ai_run_id ON debate_rounds(ai_run_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_document_id ON analysis_results(document_id);

-- ==============================================================================
-- 10. ROW-LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_ai_preferences_policy ON user_ai_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_ai_runs_policy ON ai_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_agent_runs_policy ON agent_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_analysis_results_policy ON analysis_results FOR ALL USING (auth.uid() = user_id);
