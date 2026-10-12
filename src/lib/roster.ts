export const NAMES = [
  "劉靖軒",
  "袁君朗",
  "唐佑希",
  "劉德怡",
  "林昊謙",
  "陳浚泓",
  "梁朗僑",
  "吳奕良",
  "潘祉樂",
  "湯鎮年",
  "呂泊賢",
  "倫睿希",
  "黃敬行",
  "薛智航",
] as const;

export const ROLES = [
  { id: "lead", label: "主辯" },
  { id: "first", label: "一副" },
  { id: "second", label: "二副" },
  { id: "close", label: "結辯" },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];
export type Assignment = Record<RoleId, boolean>;
export type RosterState = Record<string, Assignment>;

const STORAGE_KEY = "debate-role-checklist-v1";

export function emptyAssignment(): Assignment {
  return { lead: false, first: false, second: false, close: false };
}

export function defaultRoster(): RosterState {
  return Object.fromEntries(NAMES.map((name) => [name, emptyAssignment()]));
}

function isAssignment(value: unknown): value is Assignment {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return ROLES.every((role) => typeof record[role.id] === "boolean");
}

export function loadRoster(): RosterState {
  const base = defaultRoster();
  if (typeof localStorage === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return base;
    const saved = parsed as Record<string, unknown>;
    for (const name of NAMES) {
      if (isAssignment(saved[name])) base[name] = saved[name];
    }
    return base;
  } catch {
    return base;
  }
}

export function saveRoster(state: RosterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function namesForRole(state: RosterState, role: RoleId): string[] {
  return NAMES.filter((name) => state[name]?.[role]);
}

export function roleLabel(id: RoleId): string {
  return ROLES.find((role) => role.id === id)?.label ?? "";
}

export type Speaker = { name: string; role: RoleId };

export function speakersFromRoster(state: RosterState): Speaker[] {
  const seen = new Set<string>();
  const speakers: Speaker[] = [];
  for (const role of ROLES) {
    for (const name of NAMES) {
      if (!state[name]?.[role.id] || seen.has(name)) continue;
      seen.add(name);
      speakers.push({ name, role: role.id });
    }
  }
  return speakers;
}

export type Stance = "pos" | "neg";

const STANCE_KEY = "debate-stance-v1";

export function loadStance(): Stance | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STANCE_KEY);
  return raw === "pos" || raw === "neg" ? raw : null;
}

export function saveStance(stance: Stance | null) {
  if (!stance) localStorage.removeItem(STANCE_KEY);
  else localStorage.setItem(STANCE_KEY, stance);
}

export function stanceWord(stance: Stance): "正" | "反" {
  return stance === "pos" ? "正" : "反";
}

export function stanceSide(stance: Stance): "正方" | "反方" {
  return stance === "pos" ? "正方" : "反方";
}

export function oppositeSide(stance: Stance): "正方" | "反方" {
  return stance === "pos" ? "反方" : "正方";
}
