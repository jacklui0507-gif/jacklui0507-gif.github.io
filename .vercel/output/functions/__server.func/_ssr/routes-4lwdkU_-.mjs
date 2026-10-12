import { i as __toESM } from "../_runtime.mjs";
import { a as loadStance, d as speakersFromRoster, i as loadRoster, l as saveRoster, n as ROLES, o as namesForRole, r as defaultRoster, t as NAMES, u as saveStance } from "./roster-meN1cT_y.mjs";
import { C as require_jsx_runtime, Y as require_react, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Check, n as RotateCcw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-4lwdkU_-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RoleChecklist() {
	const navigate = useNavigate();
	const [roster, setRoster] = (0, import_react.useState)(defaultRoster);
	const [stance, setStance] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [saveHint, setSaveHint] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setRoster(loadRoster());
		setStance(loadStance());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveRoster(roster);
	}, [roster, ready]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveStance(stance);
	}, [stance, ready]);
	const counts = (0, import_react.useMemo)(() => Object.fromEntries(ROLES.map((role) => [role.id, namesForRole(roster, role.id).length])), [roster]);
	function toggle(name, role) {
		setConfirmClear(false);
		setSaveHint("");
		setRoster((current) => ({
			...current,
			[name]: {
				...current[name],
				[role]: !current[name][role]
			}
		}));
	}
	function chooseStance(next) {
		setSaveHint("");
		setStance(next);
	}
	function clearAll() {
		if (!confirmClear) {
			setConfirmClear(true);
			return;
		}
		setRoster(defaultRoster());
		setConfirmClear(false);
		setSaveHint("");
	}
	function saveSquad() {
		if (!stance) {
			setSaveHint("請先選擇站方：正或反");
			return;
		}
		if (speakersFromRoster(roster).length === 0) {
			setSaveHint("請先勾選台上辯員");
			return;
		}
		saveRoster(roster);
		saveStance(stance);
		navigate({ to: "/matches" });
	}
	const totalPicks = Object.values(counts).reduce((sum, n) => sum + n, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl",
						children: "喇沙中辯"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/matches",
						className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-ink",
						children: "賽事紀錄"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-1 text-sm font-medium text-muted",
							children: "站方"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": stance === "pos",
							onClick: () => chooseStance("pos"),
							className: "inline-flex h-11 min-w-16 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors " + (stance === "pos" ? "border-seal bg-seal text-card" : "border-line bg-card text-ink hover:bg-ink-soft"),
							children: "正"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": stance === "neg",
							onClick: () => chooseStance("neg"),
							className: "inline-flex h-11 min-w-16 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors " + (stance === "neg" ? "border-ink bg-ink text-card" : "border-line bg-card text-ink hover:bg-ink-soft"),
							children: "反"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: stance === "pos" ? "全隊正方" : stance === "neg" ? "全隊反方" : "先選一次，全隊跟這一方"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"aria-label": "各角色人數",
				className: "grid grid-cols-4 gap-2",
				children: ROLES.map((role) => {
					const count = counts[role.id];
					const active = count > 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-card border px-2 py-3 text-center " + (active ? "border-seal bg-seal-soft" : "border-line bg-card"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-serif text-2xl font-semibold " + (active ? "text-seal" : "text-ink"),
							children: count
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium text-muted",
							children: role.label
						})]
					}, role.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "辯手名單",
				className: "overflow-hidden rounded-card border border-line bg-card shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between border-b border-line px-4 py-3 sm:px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-lg font-semibold",
						children: "名單"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: totalPicks === 0 ? "尚未勾選" : `已勾 ${totalPicks} 項`
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: NAMES.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 " + (index === NAMES.length - 1 ? "" : "border-b border-line"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-20 shrink-0 font-serif text-lg font-semibold tracking-wide text-ink",
						children: name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4",
						children: ROLES.map((role) => {
							const checked = roster[name][role.id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "checkbox",
								"aria-checked": checked,
								"aria-label": `${name} ${role.label}`,
								onClick: () => toggle(name, role.id),
								className: "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors " + (checked ? "border-seal bg-seal text-card" : "border-line bg-paper text-ink hover:border-seal hover:bg-seal-soft"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									className: "flex size-4 shrink-0 items-center justify-center rounded-sm border " + (checked ? "border-card bg-card text-seal" : "border-muted/50 bg-card"),
									children: checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-3",
										strokeWidth: 3
									}) : null
								}), role.label]
							}, role.id);
						})
					})]
				}, name)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: saveSquad,
						className: "inline-flex h-11 items-center rounded-full border border-seal bg-seal px-5 text-sm font-semibold text-card",
						children: "儲存陣容"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: clearAll,
						className: "inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink transition-colors hover:bg-ink-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), confirmClear ? "再按一次清除" : "全部清除"]
					}),
					saveHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-seal",
						children: saveHint
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "按角色檢視",
				className: "rounded-card border border-line bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg font-semibold",
					children: "按角色檢視"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2",
					children: ROLES.map((role) => {
						const picked = namesForRole(roster, role.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-line bg-paper px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-serif text-base font-semibold",
									children: role.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [picked.length, " 人"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm " + (picked.length ? "text-ink" : "text-muted"),
								children: picked.length ? picked.join("、") : "尚未勾選"
							})]
						}, role.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs text-muted",
				children: "勾選會留在這部裝置，重新開啟仍然在。"
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleChecklist, {});
}
//#endregion
export { Home as component };
