import { NextResponse } from "next/server";
import { getDb, getRosterQuorumStats } from "@/lib/db";
import { validateServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Production healthcheck, database latency probe, quorum status, and env diagnostics.
 * Suitable for Docker Compose healthchecks, Kubernetes probes, and uptime monitoring.
 */
export async function GET() {
  const startTime = performance.now();

  try {
    const db = getDb();
    const envDiagnostics = validateServerEnv();

    // 1. Database connectivity and latency measurement
    db.prepare("SELECT 1 as ping").get();
    const latencyMs = Number((performance.now() - startTime).toFixed(2));

    // 2. Quick database integrity check
    const integrityRow = db.prepare("PRAGMA quick_check;").get() as { quick_check?: string } | undefined;
    const integrityStatus = integrityRow?.quick_check || "ok";

    // 3. Quorum metrics (§3.3)
    const quorum = getRosterQuorumStats();

    // 4. Next Sunday 23:59:59 IST Boundary Countdown (§9.1, §9.7)
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const istNow = new Date(utcMs + 5.5 * 3600000);
    const day = istNow.getDay();
    const daysUntilSunday = (7 - day) % 7;
    const sundayBoundary = new Date(istNow);
    sundayBoundary.setDate(sundayBoundary.getDate() + daysUntilSunday);
    sundayBoundary.setHours(23, 59, 59, 999);
    const hoursRemaining = Number(((sundayBoundary.getTime() - istNow.getTime()) / 3600000).toFixed(2));

    const isHealthy = integrityStatus === "ok" && latencyMs < 200;

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: "connected",
          latencyMs,
          integrity: integrityStatus,
          journalMode: "wal",
        },
        quorum: {
          totalEnrolled: quorum.totalEnrolled,
          verifiedOptedIn: quorum.verifiedOptedIn,
          quorumPercentage: quorum.quorumPercentage,
          meetsQuorum: quorum.meetsQuorum,
          label: quorum.label,
        },
        boundary: {
          nextSundayIst: sundayBoundary.toISOString().replace("Z", "+05:30"),
          hoursRemaining,
        },
        environment: {
          mode: envDiagnostics.mode,
          valid: envDiagnostics.isValid,
          warningCount: envDiagnostics.warnings.length,
          features: envDiagnostics.features,
        },
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Health-Check": "TWM-3.1",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}
