import { i as __toESM } from "../_runtime.mjs";
import { a as loadStance, c as roleLabel, d as speakersFromRoster, f as stanceSide, i as loadRoster, p as stanceWord, s as oppositeSide } from "./roster-meN1cT_y.mjs";
import { C as require_jsx_runtime, Y as require_react, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Check, r as Copy } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matches-LoifleaE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AWARDS = [
	{
		id: "best",
		label: "最佳辯論員"
	},
	{
		id: "cross",
		label: "最佳交互辯論員"
	},
	{
		id: "free",
		label: "最佳自由辯論員"
	},
	{
		id: "seedling",
		label: "最佳青苗辯論員"
	}
];
var MATCHES_KEY = "debate-matches-v1";
function emptyAwards() {
	return {
		best: [],
		cross: [],
		free: [],
		seedling: []
	};
}
function emptyOpponentAwards() {
	return {
		best: "",
		cross: "",
		free: "",
		seedling: ""
	};
}
function formatChineseDate(input, now = /* @__PURE__ */ new Date()) {
	const trimmed = input.trim();
	if (!trimmed) return "";
	const iso = trimmed.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
	if (iso) {
		const month = Number(iso[2]);
		const day = Number(iso[3]);
		if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return `${iso[1]}年${String(month).padStart(2, "0")}月${String(day).padStart(2, "0")}日`;
	}
	const dmy = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?$/);
	if (!dmy) return trimmed;
	const day = Number(dmy[1]);
	const month = Number(dmy[2]);
	if (month < 1 || month > 12 || day < 1 || day > 31) return trimmed;
	let year = dmy[3] ? Number(dmy[3]) : now.getFullYear();
	if (year < 100) year += 2e3;
	return `${year}年${String(month).padStart(2, "0")}月${String(day).padStart(2, "0")}日`;
}
function formatMatch(match) {
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
		const parts = match.speakers.filter((speaker) => match.awards[award.id].includes(speaker.name)).map((speaker) => `${side} ${roleLabel(speaker.role)} ${speaker.name}`.replace(/\s+/g, " ").trim());
		const opp = match.opponentAwards[award.id].trim();
		if (opp) parts.push(`${other} ${opp}`);
		if (parts.length) lines.push(`${award.label}：${parts.join(" 及 ")}`);
	}
	return lines.join("\n");
}
function loadMatches() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(MATCHES_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isMatch);
	} catch {
		return [];
	}
}
function saveMatches(matches) {
	localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}
