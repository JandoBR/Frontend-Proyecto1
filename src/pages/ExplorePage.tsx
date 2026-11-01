import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  getRandomItem,
  MAX_RESULTS,
  searchItems,
  type MediaFilter,
  type NasaItem,
} from "../api/nasa";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { ImageGrid } from "../components/ImageGrid";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { useFavorites } from "../context/FavoritesContext";
import { parseExploreSearch, useFilters } from "../context/FiltersContext";
import { useToast } from "../context/ToastContext";
import { DECADES, THEMES, yearOf } from "../data/filters";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const PAGE_SIZE = 24;

type Status = "loading" | "success" | "error";

export function ExplorePage() {
  useDocumentTitle("Explorar");

  const [, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isFavorite, add, remove } = useFavorites();
  const { explore, updateExplore, resetExplore } = useFilters();

  const { query, theme, decade, media } = explore;
  const debouncedQuery = useDebouncedValue(query, 400);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NasaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [isRandomizing, setIsRandomizing] = useState(false);
  const [removing, setRemoving] = useState<NasaItem | null>(null);

  const resultsRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingLock = useRef(false);
  const writtenSearch = useRef<string | null>(null);

  function resetResults() {
    setPage(1);
    setItems([]);
    setTotal(0);
    setStatus("loading");
    setError(null);
    if (page !== 1) resultsRef.current?.scrollIntoView({ block: "start" });
  }

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

  // Los enlaces internos con parámetros (`?q=`, `?tema=`, ...) mandan al entrar.
  // Un enlace sin parámetros, en cambio, conserva los filtros guardados.
  useEffect(() => {
    const search = location.search.replace(/^\?/, "");
    if (search === writtenSearch.current) return;

    const fromUrl = parseExploreSearch(search);
    if (fromUrl) updateExplore(fromUrl);
  }, [location.search, updateExplore]);

  // La URL refleja los filtros: se puede compartir el estado y el botón "atrás" funciona.
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQuery.trim()) next.set("q", debouncedQuery.trim());
    const themeEntry = THEMES.find((entry) => entry.keyword === theme);
    if (themeEntry) next.set("tema", themeEntry.id);
    if (decade) next.set("decada", decade.id);
    if (media !== "image") next.set("tipo", media);

    writtenSearch.current = next.toString();
    setSearchParams(next, { replace: true });
  }, [debouncedQuery, theme, decade, media, location.search, setSearchParams]);

  const hasActiveFilters = Boolean(query.trim() || theme || decade || media !== "image");

  function handleQueryChange(value: string) {
    updateExplore({ query: value });
    if (page !== 1) resetResults();
  }

  function handleThemeChange(keyword: string | null) {
    updateExplore({ theme: keyword });
    resetResults();
  }

  function handleDecadeChange(id: string) {
    updateExplore({ decade: DECADES.find((entry) => entry.id === id) ?? null });
    resetResults();
  }

  function handleMediaChange(next: MediaFilter) {
    updateExplore({ media: next });
    resetResults();
  }

  function handleClear() {
    resetExplore();
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
  const canLoadMore = items.length > 0 && items.length < reachable && status === "success";
  const showInitialLoading = status === "loading" && items.length === 0;
  const showInitialError = status === "error" && items.length === 0;
  const showEmpty = status === "success" && items.length === 0;

  useEffect(() => {
    loadingLock.current = status === "loading";
  }, [status]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, items.length]);

  function loadMore() {
    if (loadingLock.current) return;
    loadingLock.current = true;
    setPage((value) => value + 1);
  }

  let summary = "—";
  if (showInitialLoading) summary = "Buscando…";
  else if (status === "success") summary = `${total.toLocaleString("es")} resultados`;

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

      <section
        ref={resultsRef}
        id="resultados"
        aria-labelledby="resultados-titulo"
        aria-busy={status === "loading"}
        className="mt-10 scroll-mt-24"
      >
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
            <ErrorBoundary
              compact
              resetKey={`${debouncedQuery}|${theme}|${decade?.id}|${media}|${page}`}
              title="No pudimos dibujar estos resultados"
              description="La búsqueda sigue disponible. Reintenta o prueba con otros filtros."
            >
              <ImageGrid
                items={items}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </ErrorBoundary>

            <div className="mt-10 flex flex-col items-center gap-3">
              {status === "loading" ? (
                <p className="flex items-center gap-2 text-xs text-haze">
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-line border-t-flare"
                  />
                  Cargando más resultados…
                </p>
              ) : null}

              {canLoadMore ? (
                <>
                  <div ref={sentinelRef} aria-hidden="true" className="h-12 w-full" />
                  <button
                    type="button"
                    onClick={loadMore}
                    className="sr-only focus:not-sr-only focus:rounded-lg focus:border focus:border-flare/60 focus:bg-panel focus:px-4 focus:py-2 focus:text-sm focus:text-star"
                  >
                    Cargar más resultados
                  </button>
                </>
              ) : null}

              {status === "success" && items.length >= reachable && total <= reachable ? (
                <p className="max-w-md text-center text-xs leading-relaxed text-haze">
                  Eso es todo lo que hay para esta búsqueda.
                </p>
              ) : null}

              {total > reachable ? (
                <p className="max-w-md text-center text-xs leading-relaxed text-haze/80">
                  El archivo muestra hasta {MAX_RESULTS.toLocaleString("es")} resultados por
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
