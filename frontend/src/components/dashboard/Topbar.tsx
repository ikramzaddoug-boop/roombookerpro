import { useState } from "react";
import { FiMenu, FiBell, FiSun, FiMoon, FiSearch } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import type { User } from "@/lib/mockData";

export function Topbar({ user, onMenu }: { user: User; onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-4 px-4 lg:px-8 h-16">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-md hover:bg-muted">
          <FiMenu className="size-5" />
        </button>
        
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              className="w-full bg-[var(--muted)] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-foreground" 
              placeholder="Rechercher salle, équipement…" 
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            {theme === "dark" ? <FiSun className="size-5" /> : <FiMoon className="size-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => { setOpenNotif(!openNotif); setOpenProfile(false); }} 
              className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors relative"
            >
              <FiBell className="size-5" />
              <span className="absolute top-2 right-2 size-2.5 border-2 border-white rounded-full bg-red-500" />
            </button>
            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 animate-fade-in">
                <div className="font-bold text-sm mb-2 px-2">Notifications</div>
                {["Nouvelle réservation", "Maintenance salle", "Stock matériel"].map((n) => (
                  <div key={n} className="px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm cursor-pointer">{n}</div>
                ))}
              </div>
            )}
          </div>

          <div className="relative ml-2">
            <button 
              onClick={() => { setOpenProfile(!openProfile); setOpenNotif(false); }} 
              className="flex items-center gap-3 p-1.5 pr-4 rounded-full hover:bg-gray-100 transition-all"
            >
              <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-bold leading-none">{user.name}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">{user.role}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
