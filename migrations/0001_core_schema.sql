-- ==============================================================================
-- TWM 3.1 Migration 0001: Core Relational Schema
-- Engine: PostgreSQL 14+
-- Description: Core identity, cohort structures, and cohort membership mapping.
-- ==============================================================================

-- Enable UUID extension for cryptographically secure UUID v4 generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- Core identity entity for all platform actors (students, coordinators, faculty, admins).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_no VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_users_roll_no ON users (roll_no);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

COMMENT ON TABLE users IS 'Authoritative user identities across students, coordinators, faculty, and administrators.';
COMMENT ON COLUMN users.roll_no IS 'Unique institutional identifier / student roll number.';
COMMENT ON COLUMN users.email IS 'Verified institutional or operational email address.';

-- ------------------------------------------------------------------------------
-- 2. Table: cohorts
-- Academic classes / sections / batches tracked in TWM.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    department VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cohorts_code ON cohorts (code);
CREATE INDEX IF NOT EXISTS idx_cohorts_dept_year ON cohorts (department, academic_year);
CREATE INDEX IF NOT EXISTS idx_cohorts_is_active ON cohorts (is_active);

COMMENT ON TABLE cohorts IS 'Authoritative cohorts (classes / sections / academic years).';
COMMENT ON COLUMN cohorts.code IS 'Standard cohort code (e.g., CS-2026-A, IT-2025-B).';

-- ------------------------------------------------------------------------------
-- 3. Table: cohort_memberships
-- Association between users and cohorts, tracking role and membership status.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cohort_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'student',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cohort_memberships_user_cohort UNIQUE (user_id, cohort_id),
    CONSTRAINT chk_cohort_membership_role CHECK (role IN ('student', 'coordinator')),
    CONSTRAINT chk_cohort_membership_status CHECK (status IN ('active', 'suspended', 'graduated'))
);

CREATE INDEX IF NOT EXISTS idx_cohort_memberships_user ON cohort_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_memberships_cohort_status ON cohort_memberships (cohort_id, status);
CREATE INDEX IF NOT EXISTS idx_cohort_memberships_role ON cohort_memberships (cohort_id, role);

COMMENT ON TABLE cohort_memberships IS 'Roster enrollment linking users to specific academic cohorts.';
COMMENT ON COLUMN cohort_memberships.role IS 'Role of the member within the cohort: student or student coordinator.';
COMMENT ON COLUMN cohort_memberships.status IS 'Enrollment status: active, suspended, or graduated.';
