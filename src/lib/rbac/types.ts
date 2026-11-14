/**
-- ==============================================================================
-- TWM 3.1 Authoritative Server-Side RBAC Type Definitions
-- ==============================================================================
*/

/**
 * Platform Roles (§11.1, §17.5)
 */
export type Role = "student" | "coordinator" | "faculty" | "platform_admin";

/**
 * Discrete Authoritative Permissions
 */
export type Permission =
  | "VIEW_OWN_DISPUTES"
  | "LODGE_DISPUTE"
  | "ASSIST_DISPUTE_TRIAGE"
  | "FINALIZE_DISPUTE"
  | "VIEW_COHORT_ROSTER"
  | "IMPORT_COHORT_ROSTER"
  | "GRANT_COORDINATOR_ROLE"
  | "REVOKE_COORDINATOR_ROLE";

/**
 * Authenticated Actor representing an active user identity in the system.
 */
export interface Actor {
  id: string;
  rollNo?: string;
  name: string;
  email: string;
  roles: Role[];
  primaryRole: Role;
  assignedCohorts?: string[]; // Cohorts explicitly assigned if faculty
  isActive?: boolean;
}

/**
 * Time-bounded, revocable privilege grant for a student coordinator.
 */
export interface CoordinatorGrant {
  id: string;
  coordinatorUserId: string;
  cohortId: string;
  grantedBy: string;
  permissions: Permission[];
  startsAt: string | Date;
  expiresAt: string | Date;
  revokedAt?: string | Date | null;
  revocationReason?: string | null;
  createdAt?: string | Date;
}

/**
 * Contextual payload passed during an authorization check.
 */
export interface AuthorizationContext {
  cohortId?: string;
  studentId?: string; // Target student ID (for dispute ownership verification)
  targetUserId?: string;
  grants?: CoordinatorGrant[]; // Active grants to evaluate for coordinators
  facultyCohortAssignments?: string[]; // Assigned cohorts for faculty evaluation
  now?: Date | number; // Optional timestamp override for time-bounded evaluation
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Deterministic authorization evaluation outcome.
 */
export interface AuthorizationDecision {
  granted: boolean;
  code:
    | "ALLOWED"
    | "FORBIDDEN"
    | "UNAUTHENTICATED"
    | "USER_INACTIVE"
    | "COORDINATOR_BOUNDARY_VIOLATION"
    | "GRANT_EXPIRED"
    | "GRANT_REVOKED"
    | "GRANT_NOT_STARTED"
    | "NO_ACTIVE_GRANT"
    | "COHORT_NOT_ASSIGNED"
    | "NOT_DISPUTE_OWNER"
    | "MISSING_COHORT_CONTEXT";
  reason: string;
  actorId?: string;
  role?: Role;
  permission: Permission;
  cohortId?: string;
  evaluatedAt: string;
}

/**
 * Database-backed session representation.
 */
export interface DbSession {
  id: string;
  userId: string;
  sessionTokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  rotatedAt: Date | null;
  revokedAt: Date | null;
  revocationReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * Tamper-evident structured audit log entry.
 */
export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string | null;
  cohortId: string | null;
  payload: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  previousLogHash: string;
  entryHash: string;
  createdAt: string;
}
