import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import type { NasaItem } from "../api/nasa";

interface ItemsCacheValue {
  get: (id: string) => NasaItem | undefined;
  setMany: (items: NasaItem[]) => void;
}

const ItemsCacheContext = createContext<ItemsCacheValue | null>(null);

/**
 * Fichas ya conocidas por id, en memoria. Al abrir un detalle se usa la copia
 * y no se repite la petición; el explorador alimenta la caché con sus
 * resultados, así el primer clic desde una tarjeta tampoco consulta.
 */
export function ItemsCacheProvider({ children }: { children: ReactNode }) {
  const items = useRef(new Map<string, NasaItem>());

  const get = useCallback((id: string) => items.current.get(id), []);

  const setMany = useCallback((next: NasaItem[]) => {
    for (const item of next) items.current.set(item.id, item);
  }, []);

  const value = useMemo(() => ({ get, setMany }), [get, setMany]);

  return <ItemsCacheContext.Provider value={value}>{children}</ItemsCacheContext.Provider>;
}

export function useItemsCache(): ItemsCacheValue {
  const value = useContext(ItemsCacheContext);
  if (!value) throw new Error("useItemsCache debe usarse dentro de <ItemsCacheProvider>.");
  return value;
}
