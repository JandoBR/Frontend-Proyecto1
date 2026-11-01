import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { MediaFilter } from "../api/nasa";
import { DECADES, parseMediaFilter, THEMES, type Decade } from "../data/filters";

export interface FiltersState {
  query: string;
  theme: string | null;
  decade: Decade | null;
  media: MediaFilter;
}

const EXPLORE_DEFAULTS: FiltersState = { query: "", theme: null, decade: null, media: "image" };
const FAVORITES_DEFAULTS: FiltersState = { ...EXPLORE_DEFAULTS, media: "all" };

const EXPLORE_PARAMS = ["q", "tema", "decada", "tipo"];

/**
 * Lee los filtros del explorador desde una query string. Devuelve `null`
 * cuando el enlace no trae ninguno, para no pisar los filtros guardados.
 */
export function parseExploreSearch(search: string): FiltersState | null {
  const params = new URLSearchParams(search);
  if (!EXPLORE_PARAMS.some((key) => params.has(key))) return null;

  return {
    query: params.get("q") ?? "",
    theme: THEMES.find((entry) => entry.id === params.get("tema"))?.keyword ?? null,
    decade: DECADES.find((entry) => entry.id === params.get("decada")) ?? null,
    media: parseMediaFilter(params.get("tipo")),
  };
}

interface FiltersContextValue {
  explore: FiltersState;
  favorites: FiltersState;
  updateExplore: (patch: Partial<FiltersState>) => void;
  updateFavorites: (patch: Partial<FiltersState>) => void;
  resetExplore: () => void;
  resetFavorites: () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

function sameFilters(a: FiltersState, b: FiltersState): boolean {
  return (
    a.query === b.query && a.theme === b.theme && a.decade?.id === b.decade?.id && a.media === b.media
  );
}

/**
 * Los filtros viven por encima de las rutas: navegar a otra vista desmonta la
 * página, pero no los borra. El explorador sigue reflejándolos en la URL.
 */
export function FiltersProvider({ children }: { children: ReactNode }) {
  const [explore, setExplore] = useState<FiltersState>(
    () => parseExploreSearch(window.location.search) ?? EXPLORE_DEFAULTS,
  );
  const [favorites, setFavorites] = useState<FiltersState>(FAVORITES_DEFAULTS);

  const updateExplore = useCallback((patch: Partial<FiltersState>) => {
    setExplore((previous) => {
      const next = { ...previous, ...patch };
      return sameFilters(previous, next) ? previous : next;
    });
  }, []);

  const updateFavorites = useCallback((patch: Partial<FiltersState>) => {
    setFavorites((previous) => {
      const next = { ...previous, ...patch };
      return sameFilters(previous, next) ? previous : next;
    });
  }, []);

  const resetExplore = useCallback(() => setExplore(EXPLORE_DEFAULTS), []);
  const resetFavorites = useCallback(() => setFavorites(FAVORITES_DEFAULTS), []);

  const value = useMemo(
    () => ({ explore, favorites, updateExplore, updateFavorites, resetExplore, resetFavorites }),
    [explore, favorites, updateExplore, updateFavorites, resetExplore, resetFavorites],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const value = useContext(FiltersContext);
  if (!value) throw new Error("useFilters debe usarse dentro de <FiltersProvider>.");
  return value;
}
