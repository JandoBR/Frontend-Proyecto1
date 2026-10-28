interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export function LoadingState({ message = "Buscando en el archivo…", compact = false }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-haze ${compact ? "py-8" : "py-20"}`}
    >
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-flare" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
