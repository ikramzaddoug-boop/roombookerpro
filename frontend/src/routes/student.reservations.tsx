import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/dashboard/PageHeader";
import { ReservationList } from "../components/dashboard/ReservationList";
import { getMyReservations, cancelReservation } from "../services/reservationService";
import { useToast } from "../components/dashboard/Toast";
import { FiCalendar, FiClock, FiCheckCircle, FiLoader } from "react-icons/fi";

export const Route = createFileRoute("/student/reservations")({
  component: StudentReservations,
});

function StudentReservations() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => getMyReservations(),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, type }: { id: number, type: 'room' | 'equipment' }) => cancelReservation(id, type),
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
    <div className="space-y-8 animate-fade-in p-2">
      <PageHeader 
        title="Mes Réservations" 
        subtitle="Consultez l'historique et le statut de vos demandes en temps réel."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elev p-6 border-l-4 border-blue-500 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <FiCalendar className="size-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total</p>
              <h4 className="text-2xl font-black text-gray-900">{reservations?.length || 0}</h4>
            </div>
          </div>
        </div>

        <div className="card-elev p-6 border-l-4 border-green-500 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
              <FiCheckCircle className="size-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirmées</p>
              <h4 className="text-2xl font-black text-gray-900">
                {reservations?.filter((r: any) => r.status === 'confirmee').length || 0}
              </h4>
            </div>
          </div>
        </div>

        <div className="card-elev p-6 border-l-4 border-orange-500 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
              <FiLoader className="size-6" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">En attente</p>
              <h4 className="text-2xl font-black text-gray-900">
                {reservations?.filter((r: any) => r.status === 'en_attente').length || 0}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elev p-0 overflow-hidden border border-gray-100 shadow-xl bg-white/80">
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
