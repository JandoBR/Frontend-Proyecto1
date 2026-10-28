interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isBusy?: boolean;
}

export function SearchBar({
  value,
  onChange,
  label = "Buscar en el archivo",
  placeholder = "Nebulosa, Apolo, Marte…",
  isBusy = false,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <label htmlFor="buscador" className="sr-only">
        {label}
      </label>

      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-haze" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" className="size-4">
          <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7" />
          <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>

      <input
        id="buscador"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby="buscador-ayuda"
        className="field py-3 pr-11 pl-10 text-base"
        autoComplete="off"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1.5 text-haze transition-colors hover:bg-line/60 hover:text-star"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
            <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}

      <p id="buscador-ayuda" className="sr-only">
        La búsqueda consulta títulos y descripciones del archivo y se actualiza mientras escribes.
      </p>

      {isBusy ? (
        <span className="absolute -bottom-6 left-1 text-xs text-haze" aria-hidden="true">
          Buscando…
        </span>
      ) : null}
    </div>
  );
}
