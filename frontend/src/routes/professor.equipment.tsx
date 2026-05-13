import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EquipmentGrid } from "@/components/dashboard/EquipmentGrid";

export const Route = createFileRoute("/professor/equipment")({
  component: () => (
    <div className="p-6">
      <PageHeader title="Équipements" subtitle="Réservez du matériel pour vos cours." />
      <div className="mt-6">
        <EquipmentGrid />
      </div>
    </div>
  )
});
