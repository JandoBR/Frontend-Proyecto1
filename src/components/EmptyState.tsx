import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: "search" | "star" | "orbit";
}

function EmptyIcon({ icon }: { icon: NonNullable<EmptyStateProps["icon"]> }) {
  if (icon === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-7">
        <path
          d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8L12 3.6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "orbit") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-7">
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.4" transform="rotate(-25 12 12)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-7">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, description, action, icon = "search" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-line bg-panel/70 text-haze">
        <EmptyIcon icon={icon} />
      </span>

      <div className="max-w-md">
        <h2 className="font-display text-lg font-semibold text-star">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-haze">{description}</p>
      </div>

      {action}
    </div>
  );
}
