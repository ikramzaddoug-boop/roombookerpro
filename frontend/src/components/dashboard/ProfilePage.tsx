import { PageHeader } from "./PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useToast } from "./Toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [dept, setDept] = useState((user as any)?.department ?? "");

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put("http://127.0.0.1:8000/api/me/", data);
      return res.data;
    },
    onSuccess: () => {
      toast.push({ type: "success", msg: "Profil mis à jour avec succès" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }); // Facultatif selon usage
    },
    onError: () => {
      toast.push({ type: "error", msg: "Erreur lors de la mise à jour" });
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
      email,
      phone,
      department: dept
    });
  };

  return (
    <div className="p-6">
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="card-elev p-8 text-center flex flex-col items-center">
          <div className="size-24 rounded-full gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/20">
            {user?.name?.charAt(0) || user?.username?.charAt(0) || "?"}
          </div>
          <h3 className="mt-6 font-bold text-xl">{user?.name || user?.username}</h3>
          <div className="text-sm text-muted-foreground mt-1">{user?.email}</div>
          <span className="badge badge-primary mt-4 inline-block capitalize px-4 py-1">{user?.role}</span>
          
          <div className="w-full mt-8 pt-8 border-t border-white/5 space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">ID Utilisateur</span>
              <span className="font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Statut</span>
              <span className="text-success font-bold">Actif</span>
            </div>
          </div>
        </div>

        <div className="card-elev p-6 lg:col-span-2">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
              <input 
                className="input-field mt-1.5" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input 
                className="input-field mt-1.5" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="jean@exemple.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <input 
                className="input-field mt-1.5" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+212 6..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Département / Filière</label>
              <input 
                className="input-field mt-1.5" 
                value={dept} 
                onChange={(e) => setDept(e.target.value)} 
                placeholder="Ex: Informatique, Génie Civil..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Rôle (non modifiable)</label>
              <input className="input-field mt-1.5 bg-white/5 border-dashed cursor-not-allowed" value={user?.role ?? ""} disabled />
            </div>
          </div>
          
          <div className="mt-10 flex justify-end">
            <button 
              className="btn-primary px-8 py-3 font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
