import Link from "next/link";
import { ListPlus } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="border-b border-white/10 bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 lg:px-6">
          <div>
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-100">返回媒体库</Link>
            <h1 className="mt-2 text-2xl font-semibold text-white">列表</h1>
            <p className="text-sm text-zinc-400">按手动顺序管理近期优先处理的条目。</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <UserAccount />
            <Link href="/collections/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-medium text-zinc-950 transition hover:bg-amber-300"><ListPlus size={16} />新建列表</Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {collections.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <Link key={collection.id} href={"/collections/" + collection.id} className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 transition hover:border-amber-300/40 hover:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-zinc-50">{collection.name}</h2>
                  <Badge className="border-white/10 bg-white/5 text-zinc-300">{collection._count.items} 个条目</Badge>
                </div>
                {collection.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{collection.description}</p> : <p className="mt-3 text-sm text-zinc-600">暂无描述</p>}
                <p className="mt-5 text-xs text-zinc-600">更新于 {collection.updatedAt.toISOString().replace("T", " ").slice(0, 16)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-zinc-950/50 p-10 text-center text-zinc-400">
            暂无列表，点击右上角新建。
          </div>
        )}
      </section>
    </main>
  );
}
