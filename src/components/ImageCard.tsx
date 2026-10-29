import { Link } from "react-router-dom";
import type { NasaItem } from "../api/nasa";
import { MEDIA_LABELS, centerLabel, yearOf } from "../data/filters";
import { AudioArtwork } from "./AudioArtwork";
import { FavoriteButton } from "./FavoriteButton";

interface ImageCardProps {
  item: NasaItem;
  isFavorite?: boolean;
  onToggleFavorite?: (item: NasaItem) => void;
  showFavorite?: boolean;
}

function ThumbPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-ink text-haze">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-8">
        <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="9" cy="10" r="1.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="m5 17 4.2-4.2 3.1 3.1 2.4-2.4L19 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ImageCard({ item, isFavorite = false, onToggleFavorite, showFavorite = true }: ImageCardProps) {
  const year = yearOf(item.date);
  const center = centerLabel(item.center);
  const meta = [center, year].filter(Boolean).join(" · ");

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-panel/70 transition-colors hover:border-flare/40">
      <Link
        to={`/explorar/${item.id}`}
        aria-label={`Ver detalle de «${item.title}»`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink"
      >
        {item.mediaType === "audio" ? (
          <AudioArtwork seed={item.id} className="h-full w-full" />
        ) : item.thumb ? (
          <img
            src={item.thumb}
            alt={item.title}
            width={640}
            height={480}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ThumbPlaceholder />
        )}

        <span className="absolute top-3 left-3 rounded-md bg-void/80 px-2 py-0.5 text-[11px] font-medium tracking-wide text-star backdrop-blur">
          {MEDIA_LABELS[item.mediaType]}
        </span>

        {item.mediaType === "video" ? (
          <span
            aria-hidden="true"
            className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-void/75 text-star backdrop-blur"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
        ) : null}
      </Link>

      {showFavorite && onToggleFavorite ? (
        <FavoriteButton
          active={isFavorite}
          label={item.title}
          onToggle={() => onToggleFavorite(item)}
          className="absolute top-2.5 right-2.5"
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3
          className="font-display text-[15px] leading-snug font-semibold break-words text-star line-clamp-2"
          title={item.title}
        >
          <Link to={`/explorar/${item.id}`} className="hover:text-flare">
            {item.title}
          </Link>
        </h3>
        {meta ? <p className="text-xs text-haze">{meta}</p> : null}
      </div>
    </article>
  );
}
