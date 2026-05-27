import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, WATCH_STATUS_LABELS, plexClassName, statusClassName } from "@/lib/media";
import { parseJsonArray } from "@/lib/utils";
import type { MediaItemView } from "@/lib/types";

export function ItemCard({ item }: { item: MediaItemView }) {
  const genres = parseJsonArray(item.genres).slice(0, 2);

  return (
    <Link href={"/items/" + item.id} className="group block overflow-hidden rounded-lg border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-amber-300/40 hover:bg-zinc-900">
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
          <Badge className={statusClassName[item.status]}>{item.mediaType === "GAME" && item.status === "WANT" ? "想玩" : item.mediaType === "GAME" && item.status === "IN_PROGRESS" ? "在玩" : item.mediaType === "GAME" && item.status === "COMPLETED" ? "玩过" : WATCH_STATUS_LABELS[item.status]}</Badge>
        </div>
      </div>
    </Link>
  );
}
