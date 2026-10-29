import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRandomItem, searchItems, type NasaItem } from "../api/nasa";
import { ImageCard } from "../components/ImageCard";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ErrorState } from "../components/ErrorState";
import { THEMES, yearOf } from "../data/filters";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../context/ToastContext";

export function HomePage() {
  useDocumentTitle();
  const navigate = useNavigate();
  const toast = useToast();

  const [hero, setHero] = useState<NasaItem | null>(null);
  const [strip, setStrip] = useState<NasaItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [attempt, setAttempt] = useState(0);
  const [isRandomizing, setIsRandomizing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    Promise.all([
      searchItems({ q: "Carina Nebula", mediaType: "image", pageSize: 1 }, controller.signal),
      searchItems({ q: "nebula", mediaType: "image", pageSize: 4 }, controller.signal),
    ])
      .then(([heroResult, list]) => {
        if (controller.signal.aborted) return;
        const heroItem = heroResult.items[0] ?? null;
        setHero(heroItem);
        setStrip(list.items);
        setStatus(heroItem || list.items.length > 0 ? "success" : "error");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  async function handleRandom() {
    if (isRandomizing) return;
    setIsRandomizing(true);
    try {
      const item = await getRandomItem({ mediaType: "image" });
      if (!item) {
        toast.info("No encontramos nada al azar", "Prueba de nuevo en unos segundos.");
        return;
      }
      toast.info(`Del archivo: «${item.title}»`, item.date ? `Año ${yearOf(item.date)}` : undefined);
      navigate(`/explorar/${item.id}`);
    } catch (error) {
      toast.error(
        "No pudimos traer una imagen",
        error instanceof Error ? error.message : "Intenta otra vez.",
      );
    } finally {
      setIsRandomizing(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70">
        {hero?.preview ? (
          <img
            src={hero.preview}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            loading="eager"
            decoding="async"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/85 to-void" />
        <div aria-hidden="true" className="starfield absolute inset-0 opacity-30" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="eyebrow">Archivo público de la NASA</p>

          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-star sm:text-5xl lg:text-6xl">
            El universo, a un clic.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-haze sm:text-lg">
            Miles de imágenes, videos y audios del archivo de la NASA, con búsqueda real y filtros
            por misión, década y formato. Guarda lo que te guste y vuelve cuando quieras.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explorar" className="btn-primary px-5 py-3 text-base">
              Explorar el archivo
            </Link>
            <button
              type="button"
              onClick={handleRandom}
              disabled={isRandomizing}
              aria-busy={isRandomizing}
              className="btn-ghost px-5 py-3 text-base"
            >
              {isRandomizing ? "Buscando…" : "Sorpréndeme"}
            </button>
          </div>

          {status === "success" && hero ? (
            <p className="mt-10 max-w-xl text-xs text-haze/80">
              Imagen destacada:{" "}
              <Link to={`/explorar/${hero.id}`} className="text-haze underline decoration-line underline-offset-4 hover:text-flare">
                {hero.title}
              </Link>
              {hero.date ? ` · ${yearOf(hero.date)}` : null}
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="temas-titulo" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Temas</p>
            <h2 id="temas-titulo" className="mt-2 font-display text-2xl font-semibold text-star sm:text-3xl">
              Elige una misión
            </h2>
          </div>
          <Link to="/explorar" className="text-sm text-haze underline decoration-line underline-offset-4 hover:text-flare">
            Ver todo el archivo
          </Link>
        </div>

        <ul role="list" className="mt-6 flex list-none flex-wrap gap-2">
          {THEMES.map((theme) => (
            <li key={theme.id}>
              <Link to={`/explorar?tema=${theme.id}`} className="chip">
                {theme.label}
                <span aria-hidden="true" className="text-haze/50">
                  ·
                </span>
                <span className="text-xs text-haze/80">{theme.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="archivo-titulo" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Recién llegado</p>
            <h2 id="archivo-titulo" className="mt-2 font-display text-2xl font-semibold text-star sm:text-3xl">
              Del archivo
            </h2>
          </div>
          <Link to="/explorar?q=Carina%20Nebula" className="text-sm text-haze underline decoration-line underline-offset-4 hover:text-flare">
            Más de Carina
          </Link>
        </div>

        <div className="mt-6">
          {status === "loading" ? (
            <ul role="list" className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  className="h-64 animate-pulse rounded-2xl border border-line/70 bg-panel/60"
                />
              ))}
            </ul>
          ) : null}

          {status === "error" ? (
            <ErrorState
              title="No pudimos cargar las imágenes destacadas"
              message="El archivo de la NASA no respondió. Puedes reintentar o ir directo al explorador."
              onRetry={() => setAttempt((value) => value + 1)}
            />
          ) : null}

          {status === "success" && strip.length > 0 ? (
            <ErrorBoundary
              compact
              resetKey={strip.map((item) => item.id).join("|")}
              title="No pudimos dibujar estas imágenes"
              description="Puedes seguir usando el explorador."
            >
              <ul role="list" className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {strip.map((item) => (
                  <li key={item.id} className="animate-rise">
                    <ImageCard item={item} showFavorite={false} />
                  </li>
                ))}
              </ul>
            </ErrorBoundary>
          ) : null}
        </div>
      </section>

      <section className="border-t border-line/70 bg-ink/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-star">¿Sin rumbo?</h2>
            <p className="mt-1.5 max-w-md text-sm text-haze">
              Deja que el archivo elija por ti: una imagen real al azar, de cualquier misión y
              cualquier año.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRandom}
            disabled={isRandomizing}
            aria-busy={isRandomizing}
            className="btn-primary px-5 py-3"
          >
            {isRandomizing ? "Buscando…" : "Sorpréndeme"}
          </button>
        </div>
      </section>
    </>
  );
}