function isStringArray(value) {
	return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function isMatch(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	if (typeof record.id !== "string") return false;
	if (record.stance !== "pos" && record.stance !== "neg") return false;
	if (!Array.isArray(record.speakers)) return false;
	if (!record.awards || !record.opponentAwards) return false;
	return AWARDS.every((award) => isStringArray(record.awards?.[award.id]) && typeof record.opponentAwards?.[award.id] === "string");
}
async function copyText(text) {
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
var fieldClass = "h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-seal";
function MatchLog() {
	const href = useRouterState({ select: (state) => state.location.href });
	const [speakers, setSpeakers] = (0, import_react.useState)([]);
	const [squadStance, setSquadStance] = (0, import_react.useState)(null);
	const [matches, setMatches] = (0, import_react.useState)([]);
	const [tournament, setTournament] = (0, import_react.useState)("");
	const [round, setRound] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("");
	const [venue, setVenue] = (0, import_react.useState)("");
	const [motion, setMotion] = (0, import_react.useState)("");
	const [opponent, setOpponent] = (0, import_react.useState)("");
	const [result, setResult] = (0, import_react.useState)("");
	const [stance, setStance] = (0, import_react.useState)("pos");
	const [awards, setAwards] = (0, import_react.useState)(emptyAwards);
	const [opponentAwards, setOpponentAwards] = (0, import_react.useState)(emptyOpponentAwards);
	const [hint, setHint] = (0, import_react.useState)("");
	const [copiedId, setCopiedId] = (0, import_react.useState)(null);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const roster = loadRoster();
		const savedStance = loadStance();
		setSpeakers(speakersFromRoster(roster));
		setSquadStance(savedStance);
		setStance(savedStance ?? "pos");
		setMatches(loadMatches());
	}, [href]);
	(0, import_react.useEffect)(() => {
		if (!copiedId) return;
		const timer = window.setTimeout(() => setCopiedId(null), 1600);
		return () => window.clearTimeout(timer);
	}, [copiedId]);
	const preview = (0, import_react.useMemo)(() => formatMatch({
		tournament,
		round,
		dateText: formatChineseDate(date),
		time,
		venue,
		motion,
		stance,
		opponent,
		result,
		speakers,
		awards,
		opponentAwards
	}), [
		tournament,
		round,
		date,
		time,
		venue,
		motion,
		stance,
		opponent,
		result,
		speakers,
		awards,
		opponentAwards
	]);
	function toggleAward(name, award) {
		setAwards((current) => {
			const picked = current[award];
			const next = picked.includes(name) ? picked.filter((item) => item !== name) : [...picked, name];
			return {
				...current,
				[award]: next
			};
		});
	}
	async function copy(id, text) {
		await copyText(text);
		setCopiedId(id);
	}
	function store(next) {
		setMatches(next);
		saveMatches(next);
	}
	function saveMatch() {
		if (speakers.length === 0) {
			setHint("請先在首頁勾選台上辯員，再按儲存陣容");
			return;
		}
		if (!tournament.trim() || !round.trim() || !date.trim() || !motion.trim() || !opponent.trim() || !result.trim()) {
			setHint("請填杯賽、輪次、日期、辯題、對賽學校和賽果");
			return;
		}
		store([{
			id: `${Date.now()}`,
			tournament: tournament.trim(),
			round: round.trim(),
			dateText: formatChineseDate(date),
			time: time.trim(),
			venue: venue.trim(),
			motion: motion.trim(),
			stance,
			opponent: opponent.trim(),
			result: result.trim(),
			speakers,
			awards,
			opponentAwards
		}, ...matches]);
		setRound("");
		setDate("");
		setTime("");
		setVenue("");
		setMotion("");
		setOpponent("");
		setResult("");
		setAwards(emptyAwards());
		setOpponentAwards(emptyOpponentAwards());
		setHint("已錄入這場賽事");
	}
	function removeMatch(id) {
		if (confirmDelete !== id) {
			setConfirmDelete(id);
			return;
		}
		store(matches.filter((match) => match.id !== id));
		setConfirmDelete(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl",
					children: "喇沙中辯"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "賽事紀錄"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-ink",
					children: "返回陣容"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card px-4 py-4 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg font-semibold",
					children: "台上辯員"
				}), speakers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "尚未儲存陣容。回到上一頁勾選角色並按儲存陣容。"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-ink",
					children: [squadStance ? `${stanceSide(squadStance)} · ` : "", speakers.map((speaker) => `${speaker.name}（${roleLabel(speaker.role)}）`).join(" ")]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4 rounded-card border border-line bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-lg font-semibold",
						children: "新賽事"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["杯賽", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tournament,
									onChange: (event) => setTournament(event.target.value),
									placeholder: "青苗",
									className: fieldClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["輪次", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: round,
									onChange: (event) => setRound(event.target.value),
									placeholder: "初賽",
									className: fieldClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["日期", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: date,
									onChange: (event) => setDate(event.target.value),
									placeholder: "3/10",
									inputMode: "numeric",
									className: fieldClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["時間", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: time,
									onChange: (event) => setTime(event.target.value),
									placeholder: "13:00-14:15",
									className: fieldClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium sm:col-span-2",
								children: ["地點", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: venue,
									onChange: (event) => setVenue(event.target.value),
									placeholder: "香港中文大學康本國際學術園 407室",
									className: fieldClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium sm:col-span-2",
								children: ["辯題", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: motion,
									onChange: (event) => setMotion(event.target.value),
									placeholder: "港府於處理流浪狗時應以「TNR」（捕捉、絕育、放回）取代便利性撲殺為主要方針",
									rows: 3,
									className: "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-seal"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["站方", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": stance === "pos",
										onClick: () => setStance("pos"),
										className: "inline-flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-semibold " + (stance === "pos" ? "border-seal bg-seal text-card" : "border-line bg-paper text-ink"),
										children: "正"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": stance === "neg",
										onClick: () => setStance("neg"),
										className: "inline-flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-semibold " + (stance === "neg" ? "border-ink bg-ink text-card" : "border-line bg-paper text-ink"),
										children: "反"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["對賽學校", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: opponent,
									onChange: (event) => setOpponent(event.target.value),
									placeholder: "莫壽增",
									className: fieldClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium sm:col-span-2",
								children: ["賽果", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: result,
									onChange: (event) => setResult(event.target.value),
									placeholder: "2:1 Win",
									className: fieldClass
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-serif text-base font-semibold",
						children: "得獎"
					}), speakers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "儲存陣容後，可在這裡勾選得獎辯員。"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 overflow-hidden rounded-lg border border-line",
						children: speakers.map((speaker, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 bg-paper px-3 py-3 " + (index === speakers.length - 1 ? "" : "border-b border-line"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-20 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-serif text-base font-semibold",
									children: speaker.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs text-muted",
									children: roleLabel(speaker.role)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid min-w-0 flex-1 grid-cols-2 gap-1.5",
								children: AWARDS.map((award) => {
									const checked = awards[award.id].includes(speaker.name);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										role: "checkbox",
										"aria-checked": checked,
										"aria-label": `${speaker.name} ${award.label}`,
										onClick: () => toggleAward(speaker.name, award.id),
										className: "inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-xs font-medium leading-tight " + (checked ? "border-seal bg-seal text-card" : "border-line bg-card text-ink hover:border-seal hover:bg-seal-soft"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: "flex size-4 shrink-0 items-center justify-center rounded-sm border " + (checked ? "border-card bg-card text-seal" : "border-muted/50 bg-card"),
											children: checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
												className: "size-3",
												strokeWidth: 3
											}) : null
										}), award.label]
									}, award.id);
								})
							})]
						}, speaker.name))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: AWARDS.map((award) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: [
								"對方",
								award.label,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: opponentAwards[award.id],
									onChange: (event) => setOpponentAwards((current) => ({
										...current,
										[award.id]: event.target.value
									})),
									placeholder: "一副",
									className: fieldClass
								})
							]
						}, award.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-line bg-paper p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-serif text-base font-semibold",
								children: "賽事稿"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => copy("preview", preview),
								className: "inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink",
								children: [copiedId === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-seal" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copiedId === "preview" ? "已複製" : "複製名單"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink",
							children: preview
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: saveMatch,
							className: "inline-flex h-11 items-center rounded-full border border-seal bg-seal px-5 text-sm font-semibold text-card",
							children: "儲存賽事"
						}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-seal",
							children: hint
						}) : null]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg font-semibold",
					children: "已錄賽事"
				}), matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-card border border-line bg-card px-4 py-6 text-sm text-muted",
					children: "尚未有賽事。"
				}) : matches.map((match) => {
					const text = formatMatch(match);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-card border border-line bg-card p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => copy(match.id, text),
								className: "inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink",
								children: [copiedId === match.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-seal" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copiedId === match.id ? "已複製" : "複製名單"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeMatch(match.id),
								className: "inline-flex h-11 items-center rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink",
								children: confirmDelete === match.id ? "再按一次刪除" : "刪除"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink",
							children: text
						})]
					}, match.id);
				})]
			})
		]
	});
}
function MatchesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchLog, {});
}
//#endregion
export { MatchesPage as component };
