import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { ItemForm } from "@/components/item-form";
import { prisma } from "@/lib/prisma";
import { serializeItem } from "@/lib/serialize";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function MediaEditPage({ params }: PageProps) {
  const { id } = await params;
  const item = await prisma.mediaItem.findUnique({ where: { id } });
  if (!item) notFound();

  const view = serializeItem(item);

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href={"/media/" + view.id} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />返回展示页</Link>
          <UserAccount />
        </div>
        <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-white">编辑媒体元数据</h1>
            <p className="mt-1 text-sm text-zinc-500">编辑标题、来源 URL、封面、简介、外部编码和扩展字段。</p>
          </div>
          <ItemForm item={view} kind="media" redirectTo={"/media/" + view.id} />
        </section>
      </div>
    </main>
  );
}
