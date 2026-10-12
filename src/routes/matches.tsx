import { createFileRoute } from "@tanstack/react-router";
import { MatchLog } from "@/components/match-log";

export const Route = createFileRoute("/matches")({ component: MatchesPage });

function MatchesPage() {
  return <MatchLog />;
}
