import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EquipmentGrid } from "@/components/dashboard/EquipmentGrid";

export const Route = createFileRoute("/student/equipment")({
  component: () => (
    <div className="p-6">
      <PageHeader title="Matériel" subtitle="Réserve un PC, un projecteur ou autre." />
      <div className="mt-6">
        <EquipmentGrid />
      </div>
    </div>
  )
});
