import type { NasaItem } from "../api/nasa";
import { ImageCard } from "./ImageCard";

interface ImageGridProps {
  items: NasaItem[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite?: (item: NasaItem) => void;
  showFavorites?: boolean;
}

export function ImageGrid({ items, isFavorite, onToggleFavorite, showFavorites = true }: ImageGridProps) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="animate-rise">
          <ImageCard
            item={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={onToggleFavorite}
            showFavorite={showFavorites}
          />
        </li>
      ))}
    </ul>
  );
}
