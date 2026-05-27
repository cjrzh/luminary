'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";

type Option = {
  id: string;
  title: string;
  releaseYear: number | null;
};

export function AddItemToCollection({ collectionId, items }: { collectionId: string; items: Option[] }) {
  const router = useRouter();
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!itemId) return;
    setSaving(true);
    const response = await fetch("/api/collections/" + collectionId + "/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setSaving(false);

    if (!response.ok) {
      alert("加入列表失败。");
      return;
    }

    router.refresh();
  }

  if (!items.length) {
    return <p className="text-sm text-zinc-500">所有条目都已在这个列表中。</p>;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={itemId} onChange={(event) => setItemId(event.target.value)} aria-label="选择条目">
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}{item.releaseYear ? " (" + item.releaseYear + ")" : ""}
          </option>
        ))}
      </Select>
      <Button onClick={add} disabled={saving || !itemId} className="shrink-0"><Plus size={16} />{saving ? "加入中" : "加入尾部"}</Button>
    </div>
  );
}
