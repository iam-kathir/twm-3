/**
-- ==============================================================================
-- TWM 3.1 Authoritative Server-Side RBAC Authorization Engine
-- ==============================================================================
*/

import type {
  Actor,
  AuthorizationContext,
  AuthorizationDecision,
  CoordinatorGrant,
  Permission,
} from "./types.ts";
import {
  FORBIDDEN_COORDINATOR_PERMISSIONS,
  STUDENT_BASE_PERMISSIONS,
} from "./permissions.ts";

/**
 * Custom error thrown when an authoritative permission assertion fails.
 */
export class AuthorizationError extends Error {
  public readonly decision: AuthorizationDecision;

  constructor(decision: AuthorizationDecision) {
    super(`Authorization denied [${decision.code}]: ${decision.reason}`);
    this.name = "AuthorizationError";
    this.decision = decision;
  }
}

/**
 * Verifies whether an actor has jurisdiction over a given cohort.
 * - Platform Admin: Global access across all cohorts.
 * - Faculty: Only explicitly assigned cohorts (via faculty_cohort_assignments).
 * - Coordinator: Handled via time-bounded CoordinatorGrants.
 * - Student: False for administrative cohort-level jurisdiction.
 */
export function verifyCohortAccess(
  actor: Actor,
  cohortId: string,
  facultyCohortsOverride?: string[]
): boolean {
  if (!actor || !cohortId) return false;
  if (actor.isActive === false) return false;

  // Platform admin has system-wide jurisdiction
  if (actor.roles.includes("platform_admin")) {
    return true;
  }

  // Faculty must be explicitly assigned to the cohort
  if (actor.roles.includes("faculty")) {
    const assigned = facultyCohortsOverride ?? actor.assignedCohorts ?? [];
    return assigned.includes(cohortId);
  }

  return false;
}

/**
 * Evaluates whether a coordinator possesses an active, valid, non-expired, non-revoked grant
 * for a specific cohort and permission.
 * Strictly enforces:
 * 1. Coordinator Triage-Only Boundary (FINALIZE_DISPUTE, IMPORT_COHORT_ROSTER are permanently barred).
 * 2. Time-bounded start and expiry constraints.
 * 3. Immediate revocation enforcement.
 */
export function verifyCoordinatorGrant(
  actor: Actor,
  cohortId: string,
  permission: Permission,
  grants?: CoordinatorGrant[],
  nowOverride?: Date | number
): {
  valid: boolean;
  code:
    | "ALLOWED"
    | "COORDINATOR_BOUNDARY_VIOLATION"
    | "GRANT_EXPIRED"
    | "GRANT_REVOKED"
    | "GRANT_NOT_STARTED"
    | "NO_ACTIVE_GRANT";
  reason: string;
  grant?: CoordinatorGrant;
} {
  // Invariant 1: Coordinator Triage-Only Boundary
  if (FORBIDDEN_COORDINATOR_PERMISSIONS.has(permission)) {
    return {
      valid: false,
      code: "COORDINATOR_BOUNDARY_VIOLATION",
      reason: `Coordinators can NEVER be granted or execute ${permission}. Triage and roster review only.`,
    };
  }

  if (!grants || grants.length === 0) {
    return {
      valid: false,
      code: "NO_ACTIVE_GRANT",
      reason: `No coordinator grants registered for user ${actor.id} in cohort ${cohortId}.`,
    };
  }

  const nowMs = nowOverride instanceof Date ? nowOverride.getTime() : typeof nowOverride === "number" ? nowOverride : Date.now();

  // Find candidate grants matching actor, cohort, and permission
  const matchingGrants = grants.filter(
    (g) => g.coordinatorUserId === actor.id && g.cohortId === cohortId && g.permissions.includes(permission)
  );

  if (matchingGrants.length === 0) {
    return {
      valid: false,
      code: "NO_ACTIVE_GRANT",
      reason: `User ${actor.id} lacks a grant authorizing permission ${permission} for cohort ${cohortId}.`,
    };
  }

  // Evaluate candidate grants (if any valid active grant exists, allow)
  let latestFailureReason = "Grant validation failed";
  let latestFailureCode:
    | "COORDINATOR_BOUNDARY_VIOLATION"
    | "GRANT_EXPIRED"
    | "GRANT_REVOKED"
    | "GRANT_NOT_STARTED"
    | "NO_ACTIVE_GRANT" = "NO_ACTIVE_GRANT";

  for (const grant of matchingGrants) {
    // Check if grant itself attempts to include forbidden permissions
    const illegalPerm = grant.permissions.find((p) => FORBIDDEN_COORDINATOR_PERMISSIONS.has(p));
    if (illegalPerm) {
      return {
        valid: false,
        code: "COORDINATOR_BOUNDARY_VIOLATION",
        reason: `Grant contains forbidden permission ${illegalPerm}. Triage boundary violated.`,
      };
    }

    // Check revocation
    if (grant.revokedAt) {
      latestFailureCode = "GRANT_REVOKED";
      latestFailureReason = `Grant ${grant.id} was revoked on ${new Date(grant.revokedAt).toISOString()}${grant.revocationReason ? ` (${grant.revocationReason})` : ""}.`;
      continue;
    }

    const startMs = new Date(grant.startsAt).getTime();
    const expireMs = new Date(grant.expiresAt).getTime();

    // Check start time
    if (nowMs < startMs) {
      latestFailureCode = "GRANT_NOT_STARTED";
      latestFailureReason = `Grant ${grant.id} is not yet active (starts at ${new Date(grant.startsAt).toISOString()}).`;
      continue;
    }

    // Check expiry
    if (nowMs > expireMs) {
      latestFailureCode = "GRANT_EXPIRED";
      latestFailureReason = `Grant ${grant.id} expired at ${new Date(grant.expiresAt).toISOString()}.`;
      continue;
    }

    // Grant is active, valid, and within time window
    return {
      valid: true,
      code: "ALLOWED",
      reason: `Active grant ${grant.id} valid until ${new Date(grant.expiresAt).toISOString()}.`,
      grant,
    };
  }

  return {
    valid: false,
    code: latestFailureCode,
    reason: latestFailureReason,
  };
}

