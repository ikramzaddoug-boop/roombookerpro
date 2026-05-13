import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/dashboard/PageHeader";
import { ReservationList } from "../components/dashboard/ReservationList";
import { getMyReservations, cancelReservation } from "../services/reservationService";
import { useToast } from "../components/dashboard/Toast";
import { FiClock } from "react-icons/fi";

export const Route = createFileRoute("/professor/reservations")({
  component: ProfessorReservations,
});

function ProfessorReservations() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => getMyReservations(),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, type }: { id: number; type: 'room' | 'equipment' }) => cancelReservation(id, type),
    onSuccess: () => {
      toast.push({ type: "success", msg: "Réservation annulée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["my-reservation-stats"] });
    },
    onError: (error: any) => {
      toast.push({ type: "error", msg: error.response?.data?.error || "Erreur lors de l'annulation" });
    }
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Mes réservations" 
        subtitle="Historique et gestion de vos cours et matériel." 
      />
      
      <div className="card-elev p-0 overflow-hidden border border-gray-100 shadow-xl bg-white/80 mt-6">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-black text-gray-900 flex items-center gap-2">
            <FiClock className="text-blue-500" /> Historique Récent
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded">Mise à jour en temps réel</span>
        </div>
        
        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium animate-pulse tracking-tight">Récupération de vos réservations...</p>
          </div>
        ) : (
          <ReservationList 
            reservations={reservations || []} 
            onCancel={(id, type) => cancelMutation.mutate({ id, type })}
          />
        )}
      </div>
    </div>
  );
}
