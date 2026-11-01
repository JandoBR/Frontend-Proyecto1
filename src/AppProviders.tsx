import type { ReactNode } from "react";
import { FavoritesProvider } from "./context/FavoritesContext";
import { FiltersProvider } from "./context/FiltersContext";
import { ExploreResultsProvider } from "./context/ExploreResultsContext";
import { ItemsCacheProvider } from "./context/ItemsCacheContext";
import { ToastProvider } from "./context/ToastContext";

/**
 * Estado compartido por encima de las rutas. Vive en un solo sitio para que
 * `App` se lea como "router + rutas" y el orden de anidado no se reparta.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FiltersProvider>
      <ItemsCacheProvider>
        <ExploreResultsProvider>
          <FavoritesProvider>
            <ToastProvider>{children}</ToastProvider>
          </FavoritesProvider>
        </ExploreResultsProvider>
      </ItemsCacheProvider>
    </FiltersProvider>
  );
}
