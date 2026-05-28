'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/field";
import { PLEX_STATUS_LABELS, plexStatuses } from "@/lib/media";
import type { GameItemView, MediaItemView } from "@/lib/types";

const ratingLabels = ["很差", "较差", "还行", "推荐", "力荐"];
const normalStatusLabels: Record<"WANT" | "IN_PROGRESS" | "COMPLETED", string> = {
  WANT: "想看",
  IN_PROGRESS: "在看",
  COMPLETED: "看过",
};
const gameStatusLabels: Record<"WANT" | "IN_PROGRESS" | "COMPLETED", string> = {
  WANT: "想玩",
  IN_PROGRESS: "在玩",
  COMPLETED: "玩过",
};
const editableStatuses = ["WANT", "IN_PROGRESS", "COMPLETED"] as const;
const visibleActionStatuses = ["IN_PROGRESS", "COMPLETED"] as const;

type EditableStatus = (typeof editableStatuses)[number];

function labelForStatus(kind: "media" | "game", status: EditableStatus) {
  return kind === "game" ? gameStatusLabels[status] : normalStatusLabels[status];
}

function StarRatingControl({ value, onChange, compact = false }: { value: number; onChange: (value: number) => void; compact?: boolean }) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const previewRating = hoverRating ?? value;
  const label = previewRating > 0 ? ratingLabels[Math.ceil(previewRating / 2) - 1] : "未评分";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)} aria-label="评分">
          {[1, 2, 3, 4, 5].map((star) => {
            const fill = Math.max(0, Math.min(2, previewRating - (star - 1) * 2)) * 50;
            return (
              <span key={star} className={(compact ? "h-7 w-7 text-[28px] leading-7" : "h-8 w-8 text-[32px] leading-8") + " relative"}>
                <span className="absolute inset-0 text-zinc-700">★</span>
                <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-300" style={{ width: fill + "%" }}>★</span>
                <button type="button" className="absolute inset-y-0 left-0 w-1/2 cursor-pointer" aria-label={star - 0.5 + " 星"} onMouseEnter={() => setHoverRating(star * 2 - 1)} onFocus={() => setHoverRating(star * 2 - 1)} onBlur={() => setHoverRating(null)} onClick={() => onChange(star * 2 - 1)} />
                <button type="button" className="absolute inset-y-0 right-0 w-1/2 cursor-pointer" aria-label={star + " 星"} onMouseEnter={() => setHoverRating(star * 2)} onFocus={() => setHoverRating(star * 2)} onBlur={() => setHoverRating(null)} onClick={() => onChange(star * 2)} />
              </span>
            );
          })}
        </div>
        <span className="min-w-24 text-sm text-zinc-300">{previewRating ? label + " · " + previewRating + "/10" : label}</span>
      </div>
      {value ? <button type="button" className="text-xs text-zinc-500 hover:text-zinc-300" onClick={() => onChange(0)}>清除评分</button> : null}
    </div>
  );
}

function StarRatingDisplay({ value }: { value: number }) {
  if (!value) return <span className="text-sm text-zinc-400">点击评分</span>;

  return (
    <span className="flex items-center gap-0.5" aria-label={"评分 " + value + " 分"}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(2, value - (star - 1) * 2)) * 50;
        return (
          <span key={star} className="relative h-5 w-5 text-[20px] leading-5">
            <span className="absolute inset-0 text-zinc-700">★</span>
            <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-300" style={{ width: fill + "%" }}>★</span>
          </span>
        );
      })}
    </span>
  );
}

