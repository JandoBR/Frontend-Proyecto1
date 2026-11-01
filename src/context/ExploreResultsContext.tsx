import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { NasaItem } from "../api/nasa";

export interface ExploreSnapshot {
  key: string;
  items: NasaItem[];
  total: number;
  page: number;
}

interface ExploreResultsValue {
  snapshot: ExploreSnapshot | null;
  save: (snapshot: ExploreSnapshot) => void;
  /** Última posición de scroll del explorador; se escribe sin re-renderizar. */
  scrollY: RefObject<number>;
}

const ExploreResultsContext = createContext<ExploreResultsValue | null>(null);

/**
 * Guarda la última búsqueda del explorador en memoria: al volver desde otra
 * vista se renderiza al instante, sin repetir la petición, y se conservan las
 * páginas cargadas con scroll infinito.
 */
export function ExploreResultsProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ExploreSnapshot | null>(null);
  const scrollY = useRef(0);

  const save = useCallback((next: ExploreSnapshot) => {
    setSnapshot((previous) =>
      previous &&
      previous.key === next.key &&
      previous.page === next.page &&
      previous.total === next.total &&
      previous.items === next.items
        ? previous
        : next,
    );
  }, []);

  const value = useMemo(() => ({ snapshot, save, scrollY }), [snapshot, save]);

  return <ExploreResultsContext.Provider value={value}>{children}</ExploreResultsContext.Provider>;
}

export function useExploreResults(): ExploreResultsValue {
  const value = useContext(ExploreResultsContext);
  if (!value) throw new Error("useExploreResults debe usarse dentro de <ExploreResultsProvider>.");
  return value;
}
