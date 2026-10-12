//#region node_modules/.nitro/vite/services/ssr/assets/roster-meN1cT_y.js
var NAMES = [
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
	"薛智航"
];
var ROLES = [
	{
		id: "lead",
		label: "主辯"
	},
	{
		id: "first",
		label: "一副"
	},
	{
		id: "second",
		label: "二副"
	},
	{
		id: "close",
		label: "結辯"
	}
];
var STORAGE_KEY = "debate-role-checklist-v1";
function emptyAssignment() {
	return {
		lead: false,
		first: false,
		second: false,
		close: false
	};
}
function defaultRoster() {
	return Object.fromEntries(NAMES.map((name) => [name, emptyAssignment()]));
}
function isAssignment(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return ROLES.every((role) => typeof record[role.id] === "boolean");
}
function loadRoster() {
	const base = defaultRoster();
	if (typeof localStorage === "undefined") return base;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return base;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return base;
		const saved = parsed;
		for (const name of NAMES) if (isAssignment(saved[name])) base[name] = saved[name];
		return base;
	} catch {
		return base;
	}
}
function saveRoster(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function namesForRole(state, role) {
	return NAMES.filter((name) => state[name]?.[role]);
}
function roleLabel(id) {
	return ROLES.find((role) => role.id === id)?.label ?? "";
}
function speakersFromRoster(state) {
	const seen = /* @__PURE__ */ new Set();
	const speakers = [];
	for (const role of ROLES) for (const name of NAMES) {
		if (!state[name]?.[role.id] || seen.has(name)) continue;
		seen.add(name);
		speakers.push({
			name,
			role: role.id
		});
	}
	return speakers;
}
var STANCE_KEY = "debate-stance-v1";
function loadStance() {
	if (typeof localStorage === "undefined") return null;
	const raw = localStorage.getItem(STANCE_KEY);
	return raw === "pos" || raw === "neg" ? raw : null;
}
function saveStance(stance) {
	if (!stance) localStorage.removeItem(STANCE_KEY);
	else localStorage.setItem(STANCE_KEY, stance);
}
function stanceWord(stance) {
	return stance === "pos" ? "正" : "反";
}
function stanceSide(stance) {
	return stance === "pos" ? "正方" : "反方";
}
function oppositeSide(stance) {
	return stance === "pos" ? "反方" : "正方";
}
//#endregion
export { loadStance as a, roleLabel as c, speakersFromRoster as d, stanceSide as f, loadRoster as i, saveRoster as l, ROLES as n, namesForRole as o, stanceWord as p, defaultRoster as r, oppositeSide as s, NAMES as t, saveStance as u };
