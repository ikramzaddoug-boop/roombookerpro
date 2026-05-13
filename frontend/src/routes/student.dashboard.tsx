import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../components/dashboard/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { FiCalendar, FiCheckCircle, FiClock, FiBookOpen, FiBox } from "react-icons/fi";
import { getGlobalStats, getReservationStats, getPopularRooms } from "../services/statsService";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/student/dashboard")({ component: StudentDashboard });

function StudentDashboard() {
  const { user } = useAuth();

  const { data: globalStats, isLoading: loadingGlobal } = useQuery({
    queryKey: ["global-stats"],
    queryFn: getGlobalStats,
  });

  const { data: resStats, isLoading: loadingRes } = useQuery({
    queryKey: ["my-reservation-stats"],
    queryFn: getReservationStats,
  });

  const recent: any[] = resStats?.recent || [];
  const popularRooms = recent.filter((r: any) => r.res_type === 'room').slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Salut ${user?.username?.split(" ")[0] || "Étudiant"} 👋`}
        subtitle="Tes réservations et ressources en temps réel."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<FiCalendar className="size-5" />} 
          label="Mes Réservations" 
          value={loadingRes ? "..." : resStats?.total || 0} 
        />
        <StatCard 
          icon={<FiCheckCircle className="size-5" />} 
          label="Confirmées" 
          value={loadingRes ? "..." : resStats?.confirmees || 0} 
          accent="success" 
        />
        <StatCard 
          icon={<FiClock className="size-5" />} 
          label="En attente" 
          value={loadingRes ? "..." : resStats?.en_attente || 0} 
          accent="warning" 
        />
        <StatCard 
          icon={<FiBookOpen className="size-5" />} 
          label="Salles dispo" 
          value={loadingGlobal ? "..." : globalStats?.available_rooms || 0} 
          accent="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elev p-5 flex flex-col justify-between">
          <div>
             <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-gray-400">Mes réservations récentes</h3>
             {loadingRes ? (
               <div className="text-center py-8 animate-pulse text-muted-foreground">Chargement...</div>
             ) : recent.length > 0 ? (
               <div className="space-y-3">
                 {recent.map((r: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-100 transition-colors">
                     <div>
                       <div className="font-bold text-sm">
                         {r.res_type === 'room' ? `🏫 ${r.room_name || "Salle"}` : `📦 ${r.equipment_name || "Équipement"}`}
                       </div>
                       <div className="text-[10px] text-gray-400 font-medium">{r.date} · {r.heure_debut?.slice(0,5)}</div>
                     </div>
                     <span className={`badge ${r.status === 'confirmee' ? 'badge-success' : r.status === 'refusee' ? 'badge-destructive' : 'badge-warning'} text-[10px]`}>
                       {r.status === 'confirmee' ? 'Confirmé' : r.status === 'refusee' ? 'Refusé' : 'En attente'}
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">Aucune réservation pour le moment.</div>
             )}
          </div>
        </div>

        <div className="card-elev p-8 flex flex-col items-center justify-center text-center space-y-4 bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20">
           <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
              <FiBox className="size-8" />
           </div>
           <div>
              <h4 className="font-bold text-lg">Besoin de matériel ?</h4>
              <p className="text-sm text-blue-100 mt-1">
                 PC portables, projecteurs et tablettes sont à ta disposition.
              </p>
           </div>
           <Link to="/student/equipment" className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">Voir le matériel</Link>
        </div>
      </div>
    </div>
  );
}
