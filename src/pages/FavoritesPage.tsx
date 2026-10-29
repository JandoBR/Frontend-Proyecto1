import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MediaFilter, NasaItem } from "../api/nasa";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DarkPatternDialog } from "../components/DarkPatternDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FilterBar } from "../components/FilterBar";
import { ImageGrid } from "../components/ImageGrid";
import { SearchBar } from "../components/SearchBar";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { DECADES, yearOf, type Decade } from "../data/filters";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SKIP_KEY = "orbita:recordar-vaciado:v1";

function readSkipPreference(): boolean {
  try {
    return window.localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function FavoritesPage() {
  useDocumentTitle("Favoritos");
  const { favorites, count, isFavorite, remove, clear } = useFavorites();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [decade, setDecade] = useState<Decade | null>(null);
  const [media, setMedia] = useState<MediaFilter>("all");

  const [removing, setRemoving] = useState<NasaItem | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [skipNextClear, setSkipNextClear] = useState(readSkipPreference);

  const hasActiveFilters = Boolean(query.trim() || theme || decade || media !== "all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return favorites.filter((item) => {
      if (media !== "all" && item.mediaType !== media) return false;

      if (decade) {
        const year = Number(yearOf(item.date));
        if (!Number.isFinite(year) || year < decade.start || year > decade.end) return false;
      }

      const meta = `${item.title} ${item.keywords.join(" ")}`.toLowerCase();
      if (theme && !meta.includes(theme.toLowerCase())) return false;

      if (needle && !`${meta} ${item.description}`.toLowerCase().includes(needle)) return false;

      return true;
    });
  }, [favorites, query, theme, decade, media]);

  function handleClearFilters() {
    setQuery("");
    setTheme(null);
    setDecade(null);
    setMedia("all");
  }

  function handleRequestClear() {
    // Si el usuario aceptó la opción preseleccionada del dark pattern, se borra sin preguntar.
    if (skipNextClear) {
      clear();
      toast.info("Vaciamos tus favoritos", "La próxima vez será automático.");
      return;
    }
    setClearOpen(true);
  }

  function handleConfirmClear(rememberChoice: boolean) {
    setClearOpen(false);

    if (rememberChoice) {
      try {
        window.localStorage.setItem(SKIP_KEY, "1");
      } catch {
        // Sin almacenamiento disponible, la preferencia vive solo en memoria.
      }
      setSkipNextClear(true);
    }

    clear();
    handleClearFilters();
    toast.info("Vaciamos tus favoritos", rememberChoice ? "La próxima vez será automático." : undefined);
  }

  function handleToggleFavorite(item: NasaItem) {
    if (isFavorite(item.id)) setRemoving(item);
  }

  function handleConfirmRemove() {
    if (!removing) return;
    remove(removing.id);
    toast.info(`Quitamos «${removing.title}» de favoritos`);
    setRemoving(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Favoritos</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-star sm:text-4xl">
            Tu colección
          </h1>
          <p className="mt-2 text-sm text-haze">
            {count === 0
              ? "Todavía no guardaste nada."
              : `${count} ${count === 1 ? "pieza guardada" : "piezas guardadas"} en este navegador.`}
          </p>
        </div>

        {count > 0 ? (
          <button
            type="button"
            onClick={handleRequestClear}
            className="text-xs text-haze underline decoration-line underline-offset-4 transition-colors hover:text-rose-300"
          >
            Vaciar favoritos
          </button>
        ) : null}
      </header>

      {count > 0 ? (
        <div className="mt-8 space-y-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            label="Buscar en tus favoritos"
            placeholder="Buscar en tu colección…"
          />
          <FilterBar
            theme={theme}
            onThemeChange={setTheme}
            decade={decade}
            onDecadeChange={(id) => setDecade(DECADES.find((entry) => entry.id === id) ?? null)}
            media={media}
            onMediaChange={setMedia}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            includeAllMedia
          />
        </div>
      ) : null}

      <div className="mt-8">
        {count === 0 ? (
          <EmptyState
            icon="star"
            title="No tienes favoritos guardados"
            description="Ve al explorador y toca la estrella en cualquier pieza: queda guardada aquí y sobrevive a la navegación."
            action={
              <Link to="/explorar" className="btn-primary">
                Explorar y agregar alguno
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="search"
            title="Ningún favorito coincide"
            description="Tu colección no tiene nada con estos filtros. Prueba con otra palabra o quítalos."
            action={
              <button type="button" onClick={handleClearFilters} className="btn-ghost">
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <>
            <p aria-live="polite" className="mb-4 text-xs text-haze">
              {visible.length} de {count} {count === 1 ? "pieza" : "piezas"}
            </p>
            <ErrorBoundary
              compact
              resetKey={`${visible.length}|${query}|${theme}|${decade?.id}|${media}`}
              title="No pudimos dibujar tu colección"
              description="Los favoritos siguen guardados. Reintenta o limpia los filtros."
            >
              <ImageGrid
                items={visible}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </ErrorBoundary>
          </>
        )}
      </div>

      <ConfirmDialog
        open={removing !== null}
        title="¿Quitar de favoritos?"
        description={removing ? `«${removing.title}» va a desaparecer de tu colección.` : ""}
        confirmLabel="Sí, quitar"
        cancelLabel="Dejarlo ahí"
        tone="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoving(null)}
      />

      <DarkPatternDialog
        open={clearOpen}
        title="¿Vaciar toda tu colección?"
        description={`Vas a borrar ${count} ${count === 1 ? "pieza" : "piezas"} de una sola vez. No se puede deshacer.`}
        confirmLabel="Sí, vaciar todo"
        onConfirm={handleConfirmClear}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  );
}
