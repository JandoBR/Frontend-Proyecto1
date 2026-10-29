import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 600;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleClick() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={`fixed right-4 bottom-24 z-40 grid size-11 place-items-center rounded-full border border-line bg-panel/90 text-star shadow-xl shadow-black/40 backdrop-blur transition-all duration-300 hover:border-flare/60 hover:text-flare sm:right-6 ${
        visible ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
        <path
          d="M10 15V5M5.5 9.5 10 5l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
