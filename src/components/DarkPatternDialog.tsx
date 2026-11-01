import { useEffect, useId, useRef, useState } from "react";

/*
 * Dark pattern intencional.
 *
 * - Preselection: la casilla de novedades del formulario viene marcada, y "No
 *   volver a preguntar" también, así que la próxima suscripción no pide nada.
 * - Confirmshaming: rechazar se redacta como una pérdida y va como enlace gris
 *   minúsculo, frente a un botón a todo el ancho.
 * - Nagging: al desmarcar la casilla se abre otro diálogo para retener la
 *   suscripción, así que darse de baja cuesta más clics que suscribirse.
 *
 */

interface DarkPatternDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  declineLabel: string;
  onConfirm: (rememberChoice: boolean) => void;
  onDecline: () => void;
  onCancel: () => void;
  rememberLabel?: string;
  rememberHint?: string;
  closeLabel?: string;
  tone?: "danger" | "default";
  showRemember?: boolean;
}

export function DarkPatternDialog({
  open,
  title,
  description,
  confirmLabel,
  declineLabel,
  onConfirm,
  onDecline,
  onCancel,
  rememberLabel = "No volver a preguntar",
  rememberHint = "(recomendado)",
  closeLabel = "Cerrar sin confirmar",
  tone = "danger",
  showRemember = true,
}: DarkPatternDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const rememberId = useId();
  const [rememberChoice, setRememberChoice] = useState(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      // Cada apertura vuelve al estado preseleccionado (táctica 1).
      setRememberChoice(true);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,30rem)] overflow-y-auto rounded-2xl border border-line bg-panel p-0 text-star shadow-2xl shadow-black/60 backdrop:bg-void/80 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6">
        <button
          type="button"
          onClick={onCancel}
          aria-label={closeLabel}
          className="absolute top-3 right-3 rounded-md p-1.5 text-haze transition-colors hover:bg-line/60 hover:text-star"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
            <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <h2 id={titleId} className="pr-8 font-display text-lg font-semibold text-star">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-haze">
          {description}
        </p>

        <button
          type="button"
          onClick={() => onConfirm(rememberChoice)}
          className={`${tone === "danger" ? "btn-danger" : "btn-primary"} mt-5 w-full`}
        >
          {confirmLabel}
        </button>

        {/* Táctica 2: la opción segura como enlace pequeño y de bajo contraste. */}
        <button
          type="button"
          onClick={onDecline}
          className="mt-2 w-full py-1 text-center text-xs text-haze underline decoration-line underline-offset-4 transition-colors hover:text-star"
        >
          {declineLabel}
        </button>

        {/* Táctica 1: preferencia destructiva preseleccionada. */}
        {showRemember ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-line/60 bg-ink/50 p-2.5">
            <input
              id={rememberId}
              type="checkbox"
              checked={rememberChoice}
              onChange={(event) => setRememberChoice(event.target.checked)}
              className="mt-0.5 size-4 accent-rose-500"
            />
            <label htmlFor={rememberId} className="text-[11px] leading-relaxed text-haze">
              {rememberLabel} <span className="text-haze/85">{rememberHint}</span>
            </label>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
