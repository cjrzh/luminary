import type { MediaType, PlexStatus, WatchStatus } from "@/lib/media";

export type MediaItemView = {
  id: string;
  mediaType: MediaType;
  title: string;
  originalTitle: string | null;
  coverLocalPath: string | null;
  sourceUrl: string | null;
  description: string | null;
  releaseYear: number | null;
  genres: string;
  status: WatchStatus;
  myRating: number | null;
  myReview: string | null;
  watchedAt: string | null;
  imdbId: string | null;
  tmdbId: string | null;
  bangumiId: string | null;
  igdbId: string | null;
  malId: string | null;
  isbn: string | null;
  plexRatingKey: string | null;
  plexStatus: PlexStatus | null;
  plexSyncedAt: string | null;
  extraData: string | null;
  createdAt: string;
  updatedAt: string;
};
