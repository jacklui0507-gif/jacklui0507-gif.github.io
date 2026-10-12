import { createFileRoute } from "@tanstack/react-router";
import { ArchiveBoard } from "@/components/archive-board";

export const Route = createFileRoute("/archive")({ component: ArchivePage });

function ArchivePage() {
  return <ArchiveBoard />;
}
