'use client';

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  collectionId: string;
  collectionItemId: string;
  isFirst: boolean;
  isLast: boolean;
};

export function CollectionItemActions({ collectionId, collectionItemId, isFirst, isLast }: Props) {
  const router = useRouter();

  async function reorder(direction: "up" | "down") {
    const response = await fetch("/api/collections/" + collectionId + "/items/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionItemId, direction }),
    });

    if (!response.ok) {
      alert("调整顺序失败。");
      return;
    }

    router.refresh();
  }

  async function remove() {
    const response = await fetch("/api/collections/" + collectionId + "/items/" + collectionItemId, { method: "DELETE" });
    if (!response.ok) {
      alert("移出列表失败。");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" className="h-8 w-8 px-0" disabled={isFirst} onClick={() => reorder("up")} aria-label="上移"><ArrowUp size={15} /></Button>
      <Button variant="ghost" className="h-8 w-8 px-0" disabled={isLast} onClick={() => reorder("down")} aria-label="下移"><ArrowDown size={15} /></Button>
      <Button variant="ghost" className="h-8 w-8 px-0 text-zinc-500 hover:text-red-300" onClick={remove} aria-label="移出列表"><X size={15} /></Button>
    </div>
  );
}
