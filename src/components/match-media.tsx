import { useEffect, useState } from "react";
import { deleteFiles, getFile, MAX_FILE_BYTES, putFile } from "@/lib/files";
import {
  loadMatches,
  safeHttpUrl,
  saveMatches,
  youtubeId,
  type MatchFile,
  type MatchLink,
  type MatchRecord,
} from "@/lib/matches";

function StoredClip({ file }: { file: MatchFile }) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    getFile(file.id)
      .then((stored) => {
        if (cancelled) return;
        if (!stored) {
          setMissing(true);
          return;
        }
        objectUrl = URL.createObjectURL(stored.blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id]);

  if (missing) return <p className="text-sm text-muted">找不到檔案：{file.name}</p>;
  if (!url) return <p className="text-sm text-muted">載入{file.name}</p>;
  if (file.kind === "audio") return <audio controls src={url} className="w-full" />;
  return <video controls src={url} className="max-h-80 w-full rounded-lg bg-ink" />;
}

export function MatchMedia({
  match,
  onChange,
}: {
  match: MatchRecord;
  onChange: (next: MatchRecord, all: MatchRecord[]) => void;
}) {
  const [youtube, setYoutube] = useState("");
  const [doc, setDoc] = useState("");
  const [notice, setNotice] = useState("");

  function commit(next: MatchRecord) {
    const all = loadMatches().map((item) => (item.id === next.id ? next : item));
    saveMatches(all);
    onChange(next, all);
  }

  function addLink(kind: MatchLink["kind"], raw: string) {
    const url = safeHttpUrl(raw);
    if (!url) {
      setNotice("請貼上 http 或 https 連結");
      return;
    }
    if (kind === "youtube" && !youtubeId(url)) {
      setNotice("這不是 YouTube 連結");
      return;
    }
    const link: MatchLink = { id: crypto.randomUUID(), kind, url };
    commit({ ...match, links: [...match.links, link] });
    setNotice("");
    if (kind === "youtube") setYoutube("");
    else setDoc("");
  }

  async function addFiles(list: FileList | null, kind: MatchFile["kind"]) {
    if (!list || list.length === 0) return;
    const accepted: MatchFile[] = [];
    for (const file of list) {
      if (file.size > MAX_FILE_BYTES) {
        setNotice(`${file.name} 太大。長片請改貼 YouTube 連結。`);
        continue;
      }
      const meta: MatchFile = { id: crypto.randomUUID(), kind, name: file.name || (kind === "audio" ? "錄音" : "影片") };
      await putFile({ id: meta.id, matchId: match.id, name: meta.name, mime: file.type, blob: file });
      accepted.push(meta);
    }
    if (accepted.length) {
      commit({ ...match, files: [...match.files, ...accepted] });
      setNotice("");
    }
  }

  async function removeLink(id: string) {
    commit({ ...match, links: match.links.filter((link) => link.id !== id) });
  }

  async function removeFile(file: MatchFile) {
    await deleteFiles([file.id]);
    commit({ ...match, files: match.files.filter((item) => item.id !== file.id) });
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {match.links.map((link) => {
        const video = link.kind === "youtube" ? youtubeId(link.url) : null;
        const href = safeHttpUrl(link.url);
        return (
          <div key={link.id} className="flex flex-col gap-2">
            {video ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-line">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video}`}
                  title="比賽影片"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="break-all text-sm text-seal">
                  {link.kind === "youtube" ? "YouTube" : "Google 文件"}：{link.url}
                </a>
              ) : (
                <p className="break-all text-sm text-ink">{link.url}</p>
              )}
              <button type="button" onClick={() => removeLink(link.id)} className="shrink-0 text-sm text-muted">
                移除
              </button>
            </div>
          </div>
        );
      })}

      {match.files.map((file) => (
        <div key={file.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">
              {file.kind === "audio" ? "錄音" : "影片"}：{file.name}
            </p>
            <button type="button" onClick={() => removeFile(file)} className="shrink-0 text-sm text-muted">
              移除
            </button>
          </div>
          <StoredClip file={file} />
        </div>
      ))}

      <div className="grid gap-2 sm:grid-cols-2">
        <form
          className="flex gap-2"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            addLink("youtube", youtube);
          }}
        >
          <input
            value={youtube}
            onChange={(event) => setYoutube(event.target.value)}
            aria-label="YouTube 連結"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-seal"
          />
          <button type="submit" className="h-11 shrink-0 rounded-full border border-line bg-card px-3 text-sm font-medium">
            加入 YouTube
          </button>
        </form>
        <form
          className="flex gap-2"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            addLink("doc", doc);
          }}
        >
          <input
            value={doc}
            onChange={(event) => setDoc(event.target.value)}
            aria-label="Google 文件連結"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-seal"
          />
          <button type="submit" className="h-11 shrink-0 rounded-full border border-line bg-card px-3 text-sm font-medium">
            加入文件
          </button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line bg-card px-4 text-sm font-medium">
          加入錄音
          <input
            type="file"
            accept="audio/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              void addFiles(event.target.files, "audio");
              event.target.value = "";
            }}
          />
        </label>
        <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line bg-card px-4 text-sm font-medium">
          加入影片
          <input
            type="file"
            accept="video/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              void addFiles(event.target.files, "video");
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {notice ? <p className="text-sm text-seal">{notice}</p> : null}
    </div>
  );
}
