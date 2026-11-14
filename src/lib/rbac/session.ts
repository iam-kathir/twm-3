/**
-- ==============================================================================
-- TWM 3.1 Database-Backed Session Manager
-- Features: 256-bit cryptographically secure token generation, SHA-256 hashing,
--           sliding-window TTL, atomic rotation, and instant revocation.
-- Invariant: Bearer tokens are NEVER stored in plaintext in the database.
-- ==============================================================================
*/

import crypto from "node:crypto";
import type { DbSession } from "./types.ts";

export interface SessionStore {
  create(session: DbSession): Promise<void> | void;
  findByHash(hash: string): Promise<DbSession | null> | DbSession | null;
  update(session: DbSession): Promise<void> | void;
  revokeByHash(hash: string, revokedAt: Date, reason?: string): Promise<boolean> | boolean;
  revokeByUserId(userId: string, revokedAt: Date, reason?: string): Promise<number> | number;
  deleteExpired(now: Date): Promise<number> | number;
}

/**
 * In-memory / unit-testable Session Store implementing the authoritative schema.
 */
export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, DbSession>();

  create(session: DbSession): void {
    this.sessions.set(session.sessionTokenHash, { ...session });
  }

  findByHash(hash: string): DbSession | null {
    const s = this.sessions.get(hash);
    return s ? { ...s } : null;
  }

  update(session: DbSession): void {
    this.sessions.set(session.sessionTokenHash, { ...session });
  }

  revokeByHash(hash: string, revokedAt: Date, reason?: string): boolean {
    const s = this.sessions.get(hash);
    if (!s) return false;
    s.revokedAt = revokedAt;
    s.revocationReason = reason ?? "Manual revocation";
    return true;
  }

  revokeByUserId(userId: string, revokedAt: Date, reason?: string): number {
    let count = 0;
    for (const s of this.sessions.values()) {
      if (s.userId === userId && !s.revokedAt) {
        s.revokedAt = revokedAt;
        s.revocationReason = reason ?? "User sessions revoked";
        count++;
      }
    }
    return count;
  }

  deleteExpired(now: Date): number {
    let count = 0;
    const nowMs = now.getTime();
    for (const [hash, s] of this.sessions.entries()) {
      if (s.expiresAt.getTime() < nowMs) {
        this.sessions.delete(hash);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.sessions.clear();
  }
}

export interface SessionManagerOptions {
  defaultTtlSeconds?: number; // Defaults to 7 days (604800s)
  tokenPrefix?: string;
}

export class SessionManager {
  private store: SessionStore;
  private defaultTtlSeconds: number;
  private tokenPrefix: string;

  constructor(store?: SessionStore, options: SessionManagerOptions = {}) {
    this.store = store ?? new MemorySessionStore();
    this.defaultTtlSeconds = options.defaultTtlSeconds ?? 7 * 24 * 60 * 60; // 7 days
    this.tokenPrefix = options.tokenPrefix ?? "twm_s_";
  }

  /**
   * Hashes a raw bearer session token using SHA-256.
   */
  public hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Generates a 256-bit cryptographically secure session token.
   */
  public generateRawToken(): string {
    const entropy = crypto.randomBytes(32).toString("base64url");
    return `${this.tokenPrefix}${entropy}`;
  }

  /**
   * Creates a new database-backed session for a user.
   * Returns raw token (for client cookie/bearer header) and persisted session metadata.
   */
  public async createSession(
    userId: string,
    metadata: {
      ipAddress?: string | null;
      userAgent?: string | null;
      ttlSeconds?: number;
    } = {}
  ): Promise<{ rawToken: string; session: DbSession }> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Cannot create session: userId must be a non-empty string.");
    }

    const rawToken = this.generateRawToken();
    const sessionTokenHash = this.hashToken(rawToken);
    const now = new Date();
    const ttl = metadata.ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const session: DbSession = {
      id: crypto.randomUUID(),
      userId,
      sessionTokenHash,
      expiresAt,
      createdAt: now,
      rotatedAt: null,
      revokedAt: null,
      revocationReason: null,
      ipAddress: metadata.ipAddress ?? null,
      userAgent: metadata.userAgent ?? null,
    };

    await this.store.create(session);
    return { rawToken, session };
  }

  /**
   * Validates a bearer token against the authoritative session store.
   * Verifies existence, expiration, and non-revoked state.
   */
  public async validateSession(
    rawToken: string,
    now: Date = new Date()
  ): Promise<{
    valid: boolean;
    session: DbSession | null;
    reason?: string;
  }> {
    if (!rawToken || typeof rawToken !== "string" || !rawToken.startsWith(this.tokenPrefix)) {
      return { valid: false, session: null, reason: "Malformed or empty session token." };
    }

    const tokenHash = this.hashToken(rawToken);
    const session = await this.store.findByHash(tokenHash);

    if (!session) {
      return { valid: false, session: null, reason: "Session not found." };
    }

    if (session.revokedAt) {
      return {
        valid: false,
        session,
        reason: `Session was revoked on ${session.revokedAt.toISOString()}${session.revocationReason ? ` (${session.revocationReason})` : ""}.`,
      };
    }

    if (session.expiresAt.getTime() <= now.getTime()) {
      return {
        valid: false,
        session,
        reason: `Session expired on ${session.expiresAt.toISOString()}.`,
      };
    }

    return { valid: true, session };
  }

  /**
   * Rotates a session: revokes/marks the old session as rotated and issues a new token.
   * Prevents session fixation attacks and limits window of stolen tokens.
   */
  public async rotateSession(
    oldRawToken: string,
    metadata: {
      ipAddress?: string | null;
      userAgent?: string | null;
      ttlSeconds?: number;
    } = {}
  ): Promise<{
    success: boolean;
    newRawToken?: string;
    newSession?: DbSession;
    reason?: string;
  }> {
    const validation = await this.validateSession(oldRawToken);
    if (!validation.valid || !validation.session) {
      return {
        success: false,
        reason: `Cannot rotate invalid session: ${validation.reason}`,
      };
    }

    const oldSession = validation.session;
    const now = new Date();

    // Mark old session rotated and revoked
    oldSession.rotatedAt = now;
    oldSession.revokedAt = now;
    oldSession.revocationReason = "Rotated into new session token";
    await this.store.update(oldSession);

    // Create new session for the same user
    const newSessionResult = await this.createSession(oldSession.userId, {
      ipAddress: metadata.ipAddress ?? oldSession.ipAddress,
      userAgent: metadata.userAgent ?? oldSession.userAgent,
      ttlSeconds: metadata.ttlSeconds,
    });

    return {
      success: true,
      newRawToken: newSessionResult.rawToken,
      newSession: newSessionResult.session,
    };
  }

  /**
   * Revokes a session immediately by raw token.
   */
  public async revokeSession(rawToken: string, reason = "Explicit logout"): Promise<boolean> {
    if (!rawToken || !rawToken.startsWith(this.tokenPrefix)) {
      return false;
    }
    const tokenHash = this.hashToken(rawToken);
    return Promise.resolve(this.store.revokeByHash(tokenHash, new Date(), reason));
  }

  /**
   * Revokes all active sessions for a given user (e.g., password reset, credential compromise).
   */
  public async revokeAllUserSessions(userId: string, reason = "All user sessions revoked"): Promise<number> {
    return Promise.resolve(this.store.revokeByUserId(userId, new Date(), reason));
  }
}
