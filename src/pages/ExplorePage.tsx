import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getRandomItem,
  MAX_RESULTS,
  searchItems,
  type MediaFilter,
  type NasaItem,
} from "../api/nasa";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { ImageGrid } from "../components/ImageGrid";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { DECADES, THEMES, yearOf, type Decade } from "../data/filters";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const PAGE_SIZE = 24;

type Status = "loading" | "success" | "error";

function parseMedia(value: string | null): MediaFilter {
  return value === "image" || value === "video" || value === "audio" || value === "all"
    ? value
    : "image";
}

export function ExplorePage() {
  useDocumentTitle("Explorar");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isFavorite, add, remove } = useFavorites();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(query, 400);

  const [theme, setTheme] = useState<string | null>(
    () => THEMES.find((entry) => entry.id === searchParams.get("tema"))?.keyword ?? null,
  );
  const [decade, setDecade] = useState<Decade | null>(
    () => DECADES.find((entry) => entry.id === searchParams.get("decada")) ?? null,
  );
  const [media, setMedia] = useState<MediaFilter>(() => parseMedia(searchParams.get("tipo")));

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NasaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [isRandomizing, setIsRandomizing] = useState(false);
  const [removing, setRemoving] = useState<NasaItem | null>(null);

  const resetResults = useCallback(() => {
    setPage(1);
    setItems([]);
    setTotal(0);
    setStatus("loading");
    setError(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    searchItems(
      {
        q: debouncedQuery,
        keyword: theme ?? undefined,
        yearStart: decade?.start,
        yearEnd: decade?.end,
        mediaType: media,
        page,
        pageSize: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setItems((previous) => (page === 1 ? result.items : [...previous, ...result.items]));
        setTotal(result.total);
        setStatus("success");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [debouncedQuery, theme, decade, media, page, attempt]);

  // La URL refleja los filtros: se puede compartir el estado y el botón "atrás" funciona.
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQuery.trim()) next.set("q", debouncedQuery.trim());
    const themeEntry = THEMES.find((entry) => entry.keyword === theme);
    if (themeEntry) next.set("tema", themeEntry.id);
    if (decade) next.set("decada", decade.id);
    if (media !== "image") next.set("tipo", media);

    setSearchParams(next, { replace: true });
  }, [debouncedQuery, theme, decade, media, setSearchParams]);

  const hasActiveFilters = Boolean(query.trim() || theme || decade || media !== "image");

  function handleQueryChange(value: string) {
    setQuery(value);
    if (page !== 1) resetResults();
  }

  function handleThemeChange(keyword: string | null) {
    setTheme(keyword);
    resetResults();
  }

  function handleDecadeChange(id: string) {
    setDecade(DECADES.find((entry) => entry.id === id) ?? null);
    resetResults();
  }

  function handleMediaChange(next: MediaFilter) {
    setMedia(next);
    resetResults();
  }

  function handleClear() {
    setQuery("");
    setTheme(null);
    setDecade(null);
    setMedia("image");
    resetResults();
  }

  function handleToggleFavorite(item: NasaItem) {
    if (isFavorite(item.id)) {
      setRemoving(item);
      return;
    }
    add(item);
    toast.success(`«${item.title}» está en favoritos`, "Puedes verlo en la página de favoritos.");
  }

  function confirmRemove() {
    if (!removing) return;
    remove(removing.id);
    toast.info(`Quitamos «${removing.title}» de favoritos`);
    setRemoving(null);
  }

  async function handleRandom() {
    if (isRandomizing) return;
    setIsRandomizing(true);
    try {
      const item = await getRandomItem({
        q: debouncedQuery,
        keyword: theme ?? undefined,
        yearStart: decade?.start,
        yearEnd: decade?.end,
        mediaType: media,
      });

      if (!item) {
        toast.info("No hay nada al azar con estos filtros", "Prueba limpiando alguno.");
        return;
      }

      toast.info(`Del archivo: «${item.title}»`, item.date ? `Año ${yearOf(item.date)}` : undefined);
      navigate(`/explorar/${item.id}`);
    } catch (cause) {
      toast.error(
        "No pudimos traer una imagen al azar",
        cause instanceof Error ? cause.message : "Intenta otra vez.",
      );
    } finally {
      setIsRandomizing(false);
    }
  }

  const reachable = Math.min(total, MAX_RESULTS);
  const isSearching = query !== debouncedQuery;
  const showInitialLoading = status === "loading" && items.length === 0;
  const showInitialError = status === "error" && items.length === 0;
  const showEmpty = status === "success" && items.length === 0;

  let summary = "—";
  if (showInitialLoading) summary = "Buscando…";
  else if (status === "success") summary = `${total.toLocaleString("es-AR")} resultados`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header>
        <p className="eyebrow">Explorar</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-star sm:text-4xl">
          El archivo completo
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-haze">
          Busca por texto libre o cruza misión, década y formato. La búsqueda se hace contra la API
          de la NASA, no contra una lista fija.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <SearchBar value={query} onChange={handleQueryChange} isBusy={isSearching} />
        <FilterBar
          theme={theme}
          onThemeChange={handleThemeChange}
          decade={decade}
          onDecadeChange={handleDecadeChange}
          media={media}
          onMediaChange={handleMediaChange}
          onClear={handleClear}
          onRandom={handleRandom}
          isRandomizing={isRandomizing}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <section id="resultados" aria-labelledby="resultados-titulo" aria-busy={status === "loading"} className="mt-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line/60 pb-3">
          <h2 id="resultados-titulo" className="font-display text-lg font-semibold text-star">
            Resultados
          </h2>
          <p aria-live="polite" className="text-xs text-haze">
            {summary}
          </p>
        </div>

        {showInitialLoading ? <LoadingState /> : null}

        {showInitialError ? (
          <ErrorState
            message={error ?? "El archivo de la NASA no respondió."}
            onRetry={() => setAttempt((value) => value + 1)}
          />
        ) : null}

        {showEmpty ? (
          <EmptyState
            title="Ningún resultado por aquí"
            description={
              hasActiveFilters
                ? "Prueba con otra palabra o quita algún filtro: el archivo es grande, pero no infinito."
                : "No hay resultados para esta combinación. Intenta con otro término."
            }
            action={
              hasActiveFilters ? (
                <button type="button" onClick={handleClear} className="btn-ghost">
                  Limpiar filtros
                </button>
              ) : null
            }
          />
        ) : null}

        {items.length > 0 ? (
          <>
            <ImageGrid
              items={items}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            <div className="mt-10 flex flex-col items-center gap-3">
              {items.length < reachable ? (
                <button
                  type="button"
                  onClick={() => setPage((value) => value + 1)}
                  disabled={status === "loading"}
                  className="btn-ghost px-5"
                >
                  {status === "loading"
                    ? "Cargando más…"
                    : `Cargar más (${(reachable - items.length).toLocaleString("es-AR")} restantes)`}
                </button>
              ) : (
                <p className="max-w-md text-center text-xs leading-relaxed text-haze">
                  Eso es todo lo que hay para esta búsqueda.
                </p>
              )}

              {total > reachable ? (
                <p className="max-w-md text-center text-xs leading-relaxed text-haze/80">
                  El archivo muestra hasta {MAX_RESULTS.toLocaleString("es-AR")} resultados por
                  búsqueda. Suma un tema, una década o una palabra para llegar al resto.
                </p>
              ) : null}

              {status === "error" && items.length > 0 ? (
                <p role="alert" className="text-xs text-rose-300">
                  {error}{" "}
                  <button
                    type="button"
                    onClick={() => setAttempt((value) => value + 1)}
                    className="underline underline-offset-4 hover:text-rose-200"
                  >
                    Reintentar
                  </button>
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </section>

      <ConfirmDialog
        open={removing !== null}
        title="¿Quitar de favoritos?"
        description={removing ? `«${removing.title}» va a desaparecer de tu lista guardada.` : ""}
        confirmLabel="Sí, quitar"
        cancelLabel="Dejarlo ahí"
        tone="danger"
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
