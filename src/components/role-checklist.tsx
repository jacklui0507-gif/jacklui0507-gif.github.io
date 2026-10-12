import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, RotateCcw } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import {
  NAMES,
  ROLES,
  defaultRoster,
  loadRoster,
  loadStance,
  namesForRole,
  saveRoster,
  saveStance,
  speakersFromRoster,
  type RoleId,
  type RosterState,
  type Stance,
} from "@/lib/roster";

export function RoleChecklist() {
  const navigate = useNavigate();
  const [roster, setRoster] = useState<RosterState>(defaultRoster);
  const [stance, setStance] = useState<Stance | null>(null);
  const [ready, setReady] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saveHint, setSaveHint] = useState("");
  const tapLock = useRef<{ key: string; at: number }>({ key: "", at: 0 });

  useEffect(() => {
    setRoster(loadRoster());
    setStance(loadStance());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveRoster(roster);
  }, [roster, ready]);

  useEffect(() => {
    if (!ready) return;
    saveStance(stance);
  }, [stance, ready]);

  const counts = useMemo(
    () =>
      Object.fromEntries(ROLES.map((role) => [role.id, namesForRole(roster, role.id).length])) as Record<
        RoleId,
        number
      >,
    [roster],
  );

  function acceptTap(key: string) {
    const now = Date.now();
    if (tapLock.current.key === key && now - tapLock.current.at < 350) return false;
    tapLock.current = { key, at: now };
    return true;
  }

  function toggle(name: string, role: RoleId) {
    if (!acceptTap(`${name}:${role}`)) return;
    setConfirmClear(false);
    setSaveHint("");
    setRoster((current) => ({
      ...current,
      [name]: { ...current[name], [role]: !current[name][role] },
    }));
  }

  function chooseStance(next: Stance) {
    if (!acceptTap(`stance:${next}`)) return;
    setSaveHint("");
    setStance(next);
  }

  function clearAll() {
    if (!acceptTap("clear")) return;
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setRoster(defaultRoster());
    setConfirmClear(false);
    setSaveHint("");
  }

  function saveSquad() {
    if (!acceptTap("save")) return;
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
    void navigate({ to: "/matches" });
  }

  const totalPicks = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">喇沙中辯</h1>
        </div>
        <AppNav />
        <div className="relative z-20 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted">站方</span>
          <button
            type="button"
            aria-pressed={stance === "pos"}
            onClick={() => chooseStance("pos")}
            className={
              "inline-flex h-12 min-w-16 items-center justify-center rounded-full border px-5 text-sm font-semibold " +
              (stance === "pos" ? "border-seal bg-seal text-card" : "border-line bg-card text-ink")
            }
          >
            正
          </button>
          <button
            type="button"
            aria-pressed={stance === "neg"}
            onClick={() => chooseStance("neg")}
            className={
              "inline-flex h-12 min-w-16 items-center justify-center rounded-full border px-5 text-sm font-semibold " +
              (stance === "neg" ? "border-ink bg-ink text-card" : "border-line bg-card text-ink")
            }
          >
            反
          </button>
          <span className="text-sm text-muted">
            {stance === "pos" ? "全隊正方" : stance === "neg" ? "全隊反方" : "先選一次，全隊跟這一方"}
          </span>
        </div>
      </header>

      <section aria-label="各角色人數" className="grid grid-cols-4 gap-2">
        {ROLES.map((role) => {
          const count = counts[role.id];
          const active = count > 0;
          return (
            <div
              key={role.id}
              className={
                "rounded-card border px-2 py-3 text-center " +
                (active ? "border-seal bg-seal-soft" : "border-line bg-card")
              }
            >
              <div className={"font-serif text-2xl font-semibold " + (active ? "text-seal" : "text-ink")}>{count}</div>
              <div className="text-xs font-medium text-muted">{role.label}</div>
            </div>
          );
        })}
      </section>

      <section aria-label="辯手名單" className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
        <div className="flex items-baseline justify-between border-b border-line px-4 py-3 sm:px-5">
          <h2 className="font-serif text-lg font-semibold">名單</h2>
          <p className="text-xs text-muted">{totalPicks === 0 ? "尚未勾選" : `已勾 ${totalPicks} 項`}</p>
        </div>
        <ul>
          {NAMES.map((name, index) => (
            <li
              key={name}
              className={"flex flex-col gap-2 px-4 py-3 sm:px-5 " + (index === NAMES.length - 1 ? "" : "border-b border-line")}
            >
              <span className="font-serif text-lg font-semibold tracking-wide text-ink">{name}</span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {ROLES.map((role) => {
                  const checked = Boolean(roster[name]?.[role.id]);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      aria-pressed={checked}
                      aria-label={`${name} ${role.label}`}
                      onClick={() => toggle(name, role.id)}
                      className={
                        "relative z-20 inline-flex h-12 w-full items-center justify-center gap-1 rounded-lg border px-1 text-sm font-medium " +
                        (checked
                          ? "border-seal bg-seal text-card"
                          : "border-line bg-paper text-ink")
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={
                          "flex size-4 shrink-0 items-center justify-center rounded-sm border " +
                          (checked ? "border-card bg-card text-seal" : "border-muted/50 bg-card")
                        }
                      >
                        {checked ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="relative z-20 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={saveSquad}
          className="inline-flex h-12 items-center rounded-full border border-seal bg-seal px-5 text-sm font-semibold text-card"
        >
          儲存陣容
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-12 items-center gap-1.5 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink"
        >
          <RotateCcw className="size-4" />
          {confirmClear ? "再按一次清除" : "全部清除"}
        </button>
        {saveHint ? <p className="text-sm text-seal">{saveHint}</p> : null}
      </div>

      <section aria-label="按角色檢視" className="rounded-card border border-line bg-card p-4 sm:p-5">
        <h2 className="font-serif text-lg font-semibold">按角色檢視</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => {
            const picked = namesForRole(roster, role.id);
            return (
              <div key={role.id} className="rounded-lg border border-line bg-paper px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-base font-semibold">{role.label}</h3>
                  <span className="text-xs text-muted">{picked.length} 人</span>
                </div>
                <p className={"mt-2 text-sm " + (picked.length ? "text-ink" : "text-muted")}>
                  {picked.length ? picked.join("、") : "尚未勾選"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-center text-xs text-muted">勾選會留在這部裝置，重新開啟仍然在。</p>
    </main>
  );
}