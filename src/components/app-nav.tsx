import { useNavigate, useRouterState } from "@tanstack/react-router";

const ITEMS = [
  { to: "/", label: "陣容" },
  { to: "/matches", label: "賽事紀錄" },
  { to: "/archive", label: "賽事庫" },
  { to: "/stats", label: "數據" },
] as const;

function isHere(path: string, to: string) {
  const clean = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  if (to === "/") return clean === "/" || clean.endsWith("/index");
  return clean === to || clean.endsWith(to);
}

export function AppNav() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav aria-label="頁面" className="relative z-20 flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const current = isHere(path, item.to);
        return (
          <button
            key={item.to}
            type="button"
            aria-current={current ? "page" : undefined}
            onClick={() => {
              if (!current) void navigate({ to: item.to });
            }}
            className={
              "inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium " +
              (current ? "border-seal bg-seal-soft text-seal" : "border-line bg-card text-ink")
            }
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}