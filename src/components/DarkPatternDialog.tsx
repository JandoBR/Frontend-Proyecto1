import { useEffect, useId, useRef, useState } from "react";

/*
 * ⚠️ DARK PATTERN INTENCIONAL — requisito de la consigna.
 *
 * Este diálogo (y solo este, para vaciar todos los favoritos) aplica tres
 * tácticas de manipulación a propósito:
 *
 *  1. Confirmshaming: la salida se redacta como una preferencia vergonzante
 *     ("No, prefiero conservar mis favoritos") y se dibuja como un enlace gris
 *     minúsculo, mientras la acción destructiva es un botón rojo dominante.
 *  2. Opción destructiva preseleccionada: "No volver a preguntar" viene
 *     marcada, de modo que la próxima vez el borrado ocurre sin confirmación.
 *     La fricción desaparece justo cuando más se necesita.
 *  3. Asimetría de jerarquía y área de toque: cancelar no es un botón, no tiene
 *     relleno ni contraste equivalente, así que el pulgar y la mirada caen en
 *     "Sí, vaciar todo".
 *
 * Esto NO representa lo que recomendaríamos como UX: en un producto real la
 * opción segura va primero, con el mismo peso visual, y nunca se preselecciona
 * una preferencia destructiva. Está aislado a esta acción para poder señalarlo
 * y explicarlo en la defensa del proyecto.
 */

interface DarkPatternDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (rememberChoice: boolean) => void;
  onCancel: () => void;
}

export function DarkPatternDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
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
      // Cada apertura vuelve al estado preseleccionado (táctica 2).
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
          aria-label="Cerrar sin vaciar favoritos"
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

        <button type="button" onClick={() => onConfirm(rememberChoice)} className="btn-danger mt-5 w-full">
          {confirmLabel}
        </button>

        {/* Táctica 1: la opción segura como enlace pequeño y de bajo contraste. */}
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full py-1 text-center text-xs text-haze/70 underline decoration-line underline-offset-4 transition-colors hover:text-haze"
        >
          No, prefiero conservar mis favoritos
        </button>

        {/* Táctica 2: preferencia destructiva preseleccionada. */}
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-line/60 bg-ink/50 p-2.5">
          <input
            id={rememberId}
            type="checkbox"
            checked={rememberChoice}
            onChange={(event) => setRememberChoice(event.target.checked)}
            className="mt-0.5 size-4 accent-rose-500"
          />
          <label htmlFor={rememberId} className="text-[11px] leading-relaxed text-haze">
            No volver a preguntar <span className="text-haze/60">(recomendado: la próxima vez será automático)</span>
          </label>
        </div>
      </div>
    </dialog>
  );
}
