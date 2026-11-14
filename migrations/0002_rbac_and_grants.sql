-- ==============================================================================
-- TWM 3.1 Migration 0002: Authoritative RBAC & Coordinator Grants Schema
-- Engine: PostgreSQL 14+
-- Description: System roles, assignments, faculty cohort scopes, and time-bounded
--              coordinator grants with triage-only boundary enforcement.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table: roles
-- Authoritative catalog of platform roles.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (id, name, description) VALUES
    ('student', 'Student', 'Regular participating student with access to own telemetry, own disputes, and cohort leaderboard views.'),
    ('coordinator', 'Coordinator', 'Peer student coordinator with time-bounded, delegated cohort triage and roster visibility.'),
    ('faculty', 'Faculty', 'Academic faculty member with authoritative management and dispute finalization authority over assigned cohorts.'),
    ('platform_admin', 'Platform Administrator', 'System-wide platform administrator with global configuration and operational oversight.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 2. Table: user_roles
-- Multi-role assignment linking users to platform roles.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles (user_id);

COMMENT ON TABLE user_roles IS 'Authoritative role mappings for users.';

-- ------------------------------------------------------------------------------
-- 3. Table: faculty_cohort_assignments
-- Explicit cohort jurisdiction for faculty members.
-- Invariant: Faculty can ONLY access cohorts explicitly assigned to them.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_cohort_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_faculty_cohort_assignment UNIQUE (faculty_user_id, cohort_id)
);

CREATE INDEX IF NOT EXISTS idx_fca_faculty ON faculty_cohort_assignments (faculty_user_id);
CREATE INDEX IF NOT EXISTS idx_fca_cohort ON faculty_cohort_assignments (cohort_id);

COMMENT ON TABLE faculty_cohort_assignments IS 'Defines explicit cohort jurisdictions for faculty members. Unassigned cohorts are inaccessible.';

-- ------------------------------------------------------------------------------
-- 4. Table: coordinator_grants
-- Time-bounded, revocable privilege grants for student coordinators.
-- Invariant 1: Time-bounded (must have starts_at and expires_at with expires_at > starts_at).
-- Invariant 2: Coordinator Triage-Only Boundary (Coordinators can NEVER be granted
--              FINALIZE_DISPUTE, IMPORT_COHORT_ROSTER, GRANT_COORDINATOR_ROLE, or REVOKE_COORDINATOR_ROLE).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coordinator_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coordinator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    permissions TEXT[] NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Expiry must be strictly after grant start time
    CONSTRAINT chk_grant_time_window CHECK (expires_at > starts_at),

    -- Strict Coordinator Triage-Only Boundary Enforcement in PostgreSQL DDL
    CONSTRAINT chk_coordinator_triage_boundary CHECK (
        NOT ('FINALIZE_DISPUTE' = ANY(permissions))
        AND NOT ('IMPORT_COHORT_ROSTER' = ANY(permissions))
        AND NOT ('GRANT_COORDINATOR_ROLE' = ANY(permissions))
        AND NOT ('REVOKE_COORDINATOR_ROLE' = ANY(permissions))
    )
);

CREATE INDEX IF NOT EXISTS idx_coordinator_grants_lookup 
    ON coordinator_grants (coordinator_user_id, cohort_id, starts_at, expires_at);

CREATE INDEX IF NOT EXISTS idx_coordinator_grants_active
    ON coordinator_grants (coordinator_user_id, cohort_id)
    WHERE revoked_at IS NULL;

COMMENT ON TABLE coordinator_grants IS 'Time-bounded delegation grants enabling student coordinators to assist in dispute triage without adjudication powers.';
COMMENT ON CONSTRAINT chk_coordinator_triage_boundary ON coordinator_grants IS 'Guarantees coordinators can never be granted final dispute adjudication or roster mutation capabilities.';
