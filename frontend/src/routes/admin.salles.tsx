import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/dashboard/PageHeader";
import { Modal } from "../components/dashboard/Modal";
import { getRooms, updateRoom, deleteRoom, createRoom } from "../services/roomService";
import { useToast } from "../components/dashboard/Toast";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiFilter } from "react-icons/fi";

export const Route = createFileRoute("/admin/salles")({ component: AdminSalles });

function AdminSalles() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // Filtre: all, active, inactive
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: () => getRooms(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, is_available }: { id: number, is_available: boolean }) => 
      updateRoom(id, { is_available }),
    onSuccess: () => {
      toast.push({ type: "success", msg: "Statut mis à jour avec succès" });
      queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRoom(id),
    onSuccess: () => {
      toast.push({ type: "success", msg: "Salle supprimée" });
      queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editingRoom?.id ? updateRoom(editingRoom.id, data) : createRoom(data),
    onSuccess: () => {
      toast.push({ type: "success", msg: editingRoom?.id ? "Mise à jour réussie" : "Création réussie" });
      setIsModalOpen(false);
      setEditingRoom(null);
      queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
    }
  });

  const filtered = (rooms || []).filter((r: any) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" && r.is_available) || (statusFilter === "inactive" && !r.is_available);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-8">
        <PageHeader title="Gestion des Salles" subtitle="Contrôlez l'état et la visibilité de vos ressources." />
        <button onClick={() => { setEditingRoom(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus /> Nouvelle Salle
        </button>
      </div>

      <div className="card-elev p-4 mb-8 flex flex-wrap gap-4 items-center border border-gray-100">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom..." 
            className="input-field pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <FiFilter className="text-gray-400" />
          <select 
            className="input-field w-auto" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les états</option>
            <option value="active">Actives uniquement</option>
            <option value="inactive">Inactives uniquement</option>
          </select>
        </div>
      </div>

      <div className="card-elev overflow-hidden p-0 border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Nom de la salle</th>
              <th className="px-6 py-5">Type</th>
              <th className="px-6 py-5">Capacité</th>
              <th className="px-6 py-5">Disponibilité</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">Chargement...</td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((room: any) => (
                <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{room.name}</td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{room.room_type}</td>
                  <td className="px-6 py-4 font-medium">{room.capacity} pers.</td>
                  <td className="px-6 py-4">
                    {/* Choix explicite par menu déroulant comme demandé */}
                    <select 
                      className={`text-[10px] font-black uppercase py-1.5 px-3 rounded-lg border-none focus:ring-2 transition-all cursor-pointer ${
                        room.is_available ? "bg-green-50 text-green-600 focus:ring-green-200" : "bg-red-50 text-red-500 focus:ring-red-200"
                      }`}
                      value={room.is_available ? "true" : "false"}
                      onChange={(e) => updateStatusMutation.mutate({ id: room.id, is_available: e.target.value === "true" })}
                    >
                      <option value="true">Actif</option>
                      <option value="false">Inactif</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditingRoom(room); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                      <FiEdit2 className="size-4" />
                    </button>
                    <button onClick={() => { if(confirm("Supprimer ?")) deleteMutation.mutate(room.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                      <FiTrash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">Aucun résultat trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Modifier" : "Nouvelle Salle"}>
        <form 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            saveMutation.mutate({
              ...data,
              capacity: parseInt(data.capacity as string),
              is_available: data.is_available === 'on',
              floor: parseInt(data.floor as string) || 0
            });
          }}
        >
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom</label>
            <input name="name" defaultValue={editingRoom?.name} className="input-field mt-1" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
              <select name="room_type" defaultValue={editingRoom?.room_type || "salle_cours"} className="input-field mt-1">
                <option value="salle_cours">Salle de cours</option>
                <option value="salle_td">Salle de TD</option>
                <option value="salle_tp">Salle de TP</option>
                <option value="salle_info">Salle Informatique</option>
                <option value="amphi">Amphi</option>
                <option value="labo">Labo</option>
                <option value="atelier">Atelier</option>
                <option value="salle_reunion">Salle de réunion</option>
                <option value="bureau">Bureau</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacité</label>
              <input name="capacity" type="number" defaultValue={editingRoom?.capacity} className="input-field mt-1" required />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bâtiment</label>
            <input name="location" defaultValue={editingRoom?.location} className="input-field mt-1" required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL de l'image (Optionnel)</label>
            <input name="image_url" type="url" defaultValue={editingRoom?.image_url} placeholder="https://..." className="input-field mt-1" />
          </div>
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input type="checkbox" name="is_available" defaultChecked={editingRoom ? editingRoom.is_available : true} id="is_available_modal" className="size-5" />
            <label htmlFor="is_available_modal" className="text-sm font-bold text-gray-700">Disponible à la création</label>
          </div>
          <button type="submit" className="btn-primary w-full py-4 font-black" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Enregistrement..." : editingRoom ? "Enregistrer" : "Créer"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
