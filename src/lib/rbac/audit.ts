/**
-- ==============================================================================
-- TWM 3.1 Tamper-Evident Structured Audit Logging System
-- Features: Cryptographic hash-chaining (SHA-256), immutable append-only records,
--           decision & administrative action logging, and chain integrity verification.
-- ==============================================================================
*/

import crypto from "node:crypto";
import type {
  Actor,
  AuditLogEntry,
  AuthorizationContext,
  AuthorizationDecision,
  Permission,
} from "./types.ts";

export const AUDIT_GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Deterministically computes the SHA-256 cryptographic hash of an audit log entry.
 */
export function computeAuditEntryHash(params: {
  previousLogHash: string;
  actorId: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string | null;
  cohortId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}): string {
  // Sort keys in payload for canonical deterministic serialization
  const canonicalPayload = JSON.stringify(params.payload, Object.keys(params.payload).sort());
  const preImage = [
    params.previousLogHash,
    params.actorId ?? "null",
    params.actorRole,
    params.action,
    params.targetType,
    params.targetId ?? "null",
    params.cohortId ?? "null",
    canonicalPayload,
    params.createdAt,
  ].join("|");

  return crypto.createHash("sha256").update(preImage).digest("hex");
}

/**
 * Validates the cryptographic integrity of an unbroken audit log chain.
 * Detects tampering, data mutation, deletion, or reordering of records.
 */
export function verifyAuditChain(
  entries: AuditLogEntry[],
  expectedInitialHash = AUDIT_GENESIS_HASH
): {
  valid: boolean;
  brokenAtIndex?: number;
  reason?: string;
  tamperedEntryId?: string;
} {
  if (entries.length === 0) {
    return { valid: true };
  }

  let expectedPreviousHash = expectedInitialHash;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // 1. Verify link to previous entry
    if (entry.previousLogHash !== expectedPreviousHash) {
      return {
        valid: false,
        brokenAtIndex: i,
        tamperedEntryId: entry.id,
        reason: `Broken chain link at index ${i}: expected previousLogHash "${expectedPreviousHash}" but found "${entry.previousLogHash}".`,
      };
    }

    // 2. Verify self-hash integrity
    const recomputedHash = computeAuditEntryHash({
      previousLogHash: entry.previousLogHash,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      cohortId: entry.cohortId,
      payload: entry.payload,
      createdAt: entry.createdAt,
    });

    if (entry.entryHash !== recomputedHash) {
      return {
        valid: false,
        brokenAtIndex: i,
        tamperedEntryId: entry.id,
        reason: `Hash mismatch at index ${i}: payload was modified after signature generation.`,
      };
    }

    expectedPreviousHash = entry.entryHash;
  }

  return { valid: true };
}

export interface AuditStore {
  append(entry: AuditLogEntry): Promise<void> | void;
  getLatest(): Promise<AuditLogEntry | null> | AuditLogEntry | null;
  listByActor(actorId: string, limit?: number): Promise<AuditLogEntry[]> | AuditLogEntry[];
  listByCohort(cohortId: string, limit?: number): Promise<AuditLogEntry[]> | AuditLogEntry[];
  getAll(): Promise<AuditLogEntry[]> | AuditLogEntry[];
}

export class MemoryAuditStore implements AuditStore {
  private logs: AuditLogEntry[] = [];

  append(entry: AuditLogEntry): void {
    this.logs.push({ ...entry });
  }

  getLatest(): AuditLogEntry | null {
    if (this.logs.length === 0) return null;
    return { ...this.logs[this.logs.length - 1] };
  }

  listByActor(actorId: string, limit = 50): AuditLogEntry[] {
    return this.logs
      .filter((l) => l.actorId === actorId)
      .slice(-limit)
      .reverse()
      .map((l) => ({ ...l }));
  }

  listByCohort(cohortId: string, limit = 50): AuditLogEntry[] {
    return this.logs
      .filter((l) => l.cohortId === cohortId)
      .slice(-limit)
      .reverse()
      .map((l) => ({ ...l }));
  }

  getAll(): AuditLogEntry[] {
    return this.logs.map((l) => ({ ...l }));
  }

  clear(): void {
    this.logs = [];
  }
}

export class AuditLogger {
  private store: AuditStore;

  constructor(store?: AuditStore) {
    this.store = store ?? new MemoryAuditStore();
  }

  /**
   * Appends an authoritative tamper-evident audit record with cryptographic hash chaining.
   */
  public async log(params: {
    actorId?: string | null;
    actorRole: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    cohortId?: string | null;
    payload?: Record<string, unknown>;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: string;
  }): Promise<AuditLogEntry> {
    const latest = await this.store.getLatest();
    const previousLogHash = latest ? latest.entryHash : AUDIT_GENESIS_HASH;
    const createdAt = params.createdAt ?? new Date().toISOString();
    const payload = params.payload ?? {};

    const entryHash = computeAuditEntryHash({
      previousLogHash,
      actorId: params.actorId ?? null,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      cohortId: params.cohortId ?? null,
      payload,
      createdAt,
    });

    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      actorId: params.actorId ?? null,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      cohortId: params.cohortId ?? null,
      payload,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      previousLogHash,
      entryHash,
      createdAt,
    };

    await this.store.append(entry);
    return entry;
  }

  /**
   * Logs an authorization decision event (both granted and denied checks).
   */
  public async logAuthorizationDecision(
    actor: Actor | null,
    permission: Permission,
    decision: AuthorizationDecision,
    context: AuthorizationContext = {}
  ): Promise<AuditLogEntry> {
    return this.log({
      actorId: actor?.id ?? null,
      actorRole: actor?.primaryRole ?? "unauthenticated",
      action: decision.granted ? `AUTHZ_GRANTED:${permission}` : `AUTHZ_DENIED:${permission}`,
      targetType: "permission",
      targetId: permission,
      cohortId: context.cohortId ?? decision.cohortId ?? null,
      payload: {
        permission,
        granted: decision.granted,
        code: decision.code,
        reason: decision.reason,
        targetUserId: context.targetUserId,
        studentId: context.studentId,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Verifies the cryptographic integrity of all audit records stored in the ledger.
   */
  public async verifyLedgerIntegrity(): Promise<{
    valid: boolean;
    brokenAtIndex?: number;
    reason?: string;
  }> {
    const all = await this.store.getAll();
    return verifyAuditChain(all);
  }

  public getStore(): AuditStore {
    return this.store;
  }
}
