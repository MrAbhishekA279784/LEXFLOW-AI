-- ==============================================================================
-- LEXFLOW — Database Migration 005: Scenario Stress-Test Engine Persistence
-- Extends scenarios table with complete Group 7 structured columns
-- ==============================================================================

ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS scenario_type VARCHAR(100) DEFAULT 'CUSTOM';
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS target_node_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS total_financial_impact_minor BIGINT DEFAULT 0;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS relevant_clauses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS applicable_law JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS risks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS protections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS conflicts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS suggested_next_steps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS assumptions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS disclaimer TEXT DEFAULT '';
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS clarification_options JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_scenarios_doc_user ON scenarios(document_id, user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
