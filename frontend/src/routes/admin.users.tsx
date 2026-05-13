import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Modal } from "@/components/dashboard/Modal";
import API from "@/api";
import { useToast } from "@/components/dashboard/Toast";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiMail, FiShield, FiBriefcase } from "react-icons/fi";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await API.get("/users/");
      return res.data.results || res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await API.delete(`/users/${id}/`);
    },
    onSuccess: () => {
      toast.push({ type: "success", msg: "Utilisateur supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["global-stats"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        first_name: data.name?.split(' ')[0] || data.name,
        last_name: data.name?.split(' ').slice(1).join(' ') || '',
      };
      if (editingUser?.id) {
        return await API.patch(`/users/${editingUser.id}/`, payload);
      } else {
        return await API.post("/users/", payload);
      }
    },
    onSuccess: () => {
      toast.push({ type: "success", msg: editingUser?.id ? "Utilisateur mis à jour" : "Utilisateur créé" });
      setIsModalOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["global-stats"] });
    },
    onError: (err: any) => {
      const bErr = err.response?.data;
      let msg = "Erreur lors de l'enregistrement";
      if (bErr) {
        if (bErr.password) msg = `Mot de passe: ${bErr.password[0]}`;
        else if (bErr.username) msg = `Nom d'utilisateur: ${bErr.username[0]}`;
        else if (bErr.email) msg = `Email: ${bErr.email[0]}`;
        else if (bErr.non_field_errors) msg = bErr.non_field_errors[0];
      }
      toast.push({ type: "error", msg });
    }
  });

  const filtered = (users || []).filter((u: any) => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-6">
        <PageHeader title="Gestion des Utilisateurs" subtitle="Gérez les comptes et les permissions." />
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiUserPlus /> Nouvel Utilisateur
        </button>
      </div>

      <div className="card-elev p-4 mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou pseudo..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Chargement des comptes...</div>
        ) : filtered.length > 0 ? (
          filtered.map((u: any) => (
            <div key={u.id} className="card-elev p-5 flex flex-col gap-4 relative group">
              <div className="flex items-start justify-between">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {u.name ? u.name[0].toUpperCase() : u.username[0].toUpperCase()}
                </div>
                <span className={`badge ${
                  u.role === 'admin' ? 'badge-destructive' : 
                  u.role === 'professeur' ? 'badge-success' : 
                  'badge-warning'
                } text-[10px]`}>
                  {u.role}
                </span>
              </div>
              
              <div>
                <h3 className="font-bold text-lg">{u.name || u.username}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <FiMail className="size-3" /> {u.email}
                </div>
                {u.department && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <FiBriefcase className="size-3" /> {u.department}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                  className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-2"
                >
                  <FiEdit2 className="size-3" /> Modifier
                </button>
                <button 
                  onClick={() => { if(confirm("Supprimer cet utilisateur ?")) deleteMutation.mutate(u.id); }}
                  className="btn-secondary flex-1 py-2 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/20 flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="size-3" /> Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-muted-foreground">Aucun utilisateur trouvé.</div>
        )}
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Modifier l'Utilisateur" : "Créer un Compte"}
      >
        <form 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            saveMutation.mutate(data);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom complet</label>
              <input name="name" defaultValue={editingUser?.name} className="input-field mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <input name="username" defaultValue={editingUser?.username} className="input-field mt-1" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" defaultValue={editingUser?.email} className="input-field mt-1" required />
          </div>
          {!editingUser && (
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <input name="password" type="password" className="input-field mt-1" required />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <select name="role" defaultValue={editingUser?.role || "etudiant"} className="input-field mt-1">
                <option value="etudiant">Étudiant</option>
                <option value="professeur">Professeur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Département</label>
              <input name="department" defaultValue={editingUser?.department} className="input-field mt-1" />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn-primary w-full py-3 font-bold mt-4"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Traitement..." : editingUser ? "Mettre à jour" : "Créer le compte"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
