import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({ children, requiredRole }: { children: ReactNode; requiredRole: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    } else if (user.role !== requiredRole) {
      const dest = user.role === "admin" ? "/admin/dashboard" : user.role === "professeur" ? "/professor/dashboard" : "/student/dashboard";
      navigate({ to: dest as any });
    }
  }, [user, requiredRole, navigate]);

  if (!user || user.role !== requiredRole) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Content wrapper with responsive padding to accommodate fixed sidebar on desktop */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        <Topbar user={user as any} onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
