import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "../components/Toast";

export type ToastKind = "success" | "error" | "info";

export interface ToastRecord {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

export interface ToastInput {
  kind: ToastKind;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastValue {
  push: (input: ToastInput) => number;
  success: (title: string, message?: string) => number;
  error: (title: string, message?: string) => number;
  info: (title: string, message?: string) => number;
  dismiss: (id: number) => void;
}

const DEFAULT_DURATION = 4200;
const MAX_VISIBLE = 3;

const ToastContext = createContext<ToastValue | null>(null);

let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ kind, title, message, duration }: ToastInput) => {
      const id = nextToastId++;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, kind, title, message }]);

      const timer = window.setTimeout(() => dismiss(id), duration ?? DEFAULT_DURATION);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastValue>(
    () => ({
      push,
      success: (title, message) => push({ kind: "success", title, message }),
      error: (title, message) => push({ kind: "error", title, message }),
      info: (title, message) => push({ kind: "info", title, message }),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ol
        aria-label="Notificaciones"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex list-none flex-col items-center gap-3 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return context;
}