/**
 * Authoritative Server-Side RBAC Permission Checker.
 * Evaluates actor role, assigned scopes, coordinator time-bounded grants,
 * student ownership, and platform admin jurisdiction.
 */
export function checkPermission(
  actor: Actor,
  permission: Permission,
  context: AuthorizationContext = {}
): AuthorizationDecision {
  const evaluatedAt = new Date().toISOString();

  // 1. Authenticated Actor Check
  if (!actor || !actor.id) {
    return {
      granted: false,
      code: "UNAUTHENTICATED",
      reason: "No authenticated actor context provided.",
      permission,
      cohortId: context.cohortId,
      evaluatedAt,
    };
  }

  // 2. Active Account Check
  if (actor.isActive === false) {
    return {
      granted: false,
      code: "USER_INACTIVE",
      reason: `User account ${actor.id} is deactivated or suspended.`,
      actorId: actor.id,
      permission,
      cohortId: context.cohortId,
      evaluatedAt,
    };
  }

  // 3. Platform Admin: System-wide access with authoritative audit logging
  if (actor.roles.includes("platform_admin")) {
    return {
      granted: true,
      code: "ALLOWED",
      reason: "Platform Administrator granted system-wide authorization.",
      actorId: actor.id,
      role: "platform_admin",
      permission,
      cohortId: context.cohortId,
      evaluatedAt,
    };
  }

  // 4. Faculty: Authoritative within assigned cohorts
  if (actor.roles.includes("faculty")) {
    // If permission requires cohort jurisdiction
    const cohortScopedPermissions: ReadonlySet<Permission> = new Set<Permission>([
      "VIEW_COHORT_ROSTER",
      "IMPORT_COHORT_ROSTER",
      "ASSIST_DISPUTE_TRIAGE",
      "FINALIZE_DISPUTE",
      "GRANT_COORDINATOR_ROLE",
      "REVOKE_COORDINATOR_ROLE",
    ]);

    if (cohortScopedPermissions.has(permission)) {
      if (!context.cohortId) {
        return {
          granted: false,
          code: "MISSING_COHORT_CONTEXT",
          reason: `Permission ${permission} requires explicit cohortId context.`,
          actorId: actor.id,
          role: "faculty",
          permission,
          evaluatedAt,
        };
      }

      const hasCohortAccess = verifyCohortAccess(
        actor,
        context.cohortId,
        context.facultyCohortAssignments
      );

      if (!hasCohortAccess) {
        return {
          granted: false,
          code: "COHORT_NOT_ASSIGNED",
          reason: `Faculty ${actor.id} is not assigned to cohort ${context.cohortId}. Cross-cohort access denied.`,
          actorId: actor.id,
          role: "faculty",
          permission,
          cohortId: context.cohortId,
          evaluatedAt,
        };
      }

      return {
        granted: true,
        code: "ALLOWED",
        reason: `Faculty authorized for ${permission} on assigned cohort ${context.cohortId}.`,
        actorId: actor.id,
        role: "faculty",
        permission,
        cohortId: context.cohortId,
        evaluatedAt,
      };
    }

    // Faculty personal dispute actions (if faculty is also a participant)
    if (permission === "VIEW_OWN_DISPUTES" || permission === "LODGE_DISPUTE") {
      return {
        granted: true,
        code: "ALLOWED",
        reason: `Faculty authorized for ${permission}.`,
        actorId: actor.id,
        role: "faculty",
        permission,
        evaluatedAt,
      };
    }
  }

  // 5. Coordinator: Delegated Triage Assistant
  if (actor.roles.includes("coordinator")) {
    // Invariant: Coordinators can NEVER be granted finalization or roster mutation
    if (FORBIDDEN_COORDINATOR_PERMISSIONS.has(permission)) {
      return {
        granted: false,
        code: "COORDINATOR_BOUNDARY_VIOLATION",
        reason: `Coordinators can NEVER be granted or execute ${permission} (Strict triage boundary invariant).`,
        actorId: actor.id,
        role: "coordinator",
        permission,
        cohortId: context.cohortId,
        evaluatedAt,
      };
    }

    // Personal student dispute permissions
    if (permission === "VIEW_OWN_DISPUTES" || permission === "LODGE_DISPUTE") {
      if (context.studentId && context.studentId !== actor.id) {
        return {
          granted: false,
          code: "NOT_DISPUTE_OWNER",
          reason: `Students and coordinators can only access their own disputes. Target ${context.studentId} does not match actor ${actor.id}.`,
          actorId: actor.id,
          role: "coordinator",
          permission,
          evaluatedAt,
        };
      }

      return {
        granted: true,
        code: "ALLOWED",
        reason: "Coordinator authorized for own dispute operations.",
        actorId: actor.id,
        role: "coordinator",
        permission,
        evaluatedAt,
      };
    }

    // Delegated cohort operations (VIEW_COHORT_ROSTER, ASSIST_DISPUTE_TRIAGE)
    if (permission === "VIEW_COHORT_ROSTER" || permission === "ASSIST_DISPUTE_TRIAGE") {
      if (!context.cohortId) {
        return {
          granted: false,
          code: "MISSING_COHORT_CONTEXT",
          reason: `Permission ${permission} requires explicit cohortId context.`,
          actorId: actor.id,
          role: "coordinator",
          permission,
          evaluatedAt,
        };
      }

      const grantResult = verifyCoordinatorGrant(
        actor,
        context.cohortId,
        permission,
        context.grants,
        context.now
      );

      if (!grantResult.valid) {
        return {
          granted: false,
          code: grantResult.code,
          reason: grantResult.reason,
          actorId: actor.id,
          role: "coordinator",
          permission,
          cohortId: context.cohortId,
          evaluatedAt,
        };
      }

      return {
        granted: true,
        code: "ALLOWED",
        reason: `Coordinator authorized via active grant ${grantResult.grant?.id} for cohort ${context.cohortId}.`,
        actorId: actor.id,
        role: "coordinator",
        permission,
        cohortId: context.cohortId,
        evaluatedAt,
      };
    }
  }

  // 6. Student: Standard participating member
  if (actor.roles.includes("student")) {
    if (STUDENT_BASE_PERMISSIONS.has(permission)) {
      if (context.studentId && context.studentId !== actor.id) {
        return {
          granted: false,
          code: "NOT_DISPUTE_OWNER",
          reason: `Students can only access their own disputes. Target ${context.studentId} does not match actor ${actor.id}.`,
          actorId: actor.id,
          role: "student",
          permission,
          evaluatedAt,
        };
      }

      return {
        granted: true,
        code: "ALLOWED",
        reason: "Student authorized for own dispute operations.",
        actorId: actor.id,
        role: "student",
        permission,
        evaluatedAt,
      };
    }

    return {
      granted: false,
      code: "FORBIDDEN",
      reason: `Student role lacks authorization for ${permission}.`,
      actorId: actor.id,
      role: "student",
      permission,
      cohortId: context.cohortId,
      evaluatedAt,
    };
  }

  // 7. Fallthrough: Unknown or unauthorized role
  return {
    granted: false,
    code: "FORBIDDEN",
    reason: `Actor ${actor.id} lacks recognized role permissions for ${permission}.`,
    actorId: actor.id,
    role: actor.primaryRole,
    permission,
    cohortId: context.cohortId,
    evaluatedAt,
  };
}

/**
 * Asserts that the actor possesses permission, throwing AuthorizationError on denial.
 */
export function assertPermission(
  actor: Actor,
  permission: Permission,
  context: AuthorizationContext = {}
): AuthorizationDecision {
  const decision = checkPermission(actor, permission, context);
  if (!decision.granted) {
    throw new AuthorizationError(decision);
  }
  return decision;
}
