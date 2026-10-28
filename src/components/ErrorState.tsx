interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "No pudimos cargar la información",
  message,
  onRetry,
  retryLabel = "Reintentar",
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-300">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
          <path d="M12 4 2.8 20h18.4L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="12" cy="17.4" r="1" fill="currentColor" />
        </svg>
      </span>

      <div className="max-w-md">
        <h2 className="font-display text-lg font-semibold text-star">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-haze">{message}</p>
      </div>

      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-primary">
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
