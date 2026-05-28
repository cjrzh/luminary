import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GAME_PURCHASE_STATUS_LABELS, MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, WATCH_STATUS_LABELS, plexClassName, statusClassName } from "@/lib/media";
import { parseJsonArray } from "@/lib/utils";
import type { GameItemView, MediaItemView } from "@/lib/types";

export function ItemCard({ item }: { item: MediaItemView }) {
  const genres = parseJsonArray(item.genres).slice(0, 2);

  return (
    <Link href={"/media/" + item.id} className="group block overflow-hidden rounded-lg border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-amber-300/40 hover:bg-zinc-900">
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-950">
        {item.coverLocalPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverLocalPath} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#3f3f46,transparent_55%),linear-gradient(145deg,#18181b,#09090b)] px-4 text-center text-sm text-zinc-500">
            {MEDIA_TYPE_LABELS[item.mediaType]}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-50">{item.title}</h3>
          {item.plexStatus ? <Badge className={"shrink-0 px-1.5 text-[10px] " + plexClassName[item.plexStatus]}>{PLEX_STATUS_LABELS[item.plexStatus]}</Badge> : null}
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{item.releaseYear ?? "年份未知"}</span>
          <span>{genres.join(" / ") || MEDIA_TYPE_LABELS[item.mediaType]}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-amber-200">{item.myRating ? item.myRating.toFixed(1) + " / 10" : "未评分"}</span>
          <Badge className={statusClassName[item.status]}>{WATCH_STATUS_LABELS[item.status]}</Badge>
        </div>
      </div>
    </Link>
  );
}

const gameStatusLabels: Record<string, string> = {
  WANT: "想玩",
  IN_PROGRESS: "在玩",
  COMPLETED: "玩过",
  DROPPED: "弃坑",
  ON_HOLD: "搁置",
};

export function GameCard({ game }: { game: GameItemView }) {
  const genres = parseJsonArray(game.genres).slice(0, 2);
  const platforms = parseJsonArray(game.ownedPlatforms).slice(0, 2);

  return (
    <Link href={"/games/" + game.id} className="group block overflow-hidden rounded-lg border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-zinc-900">
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-950">
        {game.coverLocalPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.coverLocalPath} alt={game.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#064e3b,transparent_55%),linear-gradient(145deg,#18181b,#09090b)] px-4 text-center text-sm text-zinc-500">
            游戏
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-50">{game.title}</h3>
          {game.purchaseStatus ? <Badge className="shrink-0 border-emerald-300/25 bg-emerald-400/10 px-1.5 text-[10px] text-emerald-100">{GAME_PURCHASE_STATUS_LABELS[game.purchaseStatus]}</Badge> : null}
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{game.releaseYear ?? "年份未知"}</span>
          <span>{platforms.join(" / ") || genres.join(" / ") || "游戏"}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-emerald-200">{game.myRating ? game.myRating.toFixed(1) + " / 10" : "未评分"}</span>
          <Badge className={statusClassName[game.status]}>{gameStatusLabels[game.status]}</Badge>
        </div>
      </div>
    </Link>
  );
}
