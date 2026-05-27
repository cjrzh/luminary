'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

type CollectionFormProps = {
  collection?: { id: string; name: string; description: string | null };
};

export function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    const response = await fetch(collection ? "/api/collections/" + collection.id : "/api/collections", {
      method: collection ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") || ""),
        description: String(formData.get("description") || ""),
      }),
    });

    setSaving(false);

    if (!response.ok) {
      setError("保存失败，请检查列表名称。");
      return;
    }

    const saved = await response.json();
    router.push("/collections/" + saved.id);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">列表名称 *</Label>
        <Input id="name" name="name" defaultValue={collection?.name ?? ""} required placeholder="例如：近期优先观看" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea id="description" name="description" defaultValue={collection?.description ?? ""} placeholder="这个列表的用途、选择标准或备注" />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.back()}><X size={16} />取消</Button>
        <Button type="submit" disabled={saving}><Save size={16} />{saving ? "保存中" : "保存"}</Button>
      </div>
    </form>
  );
}
