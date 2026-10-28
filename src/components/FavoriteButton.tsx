interface FavoriteButtonProps {
  active: boolean;
  label: string;
  onToggle: () => void;
  variant?: "icon" | "full";
  className?: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8L12 3.6Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoriteButton({
  active,
  label,
  onToggle,
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const accessibleLabel = active
    ? `Quitar «${label}» de favoritos`
    : `Agregar «${label}» a favoritos`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        aria-label={accessibleLabel}
        className={`btn ${active ? "border border-flare/60 bg-flare/10 text-flare" : "bg-flare text-void hover:bg-flare/85"} ${className}`}
      >
        <StarIcon filled={active} />
        {active ? "En favoritos" : "Agregar a favoritos"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={accessibleLabel}
      title={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`grid size-9 place-items-center rounded-full border backdrop-blur transition-colors ${
        active
          ? "border-flare/60 bg-flare/20 text-flare"
          : "border-line/80 bg-void/60 text-haze hover:border-flare/60 hover:text-flare"
      } ${className}`}
    >
      <StarIcon filled={active} />
    </button>
  );
}
