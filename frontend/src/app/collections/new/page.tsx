import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserAccount } from "@/components/auth/user-account";
import { CollectionForm } from "@/components/collections/collection-form";

export default function NewCollectionPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/collections" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} />返回列表</Link>
          <UserAccount />
        </div>
        <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-white">新建列表</h1>
            <p className="mt-1 text-sm text-zinc-500">列表只管理顺序，不覆盖条目的全局状态。</p>
          </div>
          <CollectionForm />
        </section>
      </div>
    </main>
  );
}
