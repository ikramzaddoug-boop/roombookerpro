import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SallesGrid } from "@/components/dashboard/SallesGrid";

export const Route = createFileRoute("/professor/salles")({ component: () => (
  <><PageHeader title="Salles" subtitle="Trouvez et réservez une salle." /><SallesGrid /></>
)});
