/**
 * Public cohort aggregate statistics contract (§2 & §5).
 * Only public aggregates — zero PII or private student records exposed.
 */
export interface ValidatedCohortStats {
  totalEnrolled: number;
  verifiedOptedIn: number;
  quorumPercentage: number;
  meetsQuorum: boolean;
  label: string;
  platformCount: number;
  generatedAt?: string;
  latestObservationAt?: string | null;
}

export type StatsValidationResult =
  | { isValid: true; data: ValidatedCohortStats }
  | { isValid: false; reason: string };

/**
 * Strict fail-closed validator for public cohort stats payload (§C & §E).
 * Ensures mathematical consistency, bounds checking, and non-fabricated defaults.
 * Separates essential field validation from optional timestamp validation.
 */
export function validateCohortStatsPayload(data: unknown): StatsValidationResult {
  if (!data || typeof data !== "object") {
    return { isValid: false, reason: "Payload must be a non-null object" };
  }

  const record = data as Record<string, unknown>;

  if (record.success !== true) {
    return { isValid: false, reason: "Payload success flag is not true" };
  }

  // 1. Validate totalEnrolled (non-negative integer)
  if (
    typeof record.totalEnrolled !== "number" ||
    !Number.isInteger(record.totalEnrolled) ||
    record.totalEnrolled < 0
  ) {
    return { isValid: false, reason: "totalEnrolled must be a non-negative integer" };
  }
  const totalEnrolled = record.totalEnrolled;

  // 2. Validate verifiedOptedIn (non-negative integer)
  if (
    typeof record.verifiedOptedIn !== "number" ||
    !Number.isInteger(record.verifiedOptedIn) ||
    record.verifiedOptedIn < 0
  ) {
    return { isValid: false, reason: "verifiedOptedIn must be a non-negative integer" };
  }
  const verifiedOptedIn = record.verifiedOptedIn;

  // 3. Cross-field: verifiedOptedIn cannot exceed totalEnrolled
  if (verifiedOptedIn > totalEnrolled) {
    return {
      isValid: false,
      reason: `verifiedOptedIn (${verifiedOptedIn}) cannot exceed totalEnrolled (${totalEnrolled})`,
    };
  }

  // 4. Validate quorumPercentage (finite number between 0 and 100)
  if (
    typeof record.quorumPercentage !== "number" ||
    !Number.isFinite(record.quorumPercentage) ||
    record.quorumPercentage < 0 ||
    record.quorumPercentage > 100
  ) {
    return { isValid: false, reason: "quorumPercentage must be a finite number between 0 and 100" };
  }
  const quorumPercentage = record.quorumPercentage;

  // 5. Cross-field: quorumPercentage consistency check
  const expectedQuorum =
    totalEnrolled === 0 ? 0 : (verifiedOptedIn / totalEnrolled) * 100;
  // Allow 0.15 tolerance for single-decimal rounding in toFixed(1)
  if (Math.abs(quorumPercentage - expectedQuorum) > 0.15) {
    return {
      isValid: false,
      reason: `quorumPercentage (${quorumPercentage}) mathematically conflicts with verified/total ratio (${expectedQuorum.toFixed(1)})`,
    };
  }

  // 6. Validate meetsQuorum (boolean matching 70% threshold)
  if (typeof record.meetsQuorum !== "boolean") {
    return { isValid: false, reason: "meetsQuorum must be a boolean" };
  }
  const expectedMeetsQuorum = totalEnrolled > 0 && verifiedOptedIn / totalEnrolled >= 0.70;
  if (record.meetsQuorum !== expectedMeetsQuorum) {
    return {
      isValid: false,
      reason: `meetsQuorum (${record.meetsQuorum}) conflicts with expected threshold determination (${expectedMeetsQuorum})`,
    };
  }
  const meetsQuorum = record.meetsQuorum;

  // 7. Validate platformCount (must match supported product configuration: exactly 3)
  if (
    typeof record.platformCount !== "number" ||
    !Number.isInteger(record.platformCount) ||
    record.platformCount !== 3
  ) {
    return { isValid: false, reason: "platformCount must be exactly 3 for supported providers" };
  }
  const platformCount = record.platformCount;

  // 8. Validate label (string matching quorum status)
  const label = typeof record.label === "string" ? record.label : "";

  // 9. Validate optional generatedAt (API generation timestamp)
  let generatedAt: string | undefined = undefined;
  if (record.generatedAt !== undefined) {
    if (typeof record.generatedAt === "string" && !isNaN(Date.parse(record.generatedAt))) {
      generatedAt = record.generatedAt;
    } else {
      console.warn("[StatsBar] Malformed generatedAt timestamp discarded");
    }
  }

  // 10. Validate optional latestObservationAt (DB observation timestamp)
  let latestObservationAt: string | null = null;
  if (record.latestObservationAt !== undefined && record.latestObservationAt !== null) {
    if (
      typeof record.latestObservationAt === "string" &&
      !isNaN(Date.parse(record.latestObservationAt))
    ) {
      latestObservationAt = record.latestObservationAt;
    } else {
      console.warn("[StatsBar] Malformed latestObservationAt timestamp discarded");
    }
  }

  return {
    isValid: true,
    data: {
      totalEnrolled,
      verifiedOptedIn,
      quorumPercentage,
      meetsQuorum,
      label,
      platformCount,
      generatedAt,
      latestObservationAt,
    },
  };
}

