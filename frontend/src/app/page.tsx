import Link from "next/link";
import { Gamepad2, LibraryBig } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 lg:px-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-white">Luminary</h1>
            <p className="text-sm text-zinc-400">个人娱乐内容档案</p>
          </div>
          <UserAccount />
        </header>

        <section className="grid flex-1 items-center gap-4 py-10 md:grid-cols-2">
          <Link href="/media" className="group min-h-[320px] rounded-lg border border-white/10 bg-zinc-950/70 p-6 transition hover:-translate-y-1 hover:border-amber-300/40 hover:bg-zinc-900">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-amber-300 text-zinc-950">
              <LibraryBig size={24} />
            </div>
            <h2 className="text-3xl font-semibold text-white">媒体站</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">电影、剧集、综艺、动画、漫画和书籍统一放在媒体表中，保留 Plex、IMDb、TMDB、Bangumi 等媒体元数据。</p>
            <span className="mt-8 inline-flex text-sm font-medium text-amber-200 group-hover:text-amber-100">进入媒体站</span>
          </Link>

          <Link href="/games" className="group min-h-[320px] rounded-lg border border-white/10 bg-zinc-950/70 p-6 transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-zinc-900">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-300 text-zinc-950">
              <Gamepad2 size={24} />
            </div>
            <h2 className="text-3xl font-semibold text-white">游戏站</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">游戏使用独立数据表，专门记录购买状态、平台、价格、Steam/PSN/Switch ID 和游玩时长。</p>
            <span className="mt-8 inline-flex text-sm font-medium text-emerald-200 group-hover:text-emerald-100">进入游戏站</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
