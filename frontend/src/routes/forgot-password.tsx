import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useToast } from "@/components/dashboard/Toast";
import API from "@/api";

import { FiMail, FiArrowRight } from "react-icons/fi";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post("/password-reset/", { email });
      setSent(true);
      toast.push({ type: "success", msg: "Lien envoyé à votre adresse email" });
    } catch (err: any) {
      toast.push({ type: "error", msg: err.response?.data?.error || "Erreur lors de l'envoi" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthShell title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation." footer={<><span className="text-gray-500 font-medium">Je me souviens de mon mot de passe. </span><Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Retour à la connexion</Link></>}>
      {sent ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <div className="text-2xl font-black text-gray-900 mb-2">Email envoyé !</div>
          <p className="text-gray-500 font-medium mb-6">Vérifiez votre boîte de réception ou la console Django.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="email" 
                className="w-full bg-gray-100/80 border-none rounded-xl py-4 pl-12 pr-4 font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none shadow-sm"
                placeholder="votre.email@emsi.ma"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
            {loading ? "Envoi..." : "Envoyer le lien"}
            <FiArrowRight />
          </button>
        </form>
      )}
    </AuthShell>
  );
}
