import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { ItemForm } from "@/components/item-form";
import { prisma } from "@/lib/prisma";
import { serializeGame } from "@/lib/serialize";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function GameEditPage({ params }: PageProps) {
  const { id } = await params;
  const game = await prisma.gameItem.findUnique({ where: { id } });
  if (!game) notFound();

  const view = serializeGame(game);

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href={"/games/" + view.id} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />返回展示页</Link>
          <UserAccount />
        </div>
        <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-white">编辑游戏元数据</h1>
            <p className="mt-1 text-sm text-zinc-500">编辑平台、购买、价格、外部 ID、游玩时长和评价信息。</p>
          </div>
          <ItemForm item={view} kind="game" redirectTo={"/games/" + view.id} />
        </section>
      </div>
    </main>
  );
}
