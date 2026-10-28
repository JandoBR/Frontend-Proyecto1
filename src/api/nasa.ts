/**
 * Capa de acceso a la API pública de la NASA (Image and Video Library).
 *
 * Toda la app pasa por este módulo: si mañana migramos a una API propia,
 * basta con reemplazar estas tres funciones por llamadas a `/api/*`.
 * La forma de `NasaItem` es el contrato que consume la UI.
 *
 * Docs: https://images-api.nasa.gov  (sin API key, sin cuota documentada)
 */

const BASE_URL = "https://images-api.nasa.gov";

/**
 * La API corta en 10.000 resultados por búsqueda (page * page_size).
 * Más allá devuelve 400 "Maximum number of search results...".
 */
export const MAX_RESULTS = 10_000;

export type MediaType = "image" | "video" | "audio";
export type MediaFilter = MediaType | "all";

export interface NasaItem {
  id: string;
  title: string;
  description: string;
  date: string;
  center: string | null;
  keywords: string[];
  mediaType: MediaType;
  credit: string | null;
  thumb: string | null;
  preview: string | null;
  original: string | null;
}

export interface SearchOptions {
  q?: string;
  keyword?: string;
  yearStart?: number;
  yearEnd?: number;
  mediaType?: MediaFilter;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: NasaItem[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RawLink {
  href: string;
  rel?: string;
  render?: string;
  width?: string | number;
  height?: string | number;
}

interface RawData {
  nasa_id?: string;
  title?: string;
  description?: string;
  date_created?: string;
  center?: string;
  keywords?: string[];
  media_type?: string;
  secondary_creator?: string;
  photographer?: string;
  credit?: string;
}

interface RawItem {
  href: string;
  data?: RawData[];
  links?: RawLink[];
}

interface RawCollection {
  items?: RawItem[];
  metadata?: { total_hits?: number };
}

const MEDIA_TYPES: MediaType[] = ["image", "video", "audio"];

function toMediaType(value?: string): MediaType {
  return MEDIA_TYPES.includes(value as MediaType) ? (value as MediaType) : "image";
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#34": '"',
};

/** La API devuelve descripciones y créditos con HTML; aquí lo volvemos texto plano. */
function toPlainText(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&([#0-9a-z]+);/gi, (match, entity: string) => ENTITIES[entity.toLowerCase()] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

function toItem(raw: RawItem): NasaItem | null {
  const data = raw.data?.[0];
  if (!data?.nasa_id) return null;

  const images = (raw.links ?? []).filter((link) => (link.render ?? "image") === "image");
  const firstWithRel = (rel: string) => images.find((link) => link.rel === rel)?.href ?? null;
  const largestAlternate = [...images]
    .filter((link) => link.rel === "alternate")
    .sort((a, b) => Number(b.width ?? 0) - Number(a.width ?? 0))[0];

  return {
    id: data.nasa_id,
    title: data.title?.trim() || "Sin título",
    description: toPlainText(data.description),
    date: data.date_created ?? "",
    center: data.center ?? null,
    keywords: (data.keywords ?? []).slice(0, 10),
    mediaType: toMediaType(data.media_type),
    credit: toPlainText(data.secondary_creator ?? data.photographer ?? data.credit) || null,
    thumb: firstWithRel("preview") ?? largestAlternate?.href ?? null,
    preview: largestAlternate?.href ?? firstWithRel("canonical"),
    original: firstWithRel("canonical") ?? largestAlternate?.href ?? null,
  };
}

function buildSearchUrl(options: SearchOptions): URL {
  const url = new URL(`${BASE_URL}/search`);
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;

  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));

  const query = options.q?.trim();
  if (query) url.searchParams.set("q", query);
  if (options.keyword) url.searchParams.set("keywords", options.keyword);
  if (options.yearStart != null) url.searchParams.set("year_start", String(options.yearStart));
  if (options.yearEnd != null) url.searchParams.set("year_end", String(options.yearEnd));
  if (options.mediaType && options.mediaType !== "all") {
    url.searchParams.set("media_type", options.mediaType);
  } else {
    // La API exige al menos un criterio: con "todo" pedimos los tres formatos.
    url.searchParams.set("media_type", "image,video,audio");
  }

  return url;
}

async function request<T>(url: URL, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("No pudimos conectar con el archivo de la NASA. Revisa tu conexión.");
  }

  if (!response.ok) {
    let reason = "";
    try {
      const body = (await response.json()) as { reason?: string };
      reason = body.reason ?? "";
    } catch {
      // Sin cuerpo útil: nos quedamos con el status.
    }

    if (/maximum number of search results/i.test(reason)) {
      throw new ApiError(
        "El archivo no muestra más de 10.000 resultados por búsqueda. Afina los filtros para seguir explorando.",
        response.status,
      );
    }

    throw new ApiError(
      reason || `El archivo de la NASA respondió con un error ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function searchItems(
  options: SearchOptions = {},
  signal?: AbortSignal,
): Promise<SearchResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 24;
  const json = await request<{ collection?: RawCollection }>(buildSearchUrl(options), signal);

  const items = (json.collection?.items ?? [])
    .map(toItem)
    .filter((item): item is NasaItem => item !== null);

  return {
    items,
    total: json.collection?.metadata?.total_hits ?? items.length,
    page,
    pageSize,
  };
}

/** Fetch individual por ID: la ruta dinámica `/explorar/:id` usa esta función. */
export async function getItemById(id: string, signal?: AbortSignal): Promise<NasaItem | null> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("nasa_id", id);

  const json = await request<{ collection?: RawCollection }>(url, signal);
  const raw = json.collection?.items?.[0];
  return raw ? toItem(raw) : null;
}

/** Elige una página y un elemento al azar dentro de los resultados actuales. */
export async function getRandomItem(
  options: SearchOptions = {},
  signal?: AbortSignal,
): Promise<NasaItem | null> {
  const first = await searchItems({ ...options, page: 1, pageSize: 1 }, signal);
  if (first.total === 0) return null;

  const pageSize = 100;
  const accessible = Math.min(first.total, MAX_RESULTS);
  const target = Math.floor(Math.random() * accessible);
  const page = Math.min(Math.floor(target / pageSize) + 1, MAX_RESULTS / pageSize);

  const result = await searchItems({ ...options, page, pageSize }, signal);
  if (result.items.length === 0) return null;

  return result.items[Math.floor(Math.random() * result.items.length)] ?? null;
}
