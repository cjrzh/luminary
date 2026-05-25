import type { MediaItem } from "@prisma/client";
import type { MediaItemView } from "@/lib/types";

export function serializeItem(item: MediaItem): MediaItemView {
  return {
    ...item,
    watchedAt: item.watchedAt?.toISOString() ?? null,
    plexSyncedAt: item.plexSyncedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
