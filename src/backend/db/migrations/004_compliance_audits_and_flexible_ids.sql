-- ==============================================================================
-- LEXFLOW — Database Migration 004: Compliance Audits & Flexible Identifiers
-- Adds compliance_audits table and updates primary/foreign key columns to flexible string types
-- ==============================================================================

-- 1. Alter ID columns to VARCHAR(255) so UUIDs, Firebase UIDs, and custom slugs are seamlessly accepted
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255) USING id::text;

ALTER TABLE documents ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE documents ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;

ALTER TABLE document_pages ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE document_pages ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

ALTER TABLE clauses ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE clauses ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

ALTER TABLE legal_models ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE legal_models ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

ALTER TABLE graph_nodes ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE graph_nodes ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

ALTER TABLE graph_edges ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE graph_edges ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

ALTER TABLE analysis_jobs ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE analysis_jobs ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;
ALTER TABLE analysis_jobs ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;

ALTER TABLE document_chunks ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE document_chunks ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

ALTER TABLE scenarios ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE scenarios ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;
ALTER TABLE scenarios ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;

ALTER TABLE lawyer_kits ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE lawyer_kits ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;
ALTER TABLE lawyer_kits ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;

ALTER TABLE document_versions ALTER COLUMN id TYPE VARCHAR(255) USING id::text;
ALTER TABLE document_versions ALTER COLUMN document_id TYPE VARCHAR(255) USING document_id::text;

-- 2. Create compliance_audits table
CREATE TABLE IF NOT EXISTS compliance_audits (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'queued',
    current_step VARCHAR(100),
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    summary_metrics JSONB DEFAULT '{}'::jsonb,
    findings JSONB DEFAULT '[]'::jsonb,
    debate_log JSONB DEFAULT '[]'::jsonb,
    applicable_authorities JSONB DEFAULT '[]'::jsonb,
    overall_executive_summary TEXT DEFAULT '',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_audits_doc_user ON compliance_audits(document_id, user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audits_user_id ON compliance_audits(user_id);

ALTER TABLE compliance_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_compliance_audits_policy ON compliance_audits 
    FOR ALL USING (auth.uid()::text = user_id);
