import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

type ToastT = { id: number; type: "success" | "error" | "info"; msg: string };
const Ctx = createContext<{ push: (t: Omit<ToastT, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ToastT[]>([]);
  const push = useCallback((t: Omit<ToastT, "id">) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { ...t, id }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {list.map((t) => {
          const Icon = t.type === "success" ? FiCheckCircle : t.type === "error" ? FiAlertCircle : FiInfo;
          const cls = t.type === "success" ? "border-success text-success" : t.type === "error" ? "border-destructive text-destructive" : "border-primary text-primary";
          return (
            <div key={t.id} className={`card-elev px-4 py-3 flex items-center gap-3 min-w-[260px] border-l-4 ${cls} animate-slide-up`}>
              <Icon className="size-5" />
              <span className="text-sm text-foreground">{t.msg}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
