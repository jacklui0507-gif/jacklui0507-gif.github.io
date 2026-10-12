import { createFileRoute } from "@tanstack/react-router";
import { RoleChecklist } from "@/components/role-checklist";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <RoleChecklist />;
}
