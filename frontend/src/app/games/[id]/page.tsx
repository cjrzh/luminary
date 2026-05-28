import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { DeleteItemButton } from "@/components/delete-item-button";
import { ItemQuickEdit } from "@/components/item-quick-edit";
import { Badge } from "@/components/ui/badge";
import { GAME_PURCHASE_STATUS_LABELS } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { serializeGame } from "@/lib/serialize";
import { parseJsonArray } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params;
  const game = await prisma.gameItem.findUnique({ where: { id } });
  if (!game) notFound();

  const view = serializeGame(game);
  const genres = parseJsonArray(view.genres);
  const ownedPlatforms = parseJsonArray(view.ownedPlatforms);

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-100"><ArrowLeft size={16} />返回游戏站</Link>
          <div className="flex items-center gap-2">
            <UserAccount />
            <Link href={"/games/" + view.id + "/edit"} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/15"><Pencil size={16} />编辑</Link>
            <DeleteItemButton id={view.id} endpoint="/api/games" redirectTo="/games" />
          </div>
        </div>

        <section className="space-y-6">
          <div className="grid gap-7 rounded-lg border border-white/10 bg-zinc-950/70 p-5 lg:grid-cols-[180px_1fr_260px]">
            <div className="aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-zinc-950">
              {view.coverLocalPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={view.coverLocalPath} alt={view.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#064e3b,transparent_55%),linear-gradient(145deg,#18181b,#09090b)] text-zinc-500">暂无封面</div>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <h1 className="text-balance text-[31px] font-bold leading-[1.18] tracking-normal text-zinc-50 md:text-[36px]">{view.title} {view.releaseYear ? <span className="font-normal text-zinc-500">({view.releaseYear})</span> : null}</h1>
                {view.originalTitle ? <p className="mt-2 text-[15px] leading-6 text-zinc-400">{view.originalTitle}</p> : null}
              </div>
              <dl className="space-y-1.5 text-[15px] leading-7 text-zinc-300">
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">类型</dt><dd>{genres.length ? genres.join(" / ") : "游戏"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">购买状态</dt><dd>{view.purchaseStatus ? GAME_PURCHASE_STATUS_LABELS[view.purchaseStatus] : "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">游戏平台</dt><dd>{ownedPlatforms.length ? ownedPlatforms.join(" / ") : "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">日常价格</dt><dd>{view.normalPriceCny !== null && view.normalPriceCny !== undefined ? "¥" + view.normalPriceCny.toFixed(2) : "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">首选平台</dt><dd>{view.primaryPlatform ?? "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">Steam App</dt><dd>{view.steamAppId ?? "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">PSN / Switch</dt><dd>{[view.psnTitleId, view.switchTitleId].filter(Boolean).join(" / ") || "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">游玩时长</dt><dd>{view.playtimeForeverMinutes !== null && view.playtimeForeverMinutes !== undefined ? Math.round(view.playtimeForeverMinutes / 60 * 10) / 10 + " 小时" : "未填写"}{view.playtime2WeeksMinutes ? " / 近两周 " + Math.round(view.playtime2WeeksMinutes / 60 * 10) / 10 + " 小时" : ""}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">最后游玩</dt><dd>{view.lastPlayedAt ? view.lastPlayedAt.slice(0, 10) : "未填写"}</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0 text-zinc-500">来源</dt><dd className="min-w-0">{view.sourceUrl ? <a href={view.sourceUrl} target="_blank" rel="noreferrer" className="break-all font-medium text-emerald-200 underline decoration-emerald-200/30 underline-offset-4 transition hover:text-emerald-100 hover:decoration-emerald-100">{view.sourceUrl}</a> : "未填写"}</dd></div>
              </dl>
              <ItemQuickEdit item={view} kind="game" />
            </div>

            <aside className="space-y-4 border-white/10 lg:border-l lg:pl-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">我的评分</div>
                <div className="mt-1 flex items-end gap-2"><span className="text-5xl font-semibold leading-none text-emerald-200 tabular-nums">{view.myRating ? view.myRating.toFixed(1) : "-"}</span><span className="pb-1 text-sm text-zinc-500">/ 10</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-emerald-300/25 bg-emerald-400/10 text-emerald-100">游戏</Badge>
                {view.purchaseStatus ? <Badge className="border-white/10 bg-white/5 text-zinc-200">{GAME_PURCHASE_STATUS_LABELS[view.purchaseStatus]}</Badge> : null}
              </div>
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
