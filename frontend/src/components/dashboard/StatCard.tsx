import type { ReactNode } from "react";

export function StatCard({ 
  icon, 
  label, 
  value, 
  trend, 
  accent = "primary" 
}: { 
  icon: ReactNode; 
  label: string; 
  value: string | number; 
  trend?: string; 
  accent?: "primary" | "success" | "warning" | "destructive" 
}) {
  const bgMap = {
    primary: "icon-bg-blue",
    success: "icon-bg-green",
    warning: "icon-bg-orange",
    destructive: "icon-bg-purple",
  };

  return (
    <div className="card-elev flex items-center gap-4 animate-fade-in">
      <div className={`stat-card-icon ${bgMap[accent]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
        <div className="text-2xl font-bold mt-0.5">{value}</div>
        {trend && <div className="text-[10px] text-green-500 font-bold mt-0.5">{trend}</div>}
      </div>
    </div>
  );
}
