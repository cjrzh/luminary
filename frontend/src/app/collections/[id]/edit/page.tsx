import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { CollectionForm } from "@/components/collections/collection-form";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: PageProps) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection) notFound();

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href={"/collections/" + collection.id} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />返回列表详情</Link>
          <UserAccount />
        </div>
        <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-white">编辑列表</h1>
            <p className="mt-1 text-sm text-zinc-500">修改名称和描述不会影响列表内条目。</p>
          </div>
          <CollectionForm collection={collection} />
        </section>
      </div>
    </main>
  );
}
