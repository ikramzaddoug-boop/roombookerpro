import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SallesGrid } from "@/components/dashboard/SallesGrid";

export const Route = createFileRoute("/student/salles")({ component: () => (
  <><PageHeader title="Salles" subtitle="Réserve une salle ou un équipement." /><SallesGrid /></>
)});
