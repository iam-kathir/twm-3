-- ==============================================================================
-- TWM 3.1 Migration 0003: Database Sessions & Tamper-Evident Audit Logging
-- Engine: PostgreSQL 14+
-- Description: State-backed authenticated sessions and append-only tamper-evident
--              audit log registry with cryptographic hash chaining.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table: sessions
-- Server-side session tracking with SHA-256 token hashing, rotation, and revocation.
-- Invariant: Raw bearer session tokens are NEVER stored in plaintext.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 digest of 256-bit random token
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rotated_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    ip_address VARCHAR(45), -- IPv4 (15 chars) or IPv6 (45 chars)
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions (session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions (user_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_cleanup ON sessions (expires_at);

COMMENT ON TABLE sessions IS 'Authoritative database-backed session registry with hashed tokens, rotation, and immediate revocation.';
COMMENT ON COLUMN sessions.session_token_hash IS 'Cryptographic SHA-256 hash of the bearer token provided in HTTP cookies / headers.';

-- ------------------------------------------------------------------------------
-- 2. Table: audit_logs
-- Append-only tamper-evident audit ledger with cryptographic hash chaining.
-- Invariant: Records are strictly immutable. Updates and deletes are rejected.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(128),
    cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    previous_log_hash VARCHAR(64) NOT NULL,
    entry_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cohort ON audit_logs (cohort_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);

COMMENT ON TABLE audit_logs IS 'Append-only tamper-evident audit ledger capturing all authorization and administrative events.';
COMMENT ON COLUMN audit_logs.previous_log_hash IS 'Cryptographic hash of preceding audit entry, forming an unbroken verification chain.';
COMMENT ON COLUMN audit_logs.entry_hash IS 'SHA-256 hash digest of this entry payload and link to verify record integrity.';

-- ------------------------------------------------------------------------------
-- 3. Immutability Guard: Trigger to prevent UPDATE or DELETE on audit_logs
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_audit_logs_immutability_guard()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are strictly append-only and cannot be updated or deleted. Violation attempted on ID %', OLD.id
        USING ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_prevent_modification ON audit_logs;
CREATE TRIGGER trg_audit_logs_prevent_modification
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION trg_audit_logs_immutability_guard();
