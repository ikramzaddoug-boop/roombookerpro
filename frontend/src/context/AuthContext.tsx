import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface User {
  id: string;
  username: string;
  name: string; // Ce champ est crucial pour ton composant Login
  email: string;
  role: "admin" | "professeur" | "etudiant";
}

interface AuthCtx {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      axios
        .get("http://127.0.0.1:8000/api/me/")
        .then((res) => {
          const data = res.data;
          // On s'assure que le champ name existe pour l'UI
          data.name = data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username;
          setUser(data);
        })
        .catch(() => logout());
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await axios.post("http://127.0.0.1:8000/api/token/", {
      username,
      password,
    });

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    axios.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;

    const me = await axios.get("http://127.0.0.1:8000/api/me/");
    const userData = me.data;
    // On garantit la présence du nom pour le message "Bienvenue"
    userData.name = userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username;
    
    setUser(userData);
    return userData;
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await axios.post("http://127.0.0.1:8000/api/register/", {
      username: email.split('@')[0], // On génère un username à partir de l'email
      email,
      password,
      role,
    });
    
    const userData = res.data.user || res.data;
    userData.name = name; // On réinjecte le nom saisi pour l'UI
    
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    delete axios.defaults.headers.common.Authorization;
  };

  return (
    <Ctx.Provider value={{ user, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
