import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section
      aria-labelledby="notfound-titulo"
      className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6"
    >
      <p className="font-display text-7xl font-semibold tracking-tight text-flare sm:text-8xl">404</p>

      <h1 id="notfound-titulo" className="mt-4 font-display text-2xl font-semibold text-star sm:text-3xl">
        Esta órbita no existe
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-haze">
        La página que buscas se salió de trayectoria. Puede que el enlace esté roto o que el
        contenido ya no esté en el archivo.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Volver al inicio
        </Link>
        <Link to="/explorar" className="btn-ghost">
          Explorar el archivo
        </Link>
      </div>
    </section>
  );
}
