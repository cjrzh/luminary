'use client';

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteCollectionButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    if (!window.confirm("确定删除这个列表吗？列表内条目不会被删除。")) return;
    const response = await fetch("/api/collections/" + id, { method: "DELETE" });
    if (!response.ok) {
      alert("删除失败。");
      return;
    }
    router.push("/collections");
    router.refresh();
  }

  return <Button variant="ghost" className="text-red-300 hover:text-red-200" onClick={remove}><Trash2 size={16} />删除</Button>;
}
