import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../components/dashboard/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { FiGrid, FiCalendar, FiUsers, FiTrendingUp } from "react-icons/fi";
import { getGlobalStats, getReservationStats, getPendingReservations } from "../services/statsService";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid 
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function AdminDashboard() {
  const { data: globalStats, isLoading: loadingGlobal } = useQuery({
    queryKey: ["global-stats"],
    queryFn: getGlobalStats,
  });

  const { data: resStats, isLoading: loadingRes } = useQuery({
    queryKey: ["reservation-stats"],
    queryFn: getReservationStats,
  });

  const { data: pendingList, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-reservations"],
    queryFn: () => getPendingReservations(5),
  });

  const pieData = [
    { name: "Confirmées", value: resStats?.confirmees || 0 },
    { name: "En attente", value: resStats?.en_attente || 0 },
    { name: "Annulées", value: resStats?.annulees || 0 },
  ];
  
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  const chartSalles = globalStats?.par_salle || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'établissement." />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<FiGrid className="size-5" />} 
          label="Salles dispos" 
          value={loadingGlobal ? "..." : globalStats?.available_rooms ?? 0} 
          trend={`${globalStats?.total_rooms ?? 0} au total`} 
        />
        <StatCard 
          icon={<FiCalendar className="size-5" />} 
          label="Réservations" 
          value={loadingGlobal ? "..." : globalStats?.total_reservations ?? 0} 
          accent="success" 
        />
        <StatCard 
          icon={<FiUsers className="size-5" />} 
          label="Utilisateurs" 
          value={loadingGlobal ? "..." : globalStats?.total_users ?? 0} 
          accent="warning" 
        />
        <StatCard 
          icon={<FiTrendingUp className="size-5" />} 
          label="Taux d'occupation" 
          value={loadingGlobal ? "..." : `${globalStats?.occupation_rate ?? 0}%`} 
          accent="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-elev p-6 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6">Réservations par salle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartSalles}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elev p-6">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6">Répartition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={8}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elev p-0 lg:col-span-3 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
             <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Dernières réservations en attente</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Ressource</th>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingPending ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 animate-pulse">Chargement...</td></tr>
                ) : (pendingList || []).length > 0 ? (
                  (pendingList as any[]).map((r: any) => (
                    <tr key={`${r.id}-${r.res_type}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{r.user_details?.username || r.user}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{r.room_details?.name || r.equipment_details?.name || "Élément"}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{r.date} · {r.heure_debut?.slice(0,5)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="badge badge-warning text-[10px]">En attente</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Aucune demande en attente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
