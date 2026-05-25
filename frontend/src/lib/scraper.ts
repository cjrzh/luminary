import { MediaType } from "@prisma/client";

export type SearchResult = {
  source: string;
  externalId: string;
  title: string;
  originalTitle?: string;
  releaseYear?: number;
  coverUrl?: string;
};

export type MediaMetadata = {
  title: string;
  originalTitle?: string;
  description?: string;
  releaseYear?: number;
  genres?: string[];
  coverUrl?: string;
  externalIds?: Record<string, string>;
};

export async function searchMedia(
  query: string,
  type: MediaType,
): Promise<SearchResult[]> {
  void query;
  void type;
  throw new Error("scraper not available");
}

export async function fetchByExternalId(
  source: string,
  id: string,
): Promise<MediaMetadata> {
  void source;
  void id;
  throw new Error("scraper not available");
}