export function ItemQuickEdit({ item, kind = "media" }: { item: MediaItemView | GameItemView; kind?: "media" | "game" }) {
  const router = useRouter();
  const initialStatus: EditableStatus = editableStatuses.includes(item.status as EditableStatus) ? item.status as EditableStatus : "WANT";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<EditableStatus>(initialStatus);
  const [rating, setRating] = useState(item.myRating ?? 0);
  const [review, setReview] = useState(item.myReview ?? "");
  const [plexStatus, setPlexStatus] = useState(kind === "media" ? (item as MediaItemView).plexStatus ?? "" : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function openReviewDialog(nextStatus?: EditableStatus, nextRating?: number) {
    if (nextStatus) setStatus(nextStatus);
    if (nextRating !== undefined) setRating(nextRating);
    setError(null);
    setDialogOpen(true);
  }

  async function saveReview() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const response = await fetch((kind === "game" ? "/api/games/" : "/api/items/") + item.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        plexStatus: kind === "game" ? null : plexStatus || null,
        myRating: rating ? String(rating) : "",
        myReview: review,
        watchedAt: status === "COMPLETED" ? new Date().toISOString().slice(0, 10) : kind === "media" ? (item as MediaItemView).watchedAt ?? "" : "",
        playedAt: status === "COMPLETED" ? new Date().toISOString().slice(0, 10) : kind === "game" ? (item as GameItemView).playedAt ?? "" : "",
      }),
    });

    setSaving(false);

    if (!response.ok) {
      setError("保存失败，请检查评分和状态。");
      return;
    }

    setDialogOpen(false);
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 3200);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {visibleActionStatuses.map((nextStatus) => (
            <button
              type="button"
              key={nextStatus}
              onClick={() => openReviewDialog(nextStatus)}
              className={(status === nextStatus ? "border-amber-300 bg-amber-300 text-zinc-950" : "border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20") + " rounded-md border px-4 py-2 text-sm font-medium transition"}
            >
              {labelForStatus(kind, nextStatus)}
            </button>
          ))}
          <span className="ml-0 text-sm text-zinc-500 sm:ml-2">评价：</span>
          <button type="button" onClick={() => openReviewDialog(undefined, rating || 8)} className="inline-flex min-h-8 items-center rounded-md px-2 py-1 hover:bg-white/10">
            <StarRatingDisplay value={rating} />
          </button>
        </div>
        {item.myReview ? <p className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-zinc-300">{item.myReview}</p> : null}
      </div>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-emerald-500/10 px-5 py-4">
              <h3 className="text-lg font-semibold text-emerald-100">添加收藏：{labelForStatus(kind, status)}这部{kind === "game" ? "游戏" : "作品"}</h3>
              <Button variant="ghost" onClick={() => setDialogOpen(false)} aria-label="关闭"><X size={18} /></Button>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="review-status">状态</Label>
                  <Select id="review-status" value={status} onChange={(event) => setStatus(event.target.value as EditableStatus)}>
                    {editableStatuses.map((nextStatus) => <option key={nextStatus} value={nextStatus}>{labelForStatus(kind, nextStatus)}</option>)}
                  </Select>
                </div>
                {kind === "media" ? (
                  <div className="space-y-2">
                    <Label htmlFor="review-plex-status">Plex 状态</Label>
                    <Select id="review-plex-status" value={plexStatus} onChange={(event) => setPlexStatus(event.target.value)}>
                      <option value="">未关联</option>
                      {plexStatuses.map((nextStatus) => <option key={nextStatus} value={nextStatus}>{PLEX_STATUS_LABELS[nextStatus]}</option>)}
                    </Select>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>评分（可选）</Label>
                <StarRatingControl value={rating} onChange={setRating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-text">短评（可选）</Label>
                <Textarea id="review-text" value={review} onChange={(event) => setReview(event.target.value)} maxLength={350} placeholder="写几句你的感受" />
                <div className="text-right text-xs text-zinc-500">{review.length}/350</div>
              </div>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 bg-zinc-900/80 px-5 py-4">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button onClick={saveReview} disabled={saving}>{saving ? "保存中" : "保存"}</Button>
            </div>
          </div>
        </div>
      ) : null}

      {success ? (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-lg border border-emerald-300/40 bg-emerald-500 px-5 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-950/40">
          <CheckCircle2 size={26} />
          保存成功，条目已更新
        </div>
      ) : null}
    </>
  );
}
