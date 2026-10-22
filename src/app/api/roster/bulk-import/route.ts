import { NextRequest, NextResponse } from "next/server";
import { getDb, getRosterQuorumStats, type RosterMemberRow } from "@/lib/db";
import { isInstitutionalCollegeEmail } from "@/lib/auth";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export interface StudentImportRow {
  rollNo: string;
  name: string;
  email: string;
  classSection?: string;
  handleGithub?: string;
  handleLeetcode?: string;
  handleHackerrank?: string;
}

/**
 * Parses raw CSV text into array of student objects.
 */
function parseCsvRows(csvText: string): StudentImportRow[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length <= 1) return [];

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: StudentImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 3) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (idx < cols.length) {
        rowObj[h] = cols[idx];
      }
    });

    const rollNo = rowObj["roll_no"] || rowObj["rollno"] || rowObj["roll"] || cols[0];
    const name = rowObj["name"] || rowObj["full_name"] || rowObj["student_name"] || cols[1];
    const email = rowObj["email"] || rowObj["college_email"] || cols[2];
    const classSection = rowObj["class_section"] || rowObj["section"] || cols[3] || "CSE-A";
    const handleGithub = rowObj["handle_github"] || rowObj["github"] || cols[4] || "";
    const handleLeetcode = rowObj["handle_leetcode"] || rowObj["leetcode"] || cols[5] || "";
    const handleHackerrank = rowObj["handle_hackerrank"] || rowObj["hackerrank"] || cols[6] || "";

    if (rollNo && name && email) {
      rows.push({
        rollNo,
        name,
        email,
        classSection,
        handleGithub: handleGithub || undefined,
        handleLeetcode: handleLeetcode || undefined,
        handleHackerrank: handleHackerrank || undefined,
      });
    }
  }

  return rows;
}

/**
 * POST /api/roster/bulk-import
 * Batch imports class roster from CSV or JSON array inside an atomic SQLite transaction (§3.2, §3.3)
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let studentRows: StudentImportRow[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (Array.isArray(body)) {
        studentRows = body;
      } else if (body.students && Array.isArray(body.students)) {
        studentRows = body.students;
      } else if (typeof body.csv === "string") {
        studentRows = parseCsvRows(body.csv);
      } else if (typeof body.csvContent === "string") {
        studentRows = parseCsvRows(body.csvContent);
      }
    } else {
      const rawText = await request.text();
      studentRows = parseCsvRows(rawText);
    }

    if (studentRows.length === 0) {
      return NextResponse.json(
        {
          error: "EMPTY_ROSTER_PAYLOAD",
          message: "No valid student rows found in payload. Format: roll_no, name, email, class_section, [github], [leetcode], [hackerrank]",
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const existingMembers = db.prepare("SELECT roll_no, email FROM roster_members").all() as Array<{ roll_no: string; email: string }>;
    const existingRolls = new Set(existingMembers.map((m) => m.roll_no.toUpperCase()));
    const existingEmails = new Set(existingMembers.map((m) => m.email.toLowerCase()));

    const imported: StudentImportRow[] = [];
    const skipped: Array<{ rollNo: string; name: string; reason: string }> = [];

    const insertStmt = db.prepare(`
      INSERT INTO roster_members (
        id, roll_no, name, email, class_section, handle_github, handle_leetcode, handle_hackerrank, is_active, is_current_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `);

    // Execute batch inside atomic SQLite transaction
    db.exec("BEGIN TRANSACTION;");
    try {
      for (const row of studentRows) {
        const cleanRoll = row.rollNo.trim().toUpperCase();
        const cleanEmail = row.email.trim().toLowerCase();
        const cleanName = row.name.trim();

        // 1. Uniqueness check
        if (existingRolls.has(cleanRoll)) {
          skipped.push({ rollNo: cleanRoll, name: cleanName, reason: "Duplicate roll number" });
          continue;
        }

        if (existingEmails.has(cleanEmail)) {
          skipped.push({ rollNo: cleanRoll, name: cleanName, reason: "Duplicate email address" });
          continue;
        }

        // 2. Email format validation
        if (!cleanEmail.includes("@")) {
          skipped.push({ rollNo: cleanRoll, name: cleanName, reason: "Malformed email format" });
          continue;
        }

        const id = `std-${cleanRoll.toLowerCase().replace(/[^a-z0-9]/g, "")}-${crypto.randomBytes(3).toString("hex")}`;
        const section = row.classSection?.trim() || "CSE-A";
        const github = row.handleGithub?.trim().replace(/^@/, "") || null;
        const leetcode = row.handleLeetcode?.trim().replace(/^@/, "") || null;
        const hackerrank = row.handleHackerrank?.trim().replace(/^@/, "") || null;

        insertStmt.run(id, cleanRoll, cleanName, cleanEmail, section, github, leetcode, hackerrank);

        existingRolls.add(cleanRoll);
        existingEmails.add(cleanEmail);
        imported.push(row);
      }

      db.exec("COMMIT;");
    } catch (err) {
      db.exec("ROLLBACK;");
      throw err;
    }

    const updatedQuorum = getRosterQuorumStats();

    return NextResponse.json({
      success: true,
      summary: {
        totalReceived: studentRows.length,
        importedCount: imported.length,
        skippedCount: skipped.length,
      },
      imported,
      skipped,
      updatedQuorum,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
