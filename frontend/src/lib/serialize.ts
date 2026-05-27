import type { GameProfile, MediaItem } from "@prisma/client";
import type { MediaItemView } from "@/lib/types";

type SerializableItem = MediaItem & { gameProfile?: GameProfile | null };

export function serializeItem(item: SerializableItem): MediaItemView {
  return {
    ...item,
    gameProfile: item.gameProfile
      ? {
          ...item.gameProfile,
          lastPlayedAt: item.gameProfile.lastPlayedAt?.toISOString() ?? null,
          createdAt: item.gameProfile.createdAt.toISOString(),
          updatedAt: item.gameProfile.updatedAt.toISOString(),
        }
      : null,
    watchedAt: item.watchedAt?.toISOString() ?? null,
    plexSyncedAt: item.plexSyncedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
