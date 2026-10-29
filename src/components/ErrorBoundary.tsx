import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  description?: string;
  compact?: boolean;
  /** Al cambiar este valor se limpia el error (por ejemplo, al cambiar de ruta o de filtros). */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Los errores de render no se pueden atrapar con try/catch en funciones:
 * React solo los entrega a un límite de clase. Los fallos de fetch ya se
 * manejan con sus propios estados; esto cubre lo inesperado.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error de render:", error, info.componentStack);
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const {
      title = "Algo se rompió acá",
      description = "El resto del sitio sigue funcionando. Puedes reintentar o volver al inicio.",
      compact = false,
    } = this.props;

    return (
      <div
        role="alert"
        className={
          compact
            ? "flex flex-col items-center rounded-2xl border border-rose-400/30 bg-rose-500/5 p-6 text-center"
            : "mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center"
        }
      >
        <span className="grid size-11 place-items-center rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-300">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
            <path d="M12 4 2.8 20h18.4L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="17.4" r="1" fill="currentColor" />
          </svg>
        </span>

        <h2 className={`font-display font-semibold text-star ${compact ? "mt-3 text-base" : "mt-4 text-xl"}`}>
          {title}
        </h2>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-haze">{description}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={this.reset} className="btn-primary">
            Reintentar
          </button>
          <a href="/" className="btn-ghost">
            Ir al inicio
          </a>
        </div>

        {import.meta.env.DEV ? (
          <pre className="mt-4 max-w-full overflow-auto rounded-lg border border-line/70 bg-ink/60 p-3 text-left text-[11px] text-rose-200">
            {error.message}
          </pre>
        ) : null}
      </div>
    );
  }
}
