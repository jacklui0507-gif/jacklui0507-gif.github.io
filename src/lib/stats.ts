import { NAMES, ROLES, type RoleId } from "@/lib/roster";
import type { MatchRecord } from "@/lib/matches";

export type Outcome = "win" | "loss" | "unknown";

export function matchOutcome(result: string): Outcome {
  if (/lose|loss|負/i.test(result)) return "loss";
  if (/win|勝/i.test(result) || /\bW\b/.test(result)) return "win";
  return "unknown";
}

export type DebaterStats = {
  name: string;
  appearances: number;
  wins: number;
  losses: number;
  unknown: number;
  best: number;
  roles: Record<RoleId, number>;
};

function emptyRoles(): Record<RoleId, number> {
  return { lead: 0, first: 0, second: 0, close: 0 };
}

export function debaterStats(matches: MatchRecord[]): DebaterStats[] {
  const table = new Map<string, DebaterStats>();
  for (const name of NAMES) {
    table.set(name, { name, appearances: 0, wins: 0, losses: 0, unknown: 0, best: 0, roles: emptyRoles() });
  }

  for (const match of matches) {
    const outcome = matchOutcome(match.result);
    const seen = new Set<string>();
    for (const speaker of match.speakers) {
      if (seen.has(speaker.name)) continue;
      seen.add(speaker.name);
      const row = table.get(speaker.name) ?? {
        name: speaker.name,
        appearances: 0,
        wins: 0,
        losses: 0,
        unknown: 0,
        best: 0,
        roles: emptyRoles(),
      };
      row.appearances += 1;
      if (outcome === "win") row.wins += 1;
      else if (outcome === "loss") row.losses += 1;
      else row.unknown += 1;
      if (speaker.role in row.roles) row.roles[speaker.role] += 1;
      table.set(speaker.name, row);
    }
    for (const name of match.awards.best) {
      const row = table.get(name);
      if (row) row.best += 1;
    }
  }

  const rank = new Map<string, number>(NAMES.map((name, index) => [name, index]));
  return [...table.values()].sort(
    (a, b) => b.appearances - a.appearances || (rank.get(a.name) ?? 99) - (rank.get(b.name) ?? 99),
  );
}

export function percent(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

export function teamRecord(matches: MatchRecord[]) {
  let wins = 0;
  let losses = 0;
  let unknown = 0;
  for (const match of matches) {
    const outcome = matchOutcome(match.result);
    if (outcome === "win") wins += 1;
    else if (outcome === "loss") losses += 1;
    else unknown += 1;
  }
  return { wins, losses, unknown, total: matches.length };
}

export { ROLES };
