import { useEffect, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { loadMatches } from "@/lib/matches";
import { roleLabel } from "@/lib/roster";
import { ROLES, debaterStats, percent, teamRecord } from "@/lib/stats";
import { useRouterState } from "@tanstack/react-router";

export function StatsBoard() {
  const href = useRouterState({ select: (state) => state.location.href });
  const [matches, setMatches] = useState(loadMatches);

  useEffect(() => {
    setMatches(loadMatches());
  }, [href]);

  const rows = debaterStats(matches);
  const team = teamRecord(matches);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">喇沙中辯</h1>
        <AppNav />
        <p className="text-sm text-muted">數據由已錄賽事計算。賽果要寫 Win、Lose、勝或負，才會計入勝率。</p>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="總場次" value={String(team.total)} />
        <Stat label="勝率" value={percent(team.wins, team.wins + team.losses)} />
        <Stat label="勝" value={String(team.wins)} />
        <Stat label="負" value={String(team.losses)} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <article key={row.name} className="rounded-card border border-line bg-card p-4">
            <h2 className="font-serif text-lg font-semibold">{row.name}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">總出場</dt>
                <dd className="font-serif text-2xl font-semibold">{row.appearances}</dd>
              </div>
              <div>
                <dt className="text-muted">勝率</dt>
                <dd className="font-serif text-2xl font-semibold">{percent(row.wins, row.wins + row.losses)}</dd>
                <dd className="text-xs text-muted">
                  {row.wins}勝 {row.losses}負
                  {row.unknown ? ` · 未記${row.unknown}` : ""}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">最佳辯論員率</dt>
                <dd className="font-serif text-2xl font-semibold">{percent(row.best, row.appearances)}</dd>
                <dd className="text-xs text-muted">
                  {row.best} / {row.appearances}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-ink">
              {ROLES.map((role) => `${roleLabel(role.id)} ${row.roles[role.id]}`).join(" · ")}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-card px-3 py-3 text-center">
      <div className="font-serif text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs font-medium text-muted">{label}</div>
    </div>
  );
}
