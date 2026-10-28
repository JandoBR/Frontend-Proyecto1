import { useEffect } from "react";

/** Mantiene el título del documento sincronizado con la ruta actual. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Órbita` : "Órbita — Archivo visual de la NASA";
  }, [title]);
}
