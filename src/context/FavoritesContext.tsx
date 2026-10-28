import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NasaItem } from "../api/nasa";

const STORAGE_KEY = "orbita:favoritos:v1";

interface FavoritesValue {
  favorites: NasaItem[];
  count: number;
  isFavorite: (id: string) => boolean;
  add: (item: NasaItem) => void;
  remove: (id: string) => void;
  toggle: (item: NasaItem) => void;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

function readStoredFavorites(): NasaItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is NasaItem =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as NasaItem).id === "string" &&
        typeof (entry as NasaItem).title === "string",
    );
  } catch {
    return [];
  }
}

/**
 * Los favoritos viven aquí, por encima de las rutas, para que sobrevivan
 * a la navegación. Además se guardan en localStorage: recargar la página
 * no los borra.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<NasaItem[]>(readStoredFavorites);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Si el navegador bloquea el almacenamiento, los favoritos siguen en memoria.
    }
  }, [favorites]);

  const add = useCallback((item: NasaItem) => {
    setFavorites((prev) => (prev.some((entry) => entry.id === item.id) ? prev : [item, ...prev]));
  }, []);

  const remove = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const toggle = useCallback((item: NasaItem) => {
    setFavorites((prev) =>
      prev.some((entry) => entry.id === item.id)
        ? prev.filter((entry) => entry.id !== item.id)
        : [item, ...prev],
    );
  }, []);

  const clear = useCallback(() => setFavorites([]), []);

  const value = useMemo<FavoritesValue>(
    () => ({
      favorites,
      count: favorites.length,
      isFavorite: (id) => favorites.some((entry) => entry.id === id),
      add,
      remove,
      toggle,
      clear,
    }),
    [favorites, add, remove, toggle, clear],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  return context;
}
