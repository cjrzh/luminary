'use client';

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteItemButton({ id, endpoint = "/api/items", redirectTo = "/" }: { id: string; endpoint?: string; redirectTo?: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm("确定删除这个条目？")) return;
    const response = await fetch(endpoint + "/" + id, { method: "DELETE" });
    if (response.ok) router.push(redirectTo);
  }
  return <Button variant="secondary" onClick={remove}><Trash2 size={16} />删除</Button>;
}
