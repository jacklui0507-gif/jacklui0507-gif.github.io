import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { MatchMedia } from "@/components/match-media";
import { deleteFiles } from "@/lib/files";
import { copyText, formatMatch, groupByTournament, loadMatches, saveMatches, type MatchRecord } from "@/lib/matches";

export function ArchiveBoard() {
  const href = useRouterState({ select: (state) => state.location.href });
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setMatches(loadMatches());
  }, [href]);

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const groups = groupByTournament(matches);

  async function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const target = matches.find((match) => match.id === id);
    if (target) await deleteFiles(target.files.map((file) => file.id));
    const next = matches.filter((match) => match.id !== id);
    saveMatches(next);
    setMatches(next);
    setConfirmDelete(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">喇沙中辯</h1>
        <AppNav />
        <p className="text-sm text-muted">按杯賽分開。每場包含賽事稿、錄音、影片、YouTube 和 Google 文件。</p>
      </header>

      {groups.length === 0 ? (
        <p className="rounded-card border border-line bg-card px-4 py-6 text-sm text-muted">尚未有賽事。</p>
      ) : (
        groups.map((group) => (
          <section key={group.name} className="flex flex-col gap-3">
            <h2 className="font-serif text-xl font-semibold">{group.name}</h2>
            {group.matches.map((match) => {
              const text = formatMatch(match);
              return (
                <article key={match.id} className="rounded-card border border-line bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await copyText(text);
                        setCopiedId(match.id);
                      }}
                      className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-paper px-4 text-sm font-medium"
                    >
                      {copiedId === match.id ? <Check className="size-4 text-seal" /> : <Copy className="size-4" />}
                      {copiedId === match.id ? "已複製" : "複製名單"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(match.id)}
                      className="inline-flex h-11 items-center rounded-full border border-line bg-paper px-4 text-sm font-medium"
                    >
                      {confirmDelete === match.id ? "再按一次刪除" : "刪除"}
                    </button>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink">{text}</pre>
                  <MatchMedia
                    match={match}
                    onChange={(_next, all) => {
                      setMatches(all);
                    }}
                  />
                </article>
              );
            })}
          </section>
        ))
      )}
    </main>
  );
}
