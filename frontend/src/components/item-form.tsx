'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, WATCH_STATUS_LABELS, mediaTypes, plexStatuses, watchStatuses } from "@/lib/media";
import { parseJsonArray } from "@/lib/utils";
import type { MediaItemView } from "@/lib/types";

function dateValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function splitGenres(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function ItemForm({ item, onDone }: { item?: MediaItemView; onDone?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    const data = {
      title: String(formData.get("title") || ""),
      mediaType: String(formData.get("mediaType") || "MOVIE"),
      status: String(formData.get("status") || "WANT"),
      originalTitle: String(formData.get("originalTitle") || ""),
      coverLocalPath: String(formData.get("coverLocalPath") || ""),
      description: String(formData.get("description") || ""),
      releaseYear: String(formData.get("releaseYear") || ""),
      genres: splitGenres(String(formData.get("genres") || "")),
      myRating: String(formData.get("myRating") || ""),
      myReview: String(formData.get("myReview") || ""),
      watchedAt: String(formData.get("watchedAt") || ""),
      imdbId: String(formData.get("imdbId") || ""),
      tmdbId: String(formData.get("tmdbId") || ""),
      bangumiId: String(formData.get("bangumiId") || ""),
      igdbId: String(formData.get("igdbId") || ""),
      malId: String(formData.get("malId") || ""),
      isbn: String(formData.get("isbn") || ""),
      plexRatingKey: String(formData.get("plexRatingKey") || ""),
      plexStatus: String(formData.get("plexStatus") || "") || null,
      extraData: String(formData.get("extraData") || ""),
    };

    const response = await fetch(item ? "/api/items/" + item.id : "/api/items", {
      method: item ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setSaving(false);
      setError("保存失败，请检查必填项和字段格式。");
      return;
    }

    const saved = await response.json();
    router.refresh();
    onDone?.();
    if (!item) router.push("/items/" + saved.id);
    setSaving(false);
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">标题 *</Label>
          <div className="flex gap-2">
            <Input id="title" name="title" defaultValue={item?.title ?? ""} required placeholder="例如：沙丘" />
            <Button variant="secondary" onClick={() => alert("刮削服务未就绪，请手动填写")} aria-label="刮削"><Search size={16} />刮削</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalTitle">原始标题</Label>
          <Input id="originalTitle" name="originalTitle" defaultValue={item?.originalTitle ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mediaType">媒体类型 *</Label>
          <Select id="mediaType" name="mediaType" defaultValue={item?.mediaType ?? "MOVIE"} required>
            {mediaTypes.map((type) => <option key={type} value={type}>{MEDIA_TYPE_LABELS[type]}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">状态 *</Label>
          <Select id="status" name="status" defaultValue={item?.status ?? "WANT"} required>
            {watchStatuses.map((status) => <option key={status} value={status}>{WATCH_STATUS_LABELS[status]}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="releaseYear">年份</Label>
          <Input id="releaseYear" name="releaseYear" type="number" min="0" max="9999" defaultValue={item?.releaseYear ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="myRating">评分</Label>
          <Input id="myRating" name="myRating" type="number" min="1" max="10" step="0.5" defaultValue={item?.myRating ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="watchedAt">完成日期</Label>
          <Input id="watchedAt" name="watchedAt" type="date" defaultValue={dateValue(item?.watchedAt)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plexStatus">Plex 状态</Label>
          <Select id="plexStatus" name="plexStatus" defaultValue={item?.plexStatus ?? ""}>
            <option value="">未关联</option>
            {plexStatuses.map((status) => <option key={status} value={status}>{PLEX_STATUS_LABELS[status]}</option>)}
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="genres">类型标签</Label>
          <Input id="genres" name="genres" defaultValue={parseJsonArray(item?.genres).join(", ")} placeholder="科幻, 剧情" />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="coverLocalPath">封面路径</Label>
          <Input id="coverLocalPath" name="coverLocalPath" defaultValue={item?.coverLocalPath ?? ""} placeholder="/covers/example.jpg 或图片 URL" />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="myReview">短评</Label>
          <Textarea id="myReview" name="myReview" defaultValue={item?.myReview ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="description">简介</Label>
          <Textarea id="description" name="description" defaultValue={item?.description ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        {["imdbId", "tmdbId", "bangumiId", "igdbId", "malId", "isbn"].map((field) => (
          <div className="space-y-2" key={field}>
            <Label htmlFor={field}>{field}</Label>
            <Input id={field} name={field} defaultValue={(item?.[field as keyof MediaItemView] as string | null) ?? ""} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="plexRatingKey">plexRatingKey</Label>
          <Input id="plexRatingKey" name="plexRatingKey" defaultValue={item?.plexRatingKey ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="extraData">extraData JSON</Label>
          <Input id="extraData" name="extraData" defaultValue={item?.extraData ?? ""} />
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="flex justify-end gap-2">
        {onDone ? <Button variant="ghost" onClick={onDone}><X size={16} />取消</Button> : null}
        <Button type="submit" disabled={saving}><Save size={16} />{saving ? "保存中" : "保存"}</Button>
      </div>
    </form>
  );
}

export function NewItemDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>新建条目</Button>
      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-5xl rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-50">新建条目</h2>
              <Button variant="ghost" onClick={() => setOpen(false)} aria-label="关闭"><X size={18} /></Button>
            </div>
            <ItemForm onDone={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
