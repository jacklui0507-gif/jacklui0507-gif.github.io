import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { deleteFiles, MAX_FILE_BYTES, putFile } from "@/lib/files";
import {
  AWARDS,
  copyText,
  emptyAwards,
  emptyOpponentAwards,
  formatChineseDate,
  formatMatch,
  loadMatches,
  safeHttpUrl,
  saveMatches,
  youtubeId,
  type AwardId,
  type AwardPicks,
  type MatchFile,
  type MatchLink,
  type MatchRecord,
  type OpponentAwards,
} from "@/lib/matches";
import {
  loadRoster,
  loadStance,
  roleLabel,
  speakersFromRoster,
  stanceSide,
  type Speaker,
  type Stance,
} from "@/lib/roster";

const fieldClass =
  "h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-seal";

export function MatchLog() {
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [squadStance, setSquadStance] = useState<Stance | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [tournament, setTournament] = useState("");
  const [round, setRound] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [motion, setMotion] = useState("");
  const [opponent, setOpponent] = useState("");
  const [result, setResult] = useState("");
  const [stance, setStance] = useState<Stance>("pos");
  const [awards, setAwards] = useState<AwardPicks>(emptyAwards);
  const [opponentAwards, setOpponentAwards] = useState<OpponentAwards>(emptyOpponentAwards);
  const [links, setLinks] = useState<MatchLink[]>([]);
  const [draftFiles, setDraftFiles] = useState<Array<MatchFile & { blob: Blob }>>([]);
  const [youtube, setYoutube] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [hint, setHint] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const roster = loadRoster();
    const savedStance = loadStance();
    setSpeakers(speakersFromRoster(roster));
    setSquadStance(savedStance);
    setStance(savedStance ?? "pos");
    setMatches(loadMatches());
  }, [href]);

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const preview = useMemo(
    () =>
      formatMatch({
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
        opponentAwards,
        links,
        files: draftFiles.map(({ id, kind, name }) => ({ id, kind, name })),
      }),
    [tournament, round, date, time, venue, motion, stance, opponent, result, speakers, awards, opponentAwards, links, draftFiles],
  );

  function toggleAward(name: string, award: AwardId) {
    setAwards((current) => {
      const picked = current[award];
      const next = picked.includes(name) ? picked.filter((item) => item !== name) : [...picked, name];
      return { ...current, [award]: next };
    });
  }

  async function copy(id: string, text: string) {
    await copyText(text);
    setCopiedId(id);
  }

  function store(next: MatchRecord[]) {
    setMatches(next);
    saveMatches(next);
  }

  async function saveMatch() {
    if (speakers.length === 0) {
      setHint("請先在首頁勾選台上辯員，再按儲存陣容");
      return;
    }
    if (!tournament.trim() || !round.trim() || !date.trim() || !motion.trim() || !opponent.trim() || !result.trim()) {
      setHint("請填杯賽、輪次、日期、辯題、對賽學校和賽果");
      return;
    }
    const record: MatchRecord = {
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
      opponentAwards,
      links,
      files: draftFiles.map(({ id, kind, name }) => ({ id, kind, name })),
    };
    const stored: string[] = [];
    try {
      for (const file of draftFiles) {
        await putFile({ id: file.id, matchId: record.id, name: file.name, mime: file.blob.type, blob: file.blob });
        stored.push(file.id);
      }
    } catch {
      await deleteFiles(stored);
      setHint("檔案未能儲存");
      return;
    }
    store([record, ...matches]);
    setRound("");
    setDate("");
    setTime("");
    setVenue("");
    setMotion("");
    setOpponent("");
    setResult("");
    setAwards(emptyAwards());
    setOpponentAwards(emptyOpponentAwards());
    setLinks([]);
    setDraftFiles([]);
    setYoutube("");
    setDocUrl("");
    setHint("已錄入這場賽事");
  }

  function addDraftLink(kind: MatchLink["kind"], raw: string) {
    const url = safeHttpUrl(raw);
    if (!url) {
      setHint("請貼上 http 或 https 連結");
      return;
    }
    if (kind === "youtube" && !youtubeId(url)) {
      setHint("這不是 YouTube 連結");
      return;
    }
    setLinks((current) => [...current, { id: crypto.randomUUID(), kind, url }]);
    setHint("");
    if (kind === "youtube") setYoutube("");
    else setDocUrl("");
  }

  function addDraftFiles(list: FileList | null, kind: MatchFile["kind"]) {
    if (!list) return;
    const next: Array<MatchFile & { blob: Blob }> = [];
    for (const file of list) {
      if (file.size > MAX_FILE_BYTES) {
        setHint(`${file.name} 太大。長片請改貼 YouTube 連結。`);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        kind,
        name: file.name || (kind === "audio" ? "錄音" : "影片"),
        blob: file,
      });
    }
    if (next.length) {
      setDraftFiles((current) => [...current, ...next]);
      setHint("");
    }
  }

  async function removeMatch(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const target = matches.find((match) => match.id === id);
    if (target) await deleteFiles(target.files.map((file) => file.id));
    store(matches.filter((match) => match.id !== id));
    setConfirmDelete(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">喇沙中辯</h1>
          <p className="mt-1 text-sm text-muted">賽事紀錄</p>
        </div>
        <AppNav />
      </header>

      <section className="rounded-card border border-line bg-card px-4 py-4 sm:px-5">
        <h2 className="font-serif text-lg font-semibold">台上辯員</h2>
        {speakers.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            尚未儲存陣容。
            <button type="button" onClick={() => void navigate({ to: "/" })} className="ml-1 font-medium text-seal underline">
              返回陣容
            </button>
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink">
            {squadStance ? `${stanceSide(squadStance)} · ` : ""}
            {speakers.map((speaker) => `${speaker.name}（${roleLabel(speaker.role)}）`).join(" ")}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-line bg-card p-4 sm:p-5">
        <h2 className="font-serif text-lg font-semibold">新賽事</h2>
        <form autoComplete="off" className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <label className="flex flex-col gap-1 text-sm font-medium">
            杯賽
            <input value={tournament} onChange={(event) => setTournament(event.target.value)} autoComplete="off" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            輪次
            <input value={round} onChange={(event) => setRound(event.target.value)} autoComplete="off" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            日期（日/月）
            <input value={date} onChange={(event) => setDate(event.target.value)} autoComplete="off" inputMode="numeric" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            時間
            <input value={time} onChange={(event) => setTime(event.target.value)} autoComplete="off" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
            地點
            <input value={venue} onChange={(event) => setVenue(event.target.value)} autoComplete="off" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
            辯題
            <textarea
              value={motion}
              onChange={(event) => setMotion(event.target.value)}
              rows={3}
              autoComplete="off"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-seal"
            />
          </label>
          <div className="flex flex-col gap-1 text-sm font-medium">
            站方
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={stance === "pos"}
                onClick={() => setStance("pos")}
                className={
                  "inline-flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-semibold " +
                  (stance === "pos" ? "border-seal bg-seal text-card" : "border-line bg-paper text-ink")
                }
              >
                正
              </button>
              <button
                type="button"
                aria-pressed={stance === "neg"}
                onClick={() => setStance("neg")}
                className={
                  "inline-flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-semibold " +
                  (stance === "neg" ? "border-ink bg-ink text-card" : "border-line bg-paper text-ink")
                }
              >
                反
              </button>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            對賽學校
            <input value={opponent} onChange={(event) => setOpponent(event.target.value)} autoComplete="off" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
            賽果
            <input value={result} onChange={(event) => setResult(event.target.value)} autoComplete="off" className={fieldClass} />
          </label>
        </form>

        <div>
          <h3 className="font-serif text-base font-semibold">得獎</h3>
          {speakers.length === 0 ? (
            <p className="mt-2 text-sm text-muted">儲存陣容後，可在這裡勾選得獎辯員。</p>
          ) : (
            <ul className="mt-3 overflow-hidden rounded-lg border border-line">
              {speakers.map((speaker, index) => (
                <li
                  key={speaker.name}
                  className={
                    "flex items-center gap-3 bg-paper px-3 py-3 " + (index === speakers.length - 1 ? "" : "border-b border-line")
                  }
                >
                  <span className="w-20 shrink-0">
                    <span className="block font-serif text-base font-semibold">{speaker.name}</span>
                    <span className="block text-xs text-muted">{roleLabel(speaker.role)}</span>
                  </span>
                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5">
                    {AWARDS.map((award) => {
                      const checked = awards[award.id].includes(speaker.name);
                      return (
                        <button
                          key={award.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${speaker.name} ${award.label}`}
                          onClick={() => toggleAward(speaker.name, award.id)}
                          className={
                            "inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-xs font-medium leading-tight " +
                            (checked
                              ? "border-seal bg-seal text-card"
                              : "border-line bg-card text-ink hover:border-seal hover:bg-seal-soft")
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
                          {award.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {AWARDS.map((award) => (
            <label key={award.id} className="flex flex-col gap-1 text-sm font-medium">
              對方{award.label}
              <input
                value={opponentAwards[award.id]}
                onChange={(event) =>
                  setOpponentAwards((current) => ({ ...current, [award.id]: event.target.value }))
                }
                autoComplete="off"
                className={fieldClass}
              />
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-serif text-base font-semibold">檔案與連結</h3>
          {links.length > 0 || draftFiles.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {links.map((link) => (
                <li key={link.id} className="flex items-start justify-between gap-3">
                  <a href={link.url} target="_blank" rel="noreferrer" className="break-all text-seal underline">
                    {link.kind === "youtube" ? "YouTube" : "Google 文件"}：{link.url}
                  </a>
                  <button type="button" className="shrink-0 text-muted" onClick={() => setLinks((current) => current.filter((item) => item.id !== link.id))}>
                    移除
                  </button>
                </li>
              ))}
              {draftFiles.map((file) => (
                <li key={file.id} className="flex items-start justify-between gap-3">
                  <span>
                    {file.kind === "audio" ? "錄音" : "影片"}：{file.name}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-muted"
                    onClick={() => setDraftFiles((current) => current.filter((item) => item.id !== file.id))}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex gap-2">
              <input
                value={youtube}
                onChange={(event) => setYoutube(event.target.value)}
                aria-label="YouTube 連結"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-seal"
              />
              <button type="button" onClick={() => addDraftLink("youtube", youtube)} className="h-11 shrink-0 rounded-full border border-line bg-paper px-3 text-sm font-medium">
                加入 YouTube
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={docUrl}
                onChange={(event) => setDocUrl(event.target.value)}
                aria-label="Google 文件連結"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-seal"
              />
              <button type="button" onClick={() => addDraftLink("doc", docUrl)} className="h-11 shrink-0 rounded-full border border-line bg-paper px-3 text-sm font-medium">
                加入文件
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line bg-paper px-4 text-sm font-medium">
              加入錄音
              <input
                type="file"
                accept="audio/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  addDraftFiles(event.target.files, "audio");
                  event.target.value = "";
                }}
              />
            </label>
            <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line bg-paper px-4 text-sm font-medium">
              加入影片
              <input
                type="file"
                accept="video/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  addDraftFiles(event.target.files, "video");
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-base font-semibold">賽事稿</h3>
            <button
              type="button"
              onClick={() => copy("preview", preview)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink"
            >
              {copiedId === "preview" ? <Check className="size-4 text-seal" /> : <Copy className="size-4" />}
              {copiedId === "preview" ? "已複製" : "複製名單"}
            </button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink">{preview}</pre>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveMatch}
            className="inline-flex h-11 items-center rounded-full border border-seal bg-seal px-5 text-sm font-semibold text-card"
          >
            儲存賽事
          </button>
          {hint ? <p className="text-sm text-seal">{hint}</p> : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">已錄賽事</h2>
        {matches.length === 0 ? (
          <p className="rounded-card border border-line bg-card px-4 py-6 text-sm text-muted">尚未有賽事。</p>
        ) : (
          matches.map((match) => {
            const text = formatMatch(match);
            return (
              <article key={match.id} className="rounded-card border border-line bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => copy(match.id, text)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink"
                  >
                    {copiedId === match.id ? <Check className="size-4 text-seal" /> : <Copy className="size-4" />}
                    {copiedId === match.id ? "已複製" : "複製名單"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMatch(match.id)}
                    className="inline-flex h-11 items-center rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink"
                  >
                    {confirmDelete === match.id ? "再按一次刪除" : "刪除"}
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink">{text}</pre>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
