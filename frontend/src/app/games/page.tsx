import Link from "next/link";
import { Film, Filter, Home, Search } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { GameCard } from "@/components/item-card";
import { NewGameDialog } from "@/components/item-form";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/field";
import { getGames } from "@/lib/games";
import { GAME_PURCHASE_STATUS_LABELS, WATCH_STATUS_LABELS, gamePurchaseStatuses, watchStatuses } from "@/lib/media";
import { serializeGame } from "@/lib/serialize";
import type { GameItemView } from "@/lib/types";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

export const dynamic = "force-dynamic";

export default async function GamesHome({ searchParams }: PageProps) {
  const query = await searchParams;
  const { games, total, page, pageSize } = await getGames(query);
  const serialized = games.map(serializeGame) as GameItemView[];

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="border-b border-white/10 bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">Luminary 游戏站</h1>
              <p className="text-sm text-zinc-400">平台、购买状态与游玩档案</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <UserAccount />
              <Link href="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/15"><Home size={16} />总站</Link>
              <Link href="/media" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/30 bg-amber-400/10 px-4 text-sm font-medium text-amber-100 transition hover:bg-amber-400/15"><Film size={16} />媒体站</Link>
              <NewGameDialog />
            </div>
          </div>
          <form className="flex flex-col gap-3 md:flex-row" action="/games">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-500" size={18} />
              <Input name="search" defaultValue={query.search ?? ""} placeholder="搜索游戏标题或原始标题" className="pl-10" />
            </div>
            <button className="h-10 rounded-md bg-emerald-300 px-4 text-sm font-medium text-zinc-950 hover:bg-emerald-200">搜索</button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/70 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200"><Filter size={16} />过滤</div>
          <form className="space-y-4" action="/games">
            {query.search ? <input type="hidden" name="search" value={query.search} /> : null}
            <div className="space-y-2">
              <Label htmlFor="status">游玩状态</Label>
              <Select id="status" name="status" defaultValue={query.status ?? ""}>
                <option value="">全部</option>
                {watchStatuses.map((status) => <option key={status} value={status}>{status === "WANT" ? "想玩" : status === "IN_PROGRESS" ? "在玩" : status === "COMPLETED" ? "玩过" : WATCH_STATUS_LABELS[status]}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseStatus">购买状态</Label>
              <Select id="purchaseStatus" name="purchaseStatus" defaultValue={query.purchaseStatus ?? ""}>
                <option value="">全部</option>
                {gamePurchaseStatuses.map((status) => <option key={status} value={status}>{GAME_PURCHASE_STATUS_LABELS[status]}</option>)}
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="platform">平台</Label><Input id="platform" name="platform" defaultValue={query.platform ?? ""} placeholder="Steam / PS5 / Switch" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="minRating">最低评分</Label><Input id="minRating" name="minRating" type="number" min="1" max="10" step="0.5" defaultValue={query.minRating ?? ""} /></div>
              <div className="space-y-2"><Label htmlFor="maxRating">最高评分</Label><Input id="maxRating" name="maxRating" type="number" min="1" max="10" step="0.5" defaultValue={query.maxRating ?? ""} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="releaseYearFrom">起始年份</Label><Input id="releaseYearFrom" name="releaseYearFrom" type="number" defaultValue={query.releaseYearFrom ?? ""} /></div>
              <div className="space-y-2"><Label htmlFor="releaseYearTo">结束年份</Label><Input id="releaseYearTo" name="releaseYearTo" type="number" defaultValue={query.releaseYearTo ?? ""} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="genre">类型标签</Label><Input id="genre" name="genre" defaultValue={query.genre ?? ""} placeholder="RPG" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="sort">排序</Label><Select id="sort" name="sort" defaultValue={query.sort ?? "createdAt"}><option value="createdAt">创建时间</option><option value="myRating">评分</option><option value="playedAt">通关日期</option><option value="lastPlayedAt">最后游玩</option><option value="releaseYear">年份</option></Select></div>
              <div className="space-y-2"><Label htmlFor="order">方向</Label><Select id="order" name="order" defaultValue={query.order ?? "desc"}><option value="desc">降序</option><option value="asc">升序</option></Select></div>
            </div>
            <button className="h-10 w-full rounded-md bg-white/10 text-sm font-medium text-zinc-100 hover:bg-white/15">应用过滤</button>
          </form>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-400"><span>共 {total} 个游戏条目</span><Badge className="border-white/10 bg-white/5 text-zinc-300">第 {page} 页 / 每页 {pageSize}</Badge></div>
          {serialized.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">{serialized.map((game: GameItemView) => <GameCard key={game.id} game={game} />)}</div> : <div className="rounded-lg border border-dashed border-white/10 bg-zinc-950/50 p-10 text-center text-zinc-400">暂无游戏条目，点击右上角新建。</div>}
        </section>
      </div>
    </main>
  );
}
