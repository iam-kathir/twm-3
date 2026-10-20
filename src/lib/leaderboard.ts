/**
 * Section 9.6 Tie Policy and Competition Ranking Utility
 *
 * Ground Rules from TWM Final Project Plan v3.1 (§9.6):
 * 1. Equal metric values share the same rank.
 * 2. Standard competition ranking (1, 2, 2, 4 scheme).
 * 3. Never use signup time, username, or hidden data as an undisclosed tie-breaker.
 * 4. Secondary display sort sorts alphabetically by name/handle without changing shared rank.
 * 5. Deterministic and transparent in UI.
 */

export interface RankedParticipant {
  id: string;
  name: string;
  handle: string;
  numericVal: number;
  value: string;
  coverage: string;
  coveragePass: boolean;
  freshness: string;
  status: "Finalized" | "Provisional";
  isCurrentUser?: boolean;
  avatarUrl?: string;
  rank: number;
  isTied: boolean;
  tier?: "top3" | "standard";
}

export interface RawParticipant {
  id: string;
  name: string;
  handle: string;
  numericVal: number;
  value: string;
  coverage: string;
  coveragePass: boolean;
  freshness: string;
  status: "Finalized" | "Provisional";
  isCurrentUser?: boolean;
  avatarUrl?: string;
}

/**
 * Computes Section 9.6 Competition Ranks:
 * Sorts descending by numeric value. If values are equal, sorts alphabetically by name
 * for consistent display order while preserving identical rank numbers (e.g. 1, 2, 2, 4).
 */
export function computeCompetitionRanks(participants: RawParticipant[]): RankedParticipant[] {
  if (!participants || participants.length === 0) return [];

  // Sort descending by numericVal; tie-break display order alphabetically by name
  const sorted = [...participants].sort((a, b) => {
    if (b.numericVal !== a.numericVal) {
      return b.numericVal - a.numericVal;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  const ranked: RankedParticipant[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];

    let rank = 1;
    if (i > 0) {
      const prev = sorted[i - 1];
      if (item.numericVal === prev.numericVal) {
        // Equal metric values share the exact same rank as the previous participant
        rank = ranked[i - 1].rank;
      } else {
        // 1, 2, 2, 4 scheme: rank is 1-based index (i + 1)
        rank = i + 1;
      }
    }

    ranked.push({
      ...item,
      rank,
      isTied: false, // will flag in post-pass
      tier: rank <= 3 ? "top3" : "standard"
    });
  }

  // Detect ties across the list so UI can render the tie indicator (§9.6)
  const rankCounts = new Map<number, number>();
  for (const r of ranked) {
    rankCounts.set(r.rank, (rankCounts.get(r.rank) || 0) + 1);
  }

  for (const r of ranked) {
    if ((rankCounts.get(r.rank) || 0) > 1) {
      r.isTied = true;
    }
  }

  return ranked;
}
