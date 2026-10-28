import type { ToastKind, ToastRecord } from "../context/ToastContext";

const STYLES: Record<ToastKind, { ring: string; icon: string; label: string }> = {
  success: {
    ring: "border-emerald-400/40",
    icon: "text-emerald-300",
    label: "Listo",
  },
  error: {
    ring: "border-rose-400/40",
    icon: "text-rose-300",
    label: "Error",
  },
  info: {
    ring: "border-flare/40",
    icon: "text-flare",
    label: "Info",
  },
};

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === "success") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="m8.5 12.5 2.4 2.4 4.6-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "error") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.8v5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.4" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

interface ToastProps {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const styles = STYLES[toast.kind];

  return (
    <li
      role={toast.kind === "error" ? "alert" : "status"}
      className={`animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${styles.ring} bg-panel/95 p-3.5 shadow-2xl shadow-black/40 backdrop-blur`}
    >
      <span className={`mt-0.5 shrink-0 ${styles.icon}`}>
        <ToastIcon kind={toast.kind} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-star">{toast.title}</p>
        {toast.message ? <p className="mt-0.5 text-xs leading-relaxed text-haze">{toast.message}</p> : null}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={`Cerrar notificación: ${toast.title}`}
        className="rounded-md p-1 text-haze transition-colors hover:bg-line/60 hover:text-star"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
          <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
