import {
  oppositeSide,
  roleLabel,
  stanceSide,
  stanceWord,
  type Speaker,
  type Stance,
} from "@/lib/roster";

export const AWARDS = [
  { id: "best", label: "最佳辯論員" },
  { id: "cross", label: "最佳交互辯論員" },
  { id: "free", label: "最佳自由辯論員" },
  { id: "seedling", label: "最佳青苗辯論員" },
] as const;

export type AwardId = (typeof AWARDS)[number]["id"];

export type AwardPicks = Record<AwardId, string[]>;
export type OpponentAwards = Record<AwardId, string>;

export type MatchLink = {
  id: string;
  kind: "youtube" | "doc";
  url: string;
};

export type MatchFile = {
  id: string;
  kind: "audio" | "video";
  name: string;
};

export type MatchRecord = {
  id: string;
  tournament: string;
  round: string;
  dateText: string;
  time: string;
  venue: string;
  motion: string;
  stance: Stance;
  opponent: string;
  result: string;
  speakers: Speaker[];
  awards: AwardPicks;
  opponentAwards: OpponentAwards;
  links: MatchLink[];
  files: MatchFile[];
};

const MATCHES_KEY = "debate-matches-v1";

export function emptyAwards(): AwardPicks {
  return { best: [], cross: [], free: [], seedling: [] };
}

export function emptyOpponentAwards(): OpponentAwards {
  return { best: "", cross: "", free: "", seedling: "" };
}

export function formatChineseDate(input: string, now = new Date()): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const iso = trimmed.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (iso) {
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${iso[1]}年${String(month).padStart(2, "0")}月${String(day).padStart(2, "0")}日`;
    }
  }

  const dmy = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?$/);
  if (!dmy) return trimmed;
  const day = Number(dmy[1]);
  const month = Number(dmy[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return trimmed;
  let year = dmy[3] ? Number(dmy[3]) : now.getFullYear();
  if (year < 100) year += 2000;
  return `${year}年${String(month).padStart(2, "0")}月${String(day).padStart(2, "0")}日`;
}

export function formatMatch(match: {
  tournament: string;
  round: string;
  dateText: string;
  time: string;
  venue: string;
  motion: string;
  stance: Stance;
  opponent: string;
  result: string;
  speakers: Speaker[];
  awards: AwardPicks;
  opponentAwards: OpponentAwards;
  links?: MatchLink[];
  files?: MatchFile[];
}): string {
  const title = `${match.tournament.trim()}${match.round.trim()}`;
  const lines = title ? [title] : [];
  if (match.dateText.trim()) lines.push(`日期：${match.dateText.trim()}`);
  if (match.time.trim()) lines.push(`時間：${match.time.trim()}`);
  if (match.venue.trim()) lines.push(`地點：${match.venue.trim()}`);
  lines.push(`台上辯員：${match.speakers.map((speaker) => speaker.name).join(" ")}`);
  lines.push(`辯題：${match.motion.trim()}（${stanceWord(match.stance)}）`);
  lines.push(`對賽學校：${match.opponent.trim()}`);
  lines.push(`賽果：${match.result.trim()}`);

  const side = stanceSide(match.stance);
  const other = oppositeSide(match.stance);
  for (const award of AWARDS) {
    const parts = match.speakers
      .filter((speaker) => match.awards[award.id].includes(speaker.name))
      .map((speaker) => `${side} ${roleLabel(speaker.role)} ${speaker.name}`.replace(/\s+/g, " ").trim());
    const opp = match.opponentAwards[award.id].trim();
    if (opp) parts.push(`${other} ${opp}`);
    if (parts.length) lines.push(`${award.label}：${parts.join(" 及 ")}`);
  }

  for (const link of match.links ?? []) {
    if (!link.url.trim()) continue;
    lines.push(`${link.kind === "youtube" ? "YouTube" : "Google 文件"}：${link.url.trim()}`);
  }
  for (const file of match.files ?? []) {
    lines.push(`${file.kind === "audio" ? "錄音" : "影片"}：${file.name}`);
  }

  return lines.join("\n");
}

export function loadMatches(): MatchRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const match = normalizeMatch(item);
      return match ? [match] : [];
    });
  } catch {
    return [];
  }
}

export function saveMatches(matches: MatchRecord[]) {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isMatch(value: unknown): value is MatchRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<MatchRecord>;
  if (typeof record.id !== "string") return false;
  if (record.stance !== "pos" && record.stance !== "neg") return false;
  if (!Array.isArray(record.speakers)) return false;
  if (!record.awards || !record.opponentAwards) return false;
  return AWARDS.every(
    (award) => isStringArray(record.awards?.[award.id]) && typeof record.opponentAwards?.[award.id] === "string",
  );
}

function isLink(value: unknown): value is MatchLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Partial<MatchLink>;
  return (
    typeof link.id === "string" &&
    (link.kind === "youtube" || link.kind === "doc") &&
    typeof link.url === "string"
  );
}

function isFile(value: unknown): value is MatchFile {
  if (!value || typeof value !== "object") return false;
  const file = value as Partial<MatchFile>;
  return typeof file.id === "string" && (file.kind === "audio" || file.kind === "video") && typeof file.name === "string";
}

function normalizeMatch(value: unknown): MatchRecord | null {
  if (!isMatch(value)) return null;
  const record = value as MatchRecord;
  return {
    ...record,
    time: typeof record.time === "string" ? record.time : "",
    venue: typeof record.venue === "string" ? record.venue : "",
    links: Array.isArray(record.links) ? record.links.filter(isLink) : [],
    files: Array.isArray(record.files) ? record.files.filter(isFile) : [],
  };
}

export function youtubeId(value: string): string | null {
  const safe = safeHttpUrl(value);
  if (!safe) return null;
  try {
    const url = new URL(safe);
    const host = url.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    else if (
      host === "youtube.com" ||
      host === "youtube-nocookie.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (url.pathname === "/watch" || url.pathname === "/watch/") id = url.searchParams.get("v") ?? "";
      else if (url.pathname.startsWith("/v/")) id = url.pathname.split("/").filter(Boolean)[1] ?? "";
      else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") id = parts[1] ?? "";
      }
    }
    return /^[\w-]{6,}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function safeHttpUrl(value: string): string | null {
  let raw = value.trim();
  if (!raw) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    raw = `https://${raw.replace(/^\/+/, "")}`;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function groupByTournament(matches: MatchRecord[]): { name: string; matches: MatchRecord[] }[] {
  const order: string[] = [];
  const groups = new Map<string, MatchRecord[]>();
  for (const match of matches) {
    const name = match.tournament.trim() || "未分類";
    const list = groups.get(name);
    if (list) list.push(match);
    else {
      groups.set(name, [match]);
      order.push(name);
    }
  }
  return order.map((name) => ({ name, matches: groups.get(name) ?? [] }));
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}
