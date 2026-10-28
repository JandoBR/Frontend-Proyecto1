import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getItemById, type NasaItem } from "../api/nasa";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FavoriteButton } from "../components/FavoriteButton";
import { LoadingState } from "../components/LoadingState";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../context/ToastContext";
import { MEDIA_LABELS, centerLabel, yearOf } from "../data/filters";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

type Status = "loading" | "success" | "error" | "notfound";

function formatDate(value: string): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { isFavorite, add, remove } = useFavorites();

  const [item, setItem] = useState<NasaItem | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useDocumentTitle(item?.title ?? "Detalle");

  useEffect(() => {
    if (!id) {
      setStatus("notfound");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);
    setExpanded(false);

    getItemById(id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result) {
          setStatus("notfound");
          return;
        }
        setItem(result);
        setStatus("success");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Ocurrió un error inesperado.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [id, attempt]);

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <LoadingState message="Abriendo la ficha en el archivo…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <ErrorState
          message={error ?? "El archivo de la NASA no respondió."}
          onRetry={() => setAttempt((value) => value + 1)}
        />
        <div className="mt-6 text-center">
          <Link to="/explorar" className="text-sm text-haze underline underline-offset-4 hover:text-flare">
            Volver al explorador
          </Link>
        </div>
      </div>
    );
  }

  if (status === "notfound" || !item) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <EmptyState
          icon="orbit"
          title="Ese elemento no está en el archivo"
          description="El enlace puede estar mal escrito o la pieza ya no está publicada. Prueba desde el explorador."
          action={
            <Link to="/explorar" className="btn-primary">
              Ir al explorador
            </Link>
          }
        />
      </div>
    );
  }

  const favorite = isFavorite(item.id);
  const image = item.preview ?? item.original ?? item.thumb;
  const center = centerLabel(item.center);
  const nasaUrl = `https://images.nasa.gov/details-${item.id}`;
  const isMediaOnly = item.mediaType !== "image";

  function handleFavorite() {
    if (!item) return;
    if (favorite) {
      setConfirmRemove(true);
      return;
    }
    add(item);
    toast.success(`«${item.title}» está en favoritos`, "Puedes verlo en la página de favoritos.");
  }

  function handleConfirmRemove() {
    if (!item) return;
    remove(item.id);
    toast.info(`Quitamos «${item.title}» de favoritos`);
    setConfirmRemove(false);
  }

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Miga de pan" className="mb-6">
        <ol className="flex list-none flex-wrap items-center gap-2 text-xs text-haze">
          <li>
            <Link to="/" className="hover:text-flare">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/explorar" className="hover:text-flare">
              Explorar
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="max-w-[40ch] truncate text-star">
            {item.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
        <figure className="m-0">
          <div className="overflow-hidden rounded-2xl border border-line/80 bg-ink">
            {image ? (
              <img
                src={image}
                alt={item.title}
                className="max-h-[70vh] w-full object-contain"
                decoding="async"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-sm text-haze">
                Sin imagen disponible
              </div>
            )}
          </div>

          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-haze">
            <span>
              {item.credit ? <>Crédito: {item.credit}</> : "Crédito en el archivo de la NASA"}
            </span>
            {item.original ? (
              <a
                href={item.original}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-line underline-offset-4 hover:text-flare"
              >
                Ver original ↗
              </a>
            ) : null}
          </figcaption>
        </figure>

        <div>
          <p className="eyebrow">
            {MEDIA_LABELS[item.mediaType]}
            {yearOf(item.date) ? ` · ${yearOf(item.date)}` : ""}
          </p>

          <h1 className="mt-2 font-display text-2xl leading-tight font-semibold tracking-tight break-words text-star sm:text-3xl">
            {item.title}
          </h1>

          {item.description ? (
            <div className="mt-4">
              <p id="descripcion" className={`text-sm leading-relaxed text-haze ${expanded ? "" : "line-clamp-6"}`}>
                {item.description}
              </p>
              {item.description.length > 320 ? (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  aria-controls="descripcion"
                  className="mt-2 text-xs text-flare underline decoration-flare/40 underline-offset-4 hover:decoration-flare"
                >
                  {expanded ? "Leer menos" : "Leer más"}
                </button>
              ) : null}
            </div>
          ) : null}

          {isMediaOnly ? (
            <p role="note" className="mt-4 rounded-xl border border-line/70 bg-panel/60 p-3 text-xs leading-relaxed text-haze">
              Esta pieza es un {MEDIA_LABELS[item.mediaType].toLowerCase()}. Mostramos su imagen de
              referencia; el archivo original está en NASA.
            </p>
          ) : null}

          <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-line/70 pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-haze uppercase">Fecha</dt>
              <dd className="mt-1 text-star">{formatDate(item.date)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-haze uppercase">Centro</dt>
              <dd className="mt-1 text-star">{center ?? "No informado"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-haze uppercase">Formato</dt>
              <dd className="mt-1 text-star">{MEDIA_LABELS[item.mediaType]}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-haze uppercase">ID del archivo</dt>
              <dd className="mt-1 font-mono text-xs break-all text-haze">{item.id}</dd>
            </div>
          </dl>

          {item.keywords.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-[11px] font-medium tracking-wide text-haze uppercase">
                Palabras clave
              </h2>
              <ul className="mt-2 flex list-none flex-wrap gap-2">
                {item.keywords.map((keyword) => (
                  <li key={keyword}>
                    <Link to={`/explorar?q=${encodeURIComponent(keyword)}`} className="chip py-1 text-xs">
                      {keyword}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <FavoriteButton
              variant="full"
              active={favorite}
              label={item.title}
              onToggle={handleFavorite}
            />
            <a
              href={nasaUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-haze underline decoration-line underline-offset-4 hover:text-flare"
            >
              Ver en el archivo de la NASA ↗
            </a>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="¿Quitar de favoritos?"
        description={`«${item.title}» va a desaparecer de tu lista guardada.`}
        confirmLabel="Sí, quitar"
        cancelLabel="Dejarlo ahí"
        tone="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </article>
  );
}
