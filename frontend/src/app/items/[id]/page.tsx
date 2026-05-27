import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { DeleteItemButton } from "@/components/delete-item-button";
import { ItemQuickEdit } from "@/components/item-quick-edit";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { GAME_PURCHASE_STATUS_LABELS, MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, plexClassName } from "@/lib/media";
import { parseJsonArray } from "@/lib/utils";
import { serializeItem } from "@/lib/serialize";

type PageProps = { params: Promise<{ id: string }> };

const pageFont =
  'Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await prisma.mediaItem.findUnique({ where: { id }, include: { gameProfile: true } });
  if (!item) notFound();

  const view = serializeItem(item);
  const genres = parseJsonArray(view.genres);
  const ownedPlatforms = parseJsonArray(view.gameProfile?.ownedPlatforms);
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 antialiased" style={{ fontFamily: pageFont }}>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-100"><ArrowLeft size={16} />返回列表</Link>
          <div className="flex items-center gap-2">
            <UserAccount />
            <Link href={"/items/" + view.id + "/edit"} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/15"><Pencil size={16} />编辑</Link>
            <DeleteItemButton id={view.id} />
          </div>
        </div>

        <section className="space-y-6">
          <div className="grid gap-7 rounded-lg border border-white/10 bg-zinc-950/70 p-5 lg:grid-cols-[180px_1fr_260px]">
            <div className="space-y-3">
              <div className="aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                {view.coverLocalPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={view.coverLocalPath} alt={view.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#3f3f46,transparent_55%),linear-gradient(145deg,#18181b,#09090b)] text-zinc-500">暂无封面</div>
                )}
              </div>
              <p className="text-center text-xs text-zinc-500">{view.coverLocalPath ? "封面" : "可在编辑页添加封面"}</p>
            </div>

            <div className="space-y-5">
              <div>
                <h1 className="text-balance text-[31px] font-bold leading-[1.18] tracking-normal text-zinc-50 md:text-[36px]">
                  {view.title} {view.releaseYear ? <span className="font-normal text-zinc-500">({view.releaseYear})</span> : null}
                </h1>
                {view.originalTitle ? <p className="mt-2 text-[15px] leading-6 text-zinc-400">{view.originalTitle}</p> : null}
              </div>
              <dl className="space-y-1.5 text-[15px] leading-7 text-zinc-300">
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-zinc-500">类型</dt>
                  <dd>{genres.length ? genres.join(" / ") : MEDIA_TYPE_LABELS[view.mediaType]}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-zinc-500">媒体</dt>
                  <dd>{MEDIA_TYPE_LABELS[view.mediaType]}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-zinc-500">发行年份</dt>
                  <dd>{view.releaseYear ?? "未填写"}</dd>
                </div>
                {view.mediaType === "GAME" ? (
                  <>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">购买状态</dt>
                      <dd>{view.gameProfile?.purchaseStatus ? GAME_PURCHASE_STATUS_LABELS[view.gameProfile.purchaseStatus] : "未填写"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">游戏平台</dt>
                      <dd>{ownedPlatforms.length ? ownedPlatforms.join(" / ") : "未填写"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">日常价格</dt>
                      <dd>{view.gameProfile?.normalPriceCny !== null && view.gameProfile?.normalPriceCny !== undefined ? "¥" + view.gameProfile.normalPriceCny.toFixed(2) : "未填写"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">拥有平台</dt>
                      <dd>{view.gameProfile?.primaryPlatform ?? "未填写"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">Steam App</dt>
                      <dd>{view.gameProfile?.steamAppId ?? "未填写"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">PSN / Switch</dt>
                      <dd>{[view.gameProfile?.psnTitleId, view.gameProfile?.switchTitleId].filter(Boolean).join(" / ") || "未填写"}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">游玩时长</dt>
                      <dd>
                        {view.gameProfile?.playtimeForeverMinutes !== null && view.gameProfile?.playtimeForeverMinutes !== undefined
                          ? Math.round(view.gameProfile.playtimeForeverMinutes / 60 * 10) / 10 + " 小时"
                          : "未填写"}
                        {view.gameProfile?.playtime2WeeksMinutes ? " / 近两周 " + Math.round(view.gameProfile.playtime2WeeksMinutes / 60 * 10) / 10 + " 小时" : ""}
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-zinc-500">最后游玩</dt>
                      <dd>{view.gameProfile?.lastPlayedAt ? view.gameProfile.lastPlayedAt.slice(0, 10) : "未填写"}</dd>
                    </div>
                  </>
                ) : null}
                {view.mediaType !== "GAME" ? (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-zinc-500">IMDb</dt>
                    <dd>{view.imdbId ?? "未填写"}</dd>
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-zinc-500">来源</dt>
                  <dd className="min-w-0">
                    {view.sourceUrl ? (
                      <a href={view.sourceUrl} target="_blank" rel="noreferrer" className="break-all font-medium text-amber-200 underline decoration-amber-200/30 underline-offset-4 transition hover:text-amber-100 hover:decoration-amber-100">{view.sourceUrl}</a>
                    ) : (
                      "未填写"
                    )}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-zinc-500">创建时间</dt>
                  <dd className="tabular-nums">{view.createdAt.replace("T", " ").slice(0, 16)}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-zinc-500">修改时间</dt>
                  <dd className="tabular-nums">{view.updatedAt.replace("T", " ").slice(0, 16)}</dd>
                </div>
              </dl>
              <ItemQuickEdit item={view} />
            </div>

            <aside className="space-y-4 border-white/10 lg:border-l lg:pl-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">我的评分</div>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-semibold leading-none text-amber-200 tabular-nums">{view.myRating ? view.myRating.toFixed(1) : "-"}</span>
                  <span className="pb-1 text-sm text-zinc-500">/ 10</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-white/10 bg-white/5 text-zinc-200">{MEDIA_TYPE_LABELS[view.mediaType]}</Badge>
                {view.mediaType !== "GAME" && view.plexStatus ? <Badge className={plexClassName[view.plexStatus]}>{PLEX_STATUS_LABELS[view.plexStatus]}</Badge> : null}
              </div>
              {view.mediaType !== "GAME" ? (
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
                  Plex: {view.plexStatus ? PLEX_STATUS_LABELS[view.plexStatus] : "未关联"}
                  {view.plexRatingKey ? <div className="mt-1 text-xs text-zinc-500">Rating Key: {view.plexRatingKey}</div> : null}
                </div>
              ) : null}
            </aside>
          </div>

          <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
            <h2 className="mb-4 text-[22px] font-semibold leading-none text-emerald-300">{view.title} 的简介</h2>
            {view.description ? <p className="max-w-4xl whitespace-pre-wrap text-[15px] leading-8 text-zinc-300/90">{view.description}</p> : <p className="text-sm text-zinc-500">暂无简介</p>}
          </section>
        </section>
      </div>
    </main>
  );
}
