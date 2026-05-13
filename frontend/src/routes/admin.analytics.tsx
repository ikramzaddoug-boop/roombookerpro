import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getGlobalStats } from "@/services/statsService";
import API from "@/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, RadialBarChart, RadialBar, Legend
} from "recharts";
import { FiHome, FiBox, FiUsers, FiCalendar } from "react-icons/fi";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

const getAnalytics = async () => {
  const res = await API.get("/reservations/rooms/analytics/");
  return res.data;
};

function AdminAnalytics() {
  const { data: globalStats, isLoading } = useQuery({
    queryKey: ["global-stats-analytics"],
    queryFn: getGlobalStats,
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["analytics-data"],
    queryFn: getAnalytics,
  });

  const occupationRate = globalStats?.occupation_rate || 0;
  const radial = [{ name: "Occupation", value: occupationRate, fill: "#6366f1" }];
  const monthlyTrend = analytics?.monthly_trend || [];
  const occupancyByDay = analytics?.occupancy_by_day || [];
  const topRooms = analytics?.top_rooms || [];
  const topEquip = analytics?.top_equipments || [];

  const stats = [
    { icon: <FiHome />, label: "Salles totales", value: globalStats?.total_rooms ?? "...", sub: `${globalStats?.available_rooms ?? 0} disponibles`, color: "bg-blue-50 text-blue-600" },
    { icon: <FiBox />, label: "Équipements", value: globalStats?.total_equipments ?? "...", sub: "types de matériel", color: "bg-purple-50 text-purple-600" },
    { icon: <FiCalendar />, label: "Réservations", value: globalStats?.total_reservations ?? "...", sub: "au total", color: "bg-green-50 text-green-600" },
    { icon: <FiUsers />, label: "Utilisateurs", value: globalStats?.total_users ?? "...", sub: "inscrits", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Analytique" subtitle="Statistiques d'utilisation réelles depuis la base de données." />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card-elev p-5 flex items-center gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-black text-gray-900">{isLoading ? "..." : s.value}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.label}</div>
              <div className="text-[10px] text-gray-400">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend - real data */}
        <div className="card-elev p-5 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Tendance mensuelle (6 derniers mois)</h3>
          {loadingAnalytics ? (
            <div className="h-[300px] animate-pulse bg-gray-50 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Area type="monotone" dataKey="salles" name="Salles" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} dot={{ r: 4 }} />
                <Area type="monotone" dataKey="equipements" name="Équipements" stroke="#22c55e" fill="url(#g2)" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Occupation gauge */}
        <div className="card-elev p-5 flex flex-col items-center justify-center">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 w-full text-left">Taux d'occupation</h3>
          <div className="relative size-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={radial} innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-900">{isLoading ? "..." : `${occupationRate}%`}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Cette semaine</span>
            </div>
          </div>
        </div>

        {/* Occupancy by day - real data */}
        <div className="card-elev p-5 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Réservations de salles cette semaine</h3>
          {loadingAnalytics ? (
            <div className="h-[250px] animate-pulse bg-gray-50 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occupancyByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="rate" name="Réservations" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Global counters with real bars */}
        <div className="card-elev p-5">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-5">Compteurs globaux</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Salles disponibles</span>
                <span className="text-gray-500">{globalStats?.available_rooms || 0} / {globalStats?.total_rooms || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((globalStats?.available_rooms || 0) / (globalStats?.total_rooms || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Équipements</span>
                <span className="text-gray-500">{globalStats?.total_equipments || 0} types</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Utilisateurs actifs</span>
                <span className="text-gray-500">{globalStats?.total_users || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top rooms - real data */}
        <div className="card-elev p-5 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Top salles les plus réservées</h3>
          {loadingAnalytics ? (
            <div className="h-[280px] animate-pulse bg-gray-50 rounded-xl" />
          ) : topRooms.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topRooms} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" name="Réservations" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-300 text-sm">Aucune réservation de salle enregistrée.</div>
          )}
        </div>

        {/* Top equipment - real data */}
        <div className="card-elev p-5">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Top équipements</h3>
          {loadingAnalytics ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-50 rounded-lg animate-pulse" />)}</div>
          ) : topEquip.length > 0 ? (
            <div className="space-y-4">
              {topEquip.map((e: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="truncate">{e.name}</span>
                    <span className="text-gray-400 ml-2 shrink-0">{e.count} fois</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(e.count / (topEquip[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-300 text-sm">Aucune réservation d'équipement enregistrée.</div>
          )}
        </div>

      </div>
    </div>
  );
}
