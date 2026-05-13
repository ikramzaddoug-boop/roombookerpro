import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/dashboard/PageHeader";
import { 
  getReservations, 
  confirmReservation, 
  rejectReservation, 
  cancelReservation 
} from "../services/reservationService";
import { useToast } from "../components/dashboard/Toast";
import { FiCheck, FiX, FiSearch, FiFilter, FiUser, FiHome, FiCalendar, FiBox } from "react-icons/fi";

export const Route = createFileRoute("/admin/reservations")({ component: AdminReservations });

function AdminReservations() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin-reservations", statusFilter],
    queryFn: () => getReservations(),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, type }: { id: number, type: 'room' | 'equipment' }) => confirmReservation(id, type),
    onSuccess: () => {
      toast.push({ type: "success", msg: "Réservation confirmée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
    },
    onError: (err: any) => {
      toast.push({ type: "error", msg: err.response?.data?.error || "Erreur lors de la confirmation" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, type }: { id: number, type: 'room' | 'equipment' }) => rejectReservation(id, type),
    onSuccess: () => {
      toast.push({ type: "success", msg: "Réservation refusée" });
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
    },
    onError: (err: any) => {
      toast.push({ type: "error", msg: err.response?.data?.error || "Erreur lors du rejet" });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, type }: { id: number, type: 'room' | 'equipment' }) => cancelReservation(id, type),
    onSuccess: () => {
      toast.push({ type: "success", msg: "Réservation supprimée" });
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
    }
  });

  const filtered = (reservations || []).filter((r: any) => {
    const matchesSearch = 
      r.user_details?.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.room_details?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.equipment_details?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.titre?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <PageHeader title="Gestion des Réservations" subtitle="Validez ou gérez toutes les demandes de l'établissement." />

      <div className="card-elev p-4 my-6 flex flex-wrap gap-4 border border-gray-100">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par utilisateur, salle ou matériel..." 
            className="input-field pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select 
            className="input-field w-auto" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirmee">Confirmées</option>
            <option value="refusee">Refusées</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Récupération des données...</div>
        ) : filtered.length > 0 ? (
          filtered.map((r: any) => (
            <div key={`${r.res_type}-${r.id}`} className="card-elev border border-gray-100 flex flex-wrap items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`badge ${
                    r.status === 'confirmee' ? 'badge-success' : 
                    r.status === 'en_attente' ? 'badge-warning' : 
                    'badge-destructive'
                  } text-[10px] font-black uppercase tracking-widest`}>
                    {r.status === 'confirmee' ? 'Confirmée' : r.status === 'en_attente' ? 'En attente' : r.status === 'refusee' ? 'Refusée' : 'Annulée'}
                  </span>
                  <h3 className="font-bold text-gray-900">{r.titre || "Réservation"}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FiUser /></div>
                    <span>{r.user_details?.username || "Inconnu"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      {r.res_type === 'equipment' ? <FiBox /> : <FiHome />}
                    </div>
                    <span>
                      {r.room_details?.name || r.equipment_details?.name}
                      {r.res_type === 'equipment' && r.quantite && (
                        <span className="ml-2 text-xs font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                          x{r.quantite}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"><FiCalendar /></div>
                    <span>{r.date} · {r.heure_debut?.slice(0,5) || "00:00"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.status === 'en_attente' && (
                  <>
                    <button 
                      onClick={() => confirmMutation.mutate({ id: r.id, type: r.res_type })}
                      disabled={confirmMutation.isPending}
                      className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                    >
                      <FiCheck /> Valider
                    </button>
                    <button 
                      onClick={() => rejectMutation.mutate({ id: r.id, type: r.res_type })}
                      disabled={rejectMutation.isPending}
                      className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <FiX /> Rejeter
                    </button>
                  </>
                )}
                {(r.status === 'confirmee' || r.status === 'refusee') && (
                   <button 
                    onClick={() => cancelMutation.mutate({ id: r.id, type: r.res_type })}
                    disabled={cancelMutation.isPending}
                    className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all"
                   >
                     Réinitialiser
                   </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 card-elev border-dashed border-2 border-gray-100 bg-gray-50/50 flex flex-col items-center">
            <FiCalendar className="size-12 mb-4 text-gray-200" />
            <p className="font-medium tracking-tight">Aucune demande trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
