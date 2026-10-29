import type { Decade, Theme } from "../data/filters";
import { ALL_MEDIA_FILTER, DECADES, MEDIA_FILTERS, THEMES } from "../data/filters";
import type { MediaFilter } from "../api/nasa";

interface FilterBarProps {
  theme: string | null;
  onThemeChange: (keyword: string | null) => void;
  decade: Decade | null;
  onDecadeChange: (id: string) => void;
  media: MediaFilter;
  onMediaChange: (media: MediaFilter) => void;
  onClear: () => void;
  onRandom?: () => void;
  isRandomizing?: boolean;
  hasActiveFilters: boolean;
  /** Muestra además la opción "Todo" (útil sobre colecciones locales, no sobre la API). */
  includeAllMedia?: boolean;
}

export function FilterBar({
  theme,
  onThemeChange,
  decade,
  onDecadeChange,
  media,
  onMediaChange,
  onClear,
  onRandom,
  isRandomizing = false,
  hasActiveFilters,
  includeAllMedia = false,
}: FilterBarProps) {
  const mediaFilters = includeAllMedia ? [ALL_MEDIA_FILTER, ...MEDIA_FILTERS] : MEDIA_FILTERS;

  return (
    <section aria-labelledby="filtros-titulo" className="rounded-2xl border border-line/80 bg-panel/50 p-4 sm:p-5">
      <h2 id="filtros-titulo" className="sr-only">
        Filtros
      </h2>

      <div role="group" aria-label="Filtrar por misión o tema" className="flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1 hidden sm:inline">Temas</span>

        <button
          type="button"
          onClick={() => onThemeChange(null)}
          aria-pressed={theme === null}
          className={`chip ${theme === null ? "chip-active" : ""}`}
        >
          Todos
        </button>

        {THEMES.map((item: Theme) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onThemeChange(item.keyword)}
            aria-pressed={theme === item.keyword}
            title={item.blurb}
            className={`chip ${theme === item.keyword ? "chip-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-line/60 pt-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="filtro-decada" className="text-xs font-medium tracking-wide text-haze uppercase">
            Década
          </label>
          <select
            id="filtro-decada"
            value={decade?.id ?? ""}
            onChange={(event) => onDecadeChange(event.target.value)}
            className="field w-auto py-2 pr-8 text-sm"
          >
            <option value="">Todas</option>
            {DECADES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div
          role="group"
          aria-label="Filtrar por tipo de contenido"
          className="inline-flex gap-1 self-start rounded-xl border border-line bg-ink/60 p-1 sm:self-auto"
        >
          {mediaFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onMediaChange(filter.id)}
              aria-pressed={media === filter.id}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                media === filter.id ? "bg-flare text-void" : "text-haze hover:text-star"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="self-start rounded-lg px-2 py-1.5 text-xs text-haze underline decoration-line underline-offset-4 transition-colors hover:text-star sm:self-auto"
          >
            Limpiar filtros
          </button>
        ) : null}

        {onRandom ? (
          <button
            type="button"
            onClick={onRandom}
            disabled={isRandomizing}
            className="btn-ghost self-start text-xs sm:ml-auto sm:self-auto"
            aria-busy={isRandomizing}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
              <path
                d="M4 4h3l6 12h3M4 16h3l2-4M13 4h3M14.5 2.5 17 4l-2.5 1.5M14.5 14.5 17 16l-2.5 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isRandomizing ? "Buscando…" : "Sorpréndeme"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
