import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { DeleteItemButton } from "@/components/delete-item-button";
import { ItemForm } from "@/components/item-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, WATCH_STATUS_LABELS, plexClassName, statusClassName } from "@/lib/media";
import { parseJsonArray } from "@/lib/utils";
import { serializeItem } from "@/lib/serialize";

type PageProps = { params: Promise<{ id: string }> };

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await prisma.mediaItem.findUnique({ where: { id } });
  if (!item) notFound();

  const view = serializeItem(item);
  const genres = parseJsonArray(view.genres);
  const editFormId = `item-edit-form-${view.id}`;

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />返回列表</Link>
          <div className="flex items-center gap-2">
            <Button type="submit" form={editFormId}><Save size={16} />保存</Button>
            <DeleteItemButton id={view.id} />
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-2xl shadow-black/30">
              {view.coverLocalPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={view.coverLocalPath} alt={view.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#3f3f46,transparent_55%),linear-gradient(145deg,#18181b,#09090b)] text-zinc-500">暂无封面</div>
              )}
            </div>
            {view.plexStatus ? (
              <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-4">
                <div className="mb-2 text-sm font-semibold text-zinc-200">Plex 状态</div>
                <Badge className={plexClassName[view.plexStatus]}>{PLEX_STATUS_LABELS[view.plexStatus]}</Badge>
                {view.plexRatingKey ? <p className="mt-2 text-xs text-zinc-500">Rating Key: {view.plexRatingKey}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-normal text-white">{view.title}</h1>
                  {view.originalTitle ? <p className="mt-1 text-zinc-400">{view.originalTitle}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-white/10 bg-white/5 text-zinc-200">{MEDIA_TYPE_LABELS[view.mediaType]}</Badge>
                  <Badge className={statusClassName[view.status]}>{WATCH_STATUS_LABELS[view.status]}</Badge>
                  {view.releaseYear ? <Badge className="border-white/10 bg-white/5 text-zinc-300">{view.releaseYear}</Badge> : null}
                </div>
              </div>
              {view.description ? <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">{view.description}</p> : <p className="text-sm text-zinc-500">暂无简介</p>}
              {genres.length ? <div className="mt-4 flex flex-wrap gap-2">{genres.map((genre) => <Badge key={genre} className="border-white/10 bg-white/5 text-zinc-300">{genre}</Badge>)}</div> : null}
            </div>

            <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
              <h2 className="mb-5 text-lg font-semibold text-white">编辑条目</h2>
              <ItemForm item={view} formId={editFormId} hideActions />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
