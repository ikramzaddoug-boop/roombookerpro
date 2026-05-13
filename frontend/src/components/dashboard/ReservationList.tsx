import { FiClock, FiCalendar, FiBox, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

interface ReservationListProps {
  reservations: any[];
  onCancel: (id: number, type: 'room' | 'equipment') => void;
}

export function ReservationList({ reservations, onCancel }: ReservationListProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmee": 
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-fit"><FiCheckCircle /> Confirmée</span>;
      case "en_attente": 
        return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-fit"><FiClock /> En attente</span>;
      case "refusee": 
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-fit"><FiXCircle /> Refusée</span>;
      default: 
        return <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-fit"><FiAlertCircle /> {status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto bg-white/50 backdrop-blur-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
          <tr>
            <th className="px-6 py-5 font-black">Salle / Matériel</th>
            <th className="px-6 py-5 font-black">Date</th>
            <th className="px-6 py-5 font-black">Horaire</th>
            <th className="px-6 py-5 font-black">Statut</th>
            <th className="px-6 py-5 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {(reservations || []).length > 0 ? (
            reservations.map((r: any) => (
              <tr key={`${r.res_type}-${r.id}`} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center shadow-sm ${r.res_type === 'equipment' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                      {r.res_type === 'equipment' ? <FiBox className="size-5" /> : <FiCalendar className="size-5" />}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm leading-none mb-1">{r.room_details?.name || r.equipment_details?.name || "Élément"}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{r.titre || "Réservation sans titre"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="font-bold text-gray-600">{r.date}</div>
                </td>
                <td className="px-6 py-5 font-black text-gray-700">
                   {r.heure_debut?.slice(0,5)} <span className="text-gray-300 mx-1">—</span> {r.heure_fin?.slice(0,5)}
                </td>
                <td className="px-6 py-5">
                   {getStatusBadge(r.status)}
                </td>
                <td className="px-6 py-5 text-right">
                  {r.status === 'en_attente' && (
                    <button 
                      onClick={() => { if(confirm("Voulez-vous vraiment annuler cette demande ?")) onCancel(r.id, r.res_type); }} 
                      className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm transform active:scale-95"
                    >
                      Annuler
                    </button>
                  )}
                  {r.status !== 'en_attente' && (
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Verrouillé</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3 grayscale opacity-40">
                  <FiCalendar className="size-10 text-gray-400" />
                  <p className="text-sm font-bold text-gray-500">Aucun historique de réservation pour le moment.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
