-- ==============================================================================
-- LEXFLOW — Database Migration 002: Document Versions & Change Tracking
-- Tracks revisions, clause modifications, diffs, and reversion audit logs
-- ==============================================================================

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) DEFAULT 'User',
    summary TEXT NOT NULL,
    change_type VARCHAR(50) DEFAULT 'clause_amendment',
    change_count INT DEFAULT 0,
    risk_count INT DEFAULT 0,
    clause_count INT DEFAULT 0,
    changes JSONB DEFAULT '[]'::jsonb,
    snapshot_clauses JSONB DEFAULT '[]'::jsonb,
    is_current BOOLEAN DEFAULT false,
    reverted_from_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_is_current ON document_versions(document_id, is_current);

-- Row Level Security
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access versions of their documents"
    ON document_versions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_versions.document_id
        )
    );
