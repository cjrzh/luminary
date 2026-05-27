export type MediaType = "MOVIE" | "TV" | "VARIETY" | "GAME" | "ANIME" | "MANGA" | "BOOK";
export type WatchStatus = "WANT" | "IN_PROGRESS" | "COMPLETED" | "DROPPED" | "ON_HOLD";
export type PlexStatus = "IN_LIBRARY" | "DELETED";
export type GamePurchaseStatus = "PURCHASED" | "NOT_PURCHASED";

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  MOVIE: "电影",
  TV: "电视剧",
  VARIETY: "综艺",
  GAME: "游戏",
  ANIME: "动画",
  MANGA: "漫画",
  BOOK: "书籍",
};

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  WANT: "想看",
  IN_PROGRESS: "在看",
  COMPLETED: "看过",
  DROPPED: "放弃",
  ON_HOLD: "搁置",
};

export const PLEX_STATUS_LABELS: Record<PlexStatus, string> = {
  IN_LIBRARY: "本地有",
  DELETED: "已删除",
};

export const GAME_PURCHASE_STATUS_LABELS: Record<GamePurchaseStatus, string> = {
  PURCHASED: "已购买",
  NOT_PURCHASED: "未购买",
};

export const mediaTypes = ["MOVIE", "TV", "VARIETY", "GAME", "ANIME", "MANGA", "BOOK"] as const;
export const watchStatuses = ["WANT", "IN_PROGRESS", "COMPLETED"] as const;
export const allWatchStatuses = ["WANT", "IN_PROGRESS", "COMPLETED", "DROPPED", "ON_HOLD"] as const;
export const plexStatuses = ["IN_LIBRARY", "DELETED"] as const;
export const gamePurchaseStatuses = ["PURCHASED", "NOT_PURCHASED"] as const;

export const statusClassName: Record<WatchStatus, string> = {
  WANT: "border-blue-400/30 bg-blue-500/15 text-blue-200",
  IN_PROGRESS: "border-yellow-300/30 bg-yellow-400/15 text-yellow-100",
  COMPLETED: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  DROPPED: "border-zinc-400/30 bg-zinc-500/15 text-zinc-200",
  ON_HOLD: "border-orange-400/30 bg-orange-500/15 text-orange-100",
};

export const plexClassName: Record<PlexStatus, string> = {
  IN_LIBRARY: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  DELETED: "border-zinc-500/30 bg-zinc-700/30 text-zinc-300",
};
