interface AudioArtworkProps {
  seed: string;
  className?: string;
}

function hashToHue(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) % 360;
  }
  return value;
}

/**
 * Portada generada para audios: la API no entrega miniatura para este formato,
 * así que armamos una ilustración determinista a partir del ID (mismo audio,
 * misma portada, sin descargar nada).
 */
export function AudioArtwork({ seed, className = "" }: AudioArtworkProps) {
  const hue = hashToHue(seed);
  const bars = Array.from({ length: 11 }, (_, index) => {
    const value = (hashToHue(`${seed}-${index}`) * 7 + index * 13) % 70;
    return 18 + value;
  });

  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 55% 26%), hsl(${(hue + 45) % 360} 60% 9%))`,
      }}
    >
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: `radial-gradient(circle at 28% 22%, hsl(${hue} 90% 72% / 0.4), transparent 58%)`,
        }}
      />

      <div className="relative flex h-1/3 items-end gap-1.5">
        {bars.map((height, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-white/70"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <span className="absolute right-3 bottom-2.5 text-[10px] font-medium tracking-[0.18em] text-white/45 uppercase">
        NASA audio
      </span>
    </div>
  );
}
