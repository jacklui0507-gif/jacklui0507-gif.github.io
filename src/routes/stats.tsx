import { createFileRoute } from "@tanstack/react-router";
import { StatsBoard } from "@/components/stats-board";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  return <StatsBoard />;
}
