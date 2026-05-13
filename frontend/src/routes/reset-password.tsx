import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useToast } from "@/components/dashboard/Toast";
import API from "@/api";

import { FiLock, FiArrowRight } from "react-icons/fi";

export const Route = createFileRoute("/reset-password")({ component: Reset });

function Reset() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  const token = params.get("token");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return toast.push({ type: "error", msg: "Les mots de passe ne correspondent pas" });
    if (!uid || !token) return toast.push({ type: "error", msg: "Lien de réinitialisation invalide ou manquant" });

    try {
      setLoading(true);
      await API.post("/password-reset/confirm/", { uid, token, new_password: pw });
      toast.push({ type: "success", msg: "Mot de passe mis à jour avec succès !" });
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.push({ type: "error", msg: err.response?.data?.error || "Erreur lors de la réinitialisation" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe sécurisé." footer={<><span className="text-gray-500 font-medium">Je me souviens de mon mot de passe. </span><Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Retour à la connexion</Link></>}>
      <form onSubmit={submit} className="space-y-6">
        {!uid || !token ? (
          <div className="p-4 bg-red-50 text-red-500 rounded-lg text-sm text-center font-bold">
            ⚠️ Le lien de réinitialisation est incomplet. Veuillez cliquer sur le lien dans votre email.
          </div>
        ) : null}
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nouveau mot de passe</label>
          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="password" 
              className="w-full bg-gray-100/80 border-none rounded-xl py-4 pl-12 pr-4 font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none shadow-sm"
              placeholder="••••••••"
              value={pw} 
              onChange={(e) => setPw(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Confirmer</label>
          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="password" 
              className="w-full bg-gray-100/80 border-none rounded-xl py-4 pl-12 pr-4 font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none shadow-sm"
              placeholder="••••••••"
              value={pw2} 
              onChange={(e) => setPw2(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <button type="submit" disabled={loading || !uid || !token} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          {loading ? "Chargement..." : "Réinitialiser"}
          <FiArrowRight />
        </button>
      </form>
    </AuthShell>
  );
}
