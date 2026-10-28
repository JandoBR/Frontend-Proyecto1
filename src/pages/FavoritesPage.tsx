import { useState } from "react";
import { Link } from "react-router-dom";
import type { NasaItem } from "../api/nasa";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DarkPatternDialog } from "../components/DarkPatternDialog";
import { EmptyState } from "../components/EmptyState";
import { ImageGrid } from "../components/ImageGrid";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
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

  const [removing, setRemoving] = useState<NasaItem | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [skipNextClear, setSkipNextClear] = useState(readSkipPreference);

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
        ) : (
          <ImageGrid items={favorites} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />
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
