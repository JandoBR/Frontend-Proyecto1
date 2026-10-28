import { useEffect, useId, useRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmación con <dialog> nativo.
 * `showModal()` es lo que le da comportamiento de modal (foco atrapado,
 * Escape, backdrop) sin librerías. El foco arranca en "Cancelar": la opción
 * segura. Escape también cancela, manejado en el evento `cancel` del dialog.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
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
      <div className="p-6">
        <h2 id={titleId} className="font-display text-lg font-semibold text-star">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-haze">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={onCancel} className="btn-ghost">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={tone === "danger" ? "btn-danger" : "btn-primary"}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
