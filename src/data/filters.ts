import type { MediaFilter, MediaType } from "../api/nasa";

export interface Theme {
  id: string;
  label: string;
  keyword: string;
  blurb: string;
}

/**
 * Temas curados: cada uno se traduce a un `keywords=` real de la API.
 * Verificados contra el archivo (todos devuelven resultados).
 */
export const THEMES: Theme[] = [
  { id: "apollo", label: "Apolo", keyword: "Apollo", blurb: "La carrera a la Luna" },
  { id: "hubble", label: "Hubble", keyword: "Hubble", blurb: "Tres décadas de cielo" },
  { id: "webb", label: "James Webb", keyword: "James Webb", blurb: "El ojo más profundo" },
  { id: "artemis", label: "Artemis", keyword: "Artemis", blurb: "Volver a la Luna" },
  { id: "mars", label: "Marte", keyword: "Mars", blurb: "Rovers y cráteres" },
  { id: "iss", label: "Estación Espacial", keyword: "International Space Station", blurb: "Vida en órbita" },
  { id: "shuttle", label: "Transbordador", keyword: "Space Shuttle", blurb: "30 años de vuelos" },
  { id: "voyager", label: "Voyager", keyword: "Voyager", blurb: "Más allá del sistema solar" },
  { id: "moon", label: "Luna", keyword: "Moon", blurb: "Nuestro satélite" },
  { id: "earth", label: "Tierra", keyword: "Earth", blurb: "El planeta azul" },
  { id: "nebula", label: "Nebulosas", keyword: "Nebula", blurb: "Guarderías de estrellas" },
  { id: "galaxy", label: "Galaxias", keyword: "Galaxy", blurb: "Islas de estrellas" },
];

export interface Decade {
  id: string;
  label: string;
  start: number;
  end: number;
}

export const DECADES: Decade[] = [
  { id: "60", label: "Años 60", start: 1960, end: 1969 },
  { id: "70", label: "Años 70", start: 1970, end: 1979 },
  { id: "80", label: "Años 80", start: 1980, end: 1989 },
  { id: "90", label: "Años 90", start: 1990, end: 1999 },
  { id: "00", label: "Años 2000", start: 2000, end: 2009 },
  { id: "10", label: "Años 2010", start: 2010, end: 2019 },
  { id: "20", label: "Años 2020", start: 2020, end: 2029 },
];

/** Nombres legibles para los centros que usa la API (JPL, JSC, ...). */
export const CENTER_LABELS: Record<string, string> = {
  JPL: "Pasadena (JPL)",
  JSC: "Houston (JSC)",
  KSC: "Cabo Cañaveral (KSC)",
  GSFC: "Greenbelt (GSFC)",
  MSFC: "Huntsville (MSFC)",
  ARC: "Moffett Field (ARC)",
  HQ: "Washington (HQ)",
  AFRC: "Edwards (AFRC)",
  GRC: "Cleveland (GRC)",
  LARC: "Hampton (LaRC)",
};

export const MEDIA_LABELS: Record<MediaType, string> = {
  image: "Foto",
  video: "Video",
  audio: "Audio",
};

export const MEDIA_FILTERS: { id: MediaFilter; label: string }[] = [
  { id: "image", label: "Fotos" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audios" },
  { id: "all", label: "Todo" },
];

export function centerLabel(center: string | null): string | null {
  if (!center) return null;
  return CENTER_LABELS[center] ?? center;
}

export function yearOf(date: string): string | null {
  return date ? date.slice(0, 4) : null;
}
