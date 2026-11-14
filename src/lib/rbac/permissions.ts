/**
-- ==============================================================================
-- TWM 3.1 Role & Permission Matrix & Invariant Boundaries
-- ==============================================================================
*/

import type { Permission, Role } from "./types.ts";

/**
 * All platform permissions catalog.
 */
export const ALL_PERMISSIONS: readonly Permission[] = [
  "VIEW_OWN_DISPUTES",
  "LODGE_DISPUTE",
  "ASSIST_DISPUTE_TRIAGE",
  "FINALIZE_DISPUTE",
  "VIEW_COHORT_ROSTER",
  "IMPORT_COHORT_ROSTER",
  "GRANT_COORDINATOR_ROLE",
  "REVOKE_COORDINATOR_ROLE",
] as const;

/**
 * Base permissions inherently granted to standard students.
 */
export const STUDENT_BASE_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "VIEW_OWN_DISPUTES",
  "LODGE_DISPUTE",
]);

/**
 * Allowed permissions delegable to a student coordinator via CoordinatorGrant.
 * Coordinators are triage assistants only.
 */
export const ALLOWED_COORDINATOR_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "VIEW_OWN_DISPUTES",
  "LODGE_DISPUTE",
  "VIEW_COHORT_ROSTER",
  "ASSIST_DISPUTE_TRIAGE",
]);

/**
 * FORBIDDEN COORDINATOR PERMISSIONS (Strict Architectural Invariant).
 * A coordinator can NEVER under any circumstances be granted:
 * - FINALIZE_DISPUTE (Adjudication is strictly faculty / admin)
 * - IMPORT_COHORT_ROSTER (Roster modification is strictly faculty / admin)
 * - GRANT_COORDINATOR_ROLE (Delegation authority is strictly faculty / admin)
 * - REVOKE_COORDINATOR_ROLE (Delegation authority is strictly faculty / admin)
 */
export const FORBIDDEN_COORDINATOR_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "FINALIZE_DISPUTE",
  "IMPORT_COHORT_ROSTER",
  "GRANT_COORDINATOR_ROLE",
  "REVOKE_COORDINATOR_ROLE",
]);

/**
 * Authoritative permissions available to faculty within assigned cohorts.
 */
export const FACULTY_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "VIEW_OWN_DISPUTES",
  "LODGE_DISPUTE",
  "VIEW_COHORT_ROSTER",
  "IMPORT_COHORT_ROSTER",
  "ASSIST_DISPUTE_TRIAGE",
  "FINALIZE_DISPUTE",
  "GRANT_COORDINATOR_ROLE",
  "REVOKE_COORDINATOR_ROLE",
]);

/**
 * Validates if a permission is legally delegable to a student coordinator.
 */
export function isAllowedForCoordinator(permission: Permission): boolean {
  if (FORBIDDEN_COORDINATOR_PERMISSIONS.has(permission)) {
    return false;
  }
  return ALLOWED_COORDINATOR_PERMISSIONS.has(permission);
}

/**
 * Verifies that a list of proposed permissions complies with the Coordinator Triage-Only boundary.
 * Returns valid = false with violating permissions if boundary is breached.
 */
export function validateCoordinatorGrantPermissions(permissions: Permission[]): {
  valid: boolean;
  forbidden: Permission[];
} {
  const forbidden = permissions.filter((p) => FORBIDDEN_COORDINATOR_PERMISSIONS.has(p));
  return {
    valid: forbidden.length === 0,
    forbidden,
  };
}

/**
 * Checks if a given role possesses a base capability before context evaluation.
 */
export function isRoleRecognized(role: string): role is Role {
  return role === "student" || role === "coordinator" || role === "faculty" || role === "platform_admin";
}
