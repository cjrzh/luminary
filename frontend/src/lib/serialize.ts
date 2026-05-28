import type { GameItem, MediaItem } from "@prisma/client";
import type { GameItemView, MediaItemView } from "@/lib/types";

export function serializeItem(item: MediaItem): MediaItemView {
  return {
    ...item,
    watchedAt: item.watchedAt?.toISOString() ?? null,
    plexSyncedAt: item.plexSyncedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeGame(game: GameItem): GameItemView {
  return {
    ...game,
    playedAt: game.playedAt?.toISOString() ?? null,
    lastPlayedAt: game.lastPlayedAt?.toISOString() ?? null,
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  };
}
