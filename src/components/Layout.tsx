import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { BackToTop } from "./BackToTop";
import { ErrorBoundary } from "./ErrorBoundary";

const NAV_LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/explorar", label: "Explorar", end: false },
  { to: "/favoritos", label: "Favoritos", end: false },
  { to: "/contacto", label: "Contacto", end: false },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8">
        <circle cx="16" cy="16" r="5" fill="var(--color-flare)" />
        <ellipse
          cx="16"
          cy="16"
          rx="13"
          ry="5"
          fill="none"
          stroke="var(--color-nebula)"
          strokeWidth="1.6"
          transform="rotate(-25 16 16)"
        />
        <circle cx="26" cy="9" r="1.6" fill="var(--color-gold)" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-star">Órbita</span>
    </span>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

export function Layout() {
  const { count } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
      isActive ? "bg-flare/10 text-flare" : "text-haze hover:bg-line/40 hover:text-star",
    ].join(" ");

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-flare focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-void"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-line/70 bg-void/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Órbita, ir al inicio" className="rounded-lg">
            <Logo />
          </Link>

          <nav aria-label="Navegación principal" className="ml-auto hidden md:block">
            <ul role="list" className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} className={linkClass}>
                    {link.label}
                    {link.to === "/favoritos" && count > 0 ? (
                      <span
                        aria-hidden="true"
                        className="rounded-full bg-flare/20 px-1.5 py-0.5 text-[11px] font-semibold text-flare"
                      >
                        {count}
                      </span>
                    ) : null}
                    {link.to === "/favoritos" && count > 0 ? (
                      <span className="sr-only">, {count} guardados</span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            className="ml-auto rounded-lg border border-line p-2 text-haze transition-colors hover:text-star md:hidden"
          >
            <span className="sr-only">{menuOpen ? "Cerrar menú" : "Abrir menú"}</span>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
              {menuOpen ? (
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <path d="M3.5 6h13M3.5 10h13M3.5 14h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen ? (
          <nav id="menu-movil" aria-label="Navegación móvil" className="border-t border-line/70 md:hidden">
            <ul role="list" className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                        isActive ? "bg-flare/10 text-flare" : "text-haze hover:text-star"
                      }`
                    }
                  >
                    {link.label}
                    {link.to === "/favoritos" && count > 0 ? (
                      <span className="rounded-full bg-flare/20 px-2 py-0.5 text-xs font-semibold text-flare">
                        {count}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="contenido" className="flex-1">
        <ErrorBoundary
          resetKey={pathname}
          title="Esta vista no se pudo mostrar"
          description="El encabezado y el menú siguen funcionando. Puedes reintentar o ir al inicio."
        >
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="border-t border-line/70 bg-ink/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-haze sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-base text-star">Órbita</p>
            <p className="mt-1 max-w-md text-xs leading-relaxed">
              Datos e imágenes del archivo público de la NASA (
              <a
                href="https://images-api.nasa.gov"
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-line underline-offset-4 hover:text-flare"
              >
                images-api.nasa.gov
              </a>
              ). Proyecto académico, sin afiliación con la NASA.
            </p>
          </div>

          <nav aria-label="Enlaces del pie">
            <ul role="list" className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <li>
                <Link to="/explorar" className="hover:text-flare">
                  Explorar
                </Link>
              </li>
              <li>
                <Link to="/favoritos" className="hover:text-flare">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-flare">
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
