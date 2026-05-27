import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { AddItemToCollection } from "@/components/collections/add-item-to-collection";
import { CollectionItemActions } from "@/components/collections/collection-item-actions";
import { DeleteCollectionButton } from "@/components/collections/delete-collection-button";
import { Badge } from "@/components/ui/badge";
import { MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, WATCH_STATUS_LABELS, plexClassName, statusClassName } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { serializeItem } from "@/lib/serialize";

type PageProps = { params: Promise<{ id: string }> };

function statusLabel(item: { mediaType: string; status: string }) {
  if (item.mediaType === "GAME" && item.status === "WANT") return "想玩";
  if (item.mediaType === "GAME" && item.status === "IN_PROGRESS") return "在玩";
  if (item.mediaType === "GAME" && item.status === "COMPLETED") return "玩过";
  return WATCH_STATUS_LABELS[item.status as keyof typeof WATCH_STATUS_LABELS];
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { items: { include: { item: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });

  if (!collection) notFound();

  const includedIds = new Set(collection.items.map((entry) => entry.itemId));
  const availableItems = await prisma.mediaItem.findMany({
    where: { id: { notIn: Array.from(includedIds) } },
    orderBy: [{ title: "asc" }],
    take: 500,
    select: { id: true, title: true, releaseYear: true },
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="border-b border-white/10 bg-zinc-950/90">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
          <div className="mb-5 flex items-center justify-between">
            <Link href="/collections" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />返回列表</Link>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <UserAccount />
              <Link href={"/collections/" + collection.id + "/edit"} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/15"><Pencil size={16} />编辑</Link>
              <DeleteCollectionButton id={collection.id} />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">{collection.name}</h1>
              {collection.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{collection.description}</p> : null}
            </div>
            <Badge className="w-fit border-white/10 bg-white/5 text-zinc-300">{collection.items.length} 个条目</Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr] lg:px-6">
        <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/70 p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-200">加入条目</h2>
          <AddItemToCollection collectionId={collection.id} items={availableItems} />
          <p className="mt-3 text-xs leading-5 text-zinc-500">新条目会默认加入列表尾部。使用右侧上移/下移按钮调整优先级，越靠前优先级越高。</p>
        </aside>

        <section className="space-y-3">
          {collection.items.length ? (
            collection.items.map((entry, index) => {
              const item = serializeItem(entry.item);
              return (
                <article key={entry.id} className="grid gap-4 rounded-lg border border-white/10 bg-zinc-950/70 p-3 transition hover:border-amber-300/30 hover:bg-zinc-900 md:grid-cols-[44px_72px_1fr_auto] md:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-sm font-semibold text-amber-200">{index + 1}</div>
                  <Link href={"/items/" + item.id} className="block aspect-[2/3] w-20 overflow-hidden rounded-md border border-white/10 bg-zinc-950 md:w-[72px]">
                    {item.coverLocalPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverLocalPath} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">{MEDIA_TYPE_LABELS[item.mediaType]}</div>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link href={"/items/" + item.id} className="line-clamp-1 text-base font-semibold text-zinc-50 hover:text-amber-200">{item.title}</Link>
                    {item.originalTitle ? <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{item.originalTitle}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge className="border-white/10 bg-white/5 text-zinc-300">{MEDIA_TYPE_LABELS[item.mediaType]}</Badge>
                      <Badge className={statusClassName[item.status]}>{statusLabel(item)}</Badge>
                      {item.releaseYear ? <Badge className="border-white/10 bg-white/5 text-zinc-300">{item.releaseYear}</Badge> : null}
                      {item.myRating ? <span className="text-sm font-medium text-amber-200">{item.myRating.toFixed(1)} / 10</span> : <span className="text-sm text-zinc-600">未评分</span>}
                      {item.plexStatus ? <Badge className={"px-1.5 text-[10px] " + plexClassName[item.plexStatus]}>{PLEX_STATUS_LABELS[item.plexStatus]}</Badge> : null}
                    </div>
                  </div>
                  <CollectionItemActions collectionId={collection.id} collectionItemId={entry.id} isFirst={index === 0} isLast={index === collection.items.length - 1} />
                </article>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 bg-zinc-950/50 p-10 text-center text-zinc-400">
              这个列表还没有条目。
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
