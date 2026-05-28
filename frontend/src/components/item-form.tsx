'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Download, ImagePlus, Search, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { GAME_PURCHASE_STATUS_LABELS, MEDIA_TYPE_LABELS, PLEX_STATUS_LABELS, WATCH_STATUS_LABELS, gamePurchaseStatuses, mediaTypes, plexStatuses, watchStatuses } from "@/lib/media";
import { parseJsonArray } from "@/lib/utils";
import type { GameItemView, MediaItemView } from "@/lib/types";

function dateValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function splitGenres(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

const ratingLabels = ["很差", "较差", "还行", "推荐", "力荐"];
const gamePlatformOptions = ["PS5", "Steam", "Switch"] as const;

function StarRatingInput({ defaultValue }: { defaultValue?: number | null }) {
  const [rating, setRating] = useState(defaultValue ?? 0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const previewRating = hoverRating ?? rating;
  const label = previewRating > 0 ? ratingLabels[Math.ceil(previewRating / 2) - 1] : "未评分";

  return (
    <div className="space-y-2">
      <input type="hidden" name="myRating" value={rating ? String(rating) : ""} />
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(null)}
          aria-label="评分"
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const fill = Math.max(0, Math.min(2, previewRating - (star - 1) * 2)) * 50;

            return (
              <span key={star} className="relative h-8 w-8 text-[32px] leading-8">
                <span className="absolute inset-0 text-zinc-700">★</span>
                <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-300" style={{ width: `${fill}%` }}>
                  ★
                </span>
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  aria-label={`${star - 0.5} 星`}
                  onMouseEnter={() => setHoverRating(star * 2 - 1)}
                  onFocus={() => setHoverRating(star * 2 - 1)}
                  onBlur={() => setHoverRating(null)}
                  onClick={() => setRating(star * 2 - 1)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  aria-label={`${star} 星`}
                  onMouseEnter={() => setHoverRating(star * 2)}
                  onFocus={() => setHoverRating(star * 2)}
                  onBlur={() => setHoverRating(null)}
                  onClick={() => setRating(star * 2)}
                />
              </span>
            );
          })}
        </div>
        <span className="min-w-24 text-sm text-zinc-300">
          {previewRating ? `${label} · ${previewRating}/10` : label}
        </span>
      </div>
      {rating ? (
        <button type="button" className="text-xs text-zinc-500 hover:text-zinc-300" onClick={() => setRating(0)}>
          清除评分
        </button>
      ) : null}
    </div>
  );
}

export function ItemForm({
  item,
  kind = "media",
  onDone,
  formId,
  hideActions = false,
  redirectTo,
}: {
  item?: MediaItemView | GameItemView;
  kind?: "media" | "game";
  onDone?: () => void;
  formId?: string;
  hideActions?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverPath, setCoverPath] = useState(item?.coverLocalPath ?? "");
  const [coverPreviewError, setCoverPreviewError] = useState(false);
  const [mediaType, setMediaType] = useState(kind === "media" && item && "mediaType" in item ? item.mediaType : "MOVIE");
  const isGame = kind === "game";
  const game = isGame ? item as GameItemView | undefined : undefined;
  const mediaItem = !isGame ? item as MediaItemView | undefined : undefined;

  async function uploadCover(file: File) {
    if (file.size === 0) {
      return coverPath;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    const response = await fetch("/api/uploads/cover", {
      method: "POST",
      body: uploadData,
    });
    setUploading(false);

    if (!response.ok) {
      throw new Error("封面上传失败，请确认图片格式和大小。");
    }

    const result = (await response.json()) as { path: string };
    setCoverPreviewError(false);
    setCoverPath(result.path);
    return result.path;
  }

  async function importCoverUrl() {
    const sourceUrl = coverPath.trim();
    if (!sourceUrl) {
      setError("请先填写图片 URL。");
      return coverPath;
    }

    setUploading(true);
    const response = await fetch("/api/uploads/cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: sourceUrl }),
    });
    setUploading(false);

    if (!response.ok) {
      throw new Error("图片 URL 导入失败，请确认地址可访问且格式为 JPG、PNG、WebP 或 GIF。");
    }

    const result = (await response.json()) as { path: string };
    setCoverPreviewError(false);
    setCoverPath(result.path);
    return result.path;
  }

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    setSuccess(false);

    let nextCoverPath = coverPath;
    const coverFile = formData.get("coverFile");

    try {
      if (coverFile instanceof File && coverFile.size > 0) {
        nextCoverPath = await uploadCover(coverFile);
      }
    } catch (uploadError) {
      setSaving(false);
      setError(uploadError instanceof Error ? uploadError.message : "封面上传失败。");
      return;
    }

    const data = {
      title: String(formData.get("title") || ""),
      mediaType: String(formData.get("mediaType") || "MOVIE"),
      status: String(formData.get("status") || "WANT"),
      originalTitle: String(formData.get("originalTitle") || ""),
      coverLocalPath: nextCoverPath,
      sourceUrl: String(formData.get("sourceUrl") || ""),
      description: String(formData.get("description") || ""),
      releaseYear: String(formData.get("releaseYear") || ""),
      genres: splitGenres(String(formData.get("genres") || "")),
      myRating: String(formData.get("myRating") || ""),
      myReview: String(formData.get("myReview") || ""),
      watchedAt: String(formData.get("watchedAt") || ""),
      playedAt: String(formData.get("watchedAt") || ""),
      imdbId: String(formData.get("imdbId") || ""),
      tmdbId: String(formData.get("tmdbId") || ""),
      bangumiId: String(formData.get("bangumiId") || ""),
      igdbId: String(formData.get("igdbId") || ""),
      malId: String(formData.get("malId") || ""),
      isbn: String(formData.get("isbn") || ""),
      plexRatingKey: String(formData.get("plexRatingKey") || ""),
      plexStatus: String(formData.get("plexStatus") || "") || null,
      purchaseStatus: String(formData.get("gamePurchaseStatus") || "") || null,
      primaryPlatform: String(formData.get("gamePrimaryPlatform") || ""),
      ownedPlatforms: formData.getAll("gameOwnedPlatforms").map((value) => String(value)).filter(Boolean),
      normalPriceCny: String(formData.get("gameNormalPriceCny") || ""),
      steamAppId: String(formData.get("steamAppId") || ""),
      psnTitleId: String(formData.get("psnTitleId") || ""),
      psnConceptId: String(formData.get("psnConceptId") || ""),
      switchTitleId: String(formData.get("switchTitleId") || ""),
      playtimeForeverMinutes: String(formData.get("playtimeForeverMinutes") || ""),
      playtime2WeeksMinutes: String(formData.get("playtime2WeeksMinutes") || ""),
      lastPlayedAt: String(formData.get("lastPlayedAt") || ""),
      externalIds: String(formData.get("gameExternalIds") || ""),
      extraData: String(formData.get("extraData") || ""),
    };

    const endpoint = isGame ? "/api/games" : "/api/items";
    const response = await fetch(item ? endpoint + "/" + item.id : endpoint, {
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
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 3200);
    router.refresh();
    onDone?.();
    if (redirectTo) router.push(redirectTo);
    else if (!item) router.push((isGame ? "/games/" : "/media/") + saved.id);
    setSaving(false);
  }

  return (
    <>
    <form id={formId} action={onSubmit} className="space-y-5">
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
        {!isGame ? (
          <div className="space-y-2">
            <Label htmlFor="mediaType">媒体类型 *</Label>
            <Select id="mediaType" name="mediaType" value={mediaType} onChange={(event) => setMediaType(event.target.value as typeof mediaType)} required>
              {mediaTypes.map((type) => <option key={type} value={type}>{MEDIA_TYPE_LABELS[type]}</option>)}
            </Select>
          </div>
        ) : null}
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
          <StarRatingInput defaultValue={item?.myRating} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="watchedAt">{isGame ? "通关日期" : "完成日期"}</Label>
          <Input id="watchedAt" name="watchedAt" type="date" defaultValue={dateValue(isGame ? game?.playedAt : mediaItem?.watchedAt)} />
        </div>
        {!isGame ? (
          <div className="space-y-2">
            <Label htmlFor="plexStatus">Plex 状态</Label>
            <Select id="plexStatus" name="plexStatus" defaultValue={mediaItem?.plexStatus ?? ""}>
              <option value="">未关联</option>
              {plexStatuses.map((status) => <option key={status} value={status}>{PLEX_STATUS_LABELS[status]}</option>)}
            </Select>
          </div>
        ) : null}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="genres">类型标签</Label>
          <Input id="genres" name="genres" defaultValue={parseJsonArray(item?.genres).join(", ")} placeholder="科幻, 剧情" />
        </div>
        {isGame ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="gamePurchaseStatus">购买状态</Label>
              <Select id="gamePurchaseStatus" name="gamePurchaseStatus" defaultValue={game?.purchaseStatus ?? "NOT_PURCHASED"}>
                {gamePurchaseStatuses.map((status) => <option key={status} value={status}>{GAME_PURCHASE_STATUS_LABELS[status]}</option>)}
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>游戏平台</Label>
              <div className="flex flex-wrap gap-2">
                {gamePlatformOptions.map((platform) => (
                  <label key={platform} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-zinc-950/70 px-3 text-sm text-zinc-100 transition hover:border-amber-300/50">
                    <input
                      type="checkbox"
                      name="gameOwnedPlatforms"
                      value={platform}
                      defaultChecked={parseJsonArray(game?.ownedPlatforms).includes(platform)}
                      className="h-4 w-4 accent-amber-300"
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameNormalPriceCny">日常价格（人民币）</Label>
              <Input id="gameNormalPriceCny" name="gameNormalPriceCny" type="number" min="0" step="0.01" defaultValue={game?.normalPriceCny ?? ""} placeholder="非折扣价" />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>已拥有平台</Label>
              <div className="flex flex-wrap gap-2">
                {gamePlatformOptions.map((platform) => (
                  <label key={platform} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-zinc-950/70 px-3 text-sm text-zinc-100 transition hover:border-amber-300/50">
                    <input
                      type="radio"
                      name="gamePrimaryPlatform"
                      value={platform}
                      defaultChecked={game?.primaryPlatform === platform}
                      className="h-4 w-4 accent-amber-300"
                    />
                    {platform}
                  </label>
                ))}
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-zinc-950/70 px-3 text-sm text-zinc-100 transition hover:border-amber-300/50">
                  <input type="radio" name="gamePrimaryPlatform" value="" defaultChecked={!game?.primaryPlatform} className="h-4 w-4 accent-amber-300" />
                  未购买
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="steamAppId">Steam App ID</Label>
              <Input id="steamAppId" name="steamAppId" defaultValue={game?.steamAppId ?? ""} placeholder="例如 1174180" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="psnTitleId">PSN Title ID</Label>
              <Input id="psnTitleId" name="psnTitleId" defaultValue={game?.psnTitleId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="switchTitleId">Switch Title ID</Label>
              <Input id="switchTitleId" name="switchTitleId" defaultValue={game?.switchTitleId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="psnConceptId">PSN Concept ID</Label>
              <Input id="psnConceptId" name="psnConceptId" defaultValue={game?.psnConceptId ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playtimeForeverMinutes">总游玩时长（分钟）</Label>
              <Input id="playtimeForeverMinutes" name="playtimeForeverMinutes" type="number" min="0" step="1" defaultValue={game?.playtimeForeverMinutes ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playtime2WeeksMinutes">近两周时长（分钟）</Label>
              <Input id="playtime2WeeksMinutes" name="playtime2WeeksMinutes" type="number" min="0" step="1" defaultValue={game?.playtime2WeeksMinutes ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastPlayedAt">最后游玩时间</Label>
              <Input id="lastPlayedAt" name="lastPlayedAt" type="date" defaultValue={dateValue(game?.lastPlayedAt)} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="gameExternalIds">游戏外部 ID JSON</Label>
              <Input id="gameExternalIds" name="gameExternalIds" defaultValue={game?.externalIds ?? ""} placeholder='{"steam":"1174180","psn":"..."}' />
            </div>
          </>
        ) : null}
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="sourceUrl">来源 URL</Label>
          <Input id="sourceUrl" name="sourceUrl" defaultValue={item?.sourceUrl ?? ""} placeholder="豆瓣、IMDb、TMDB 等条目页面 URL" />
        </div>
        <div className="space-y-3 md:col-span-3">
          <Label htmlFor="coverLocalPath">封面图片</Label>
          <div className="grid gap-3 md:grid-cols-[140px_1fr]">
            <div className="aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-zinc-950">
              {coverPath && !coverPreviewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPath} alt="封面预览" className="h-full w-full object-cover" onError={() => setCoverPreviewError(true)} />
              ) : coverPreviewError ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-xs text-zinc-500">
                  <ImagePlus size={22} />
                  远程图片无法直连预览，请点击导入 URL
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-zinc-500">
                  <ImagePlus size={22} />
                  暂无封面
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Input id="coverLocalPath" name="coverLocalPath" value={coverPath} onChange={(event) => { setCoverPreviewError(false); setCoverPath(event.target.value); }} placeholder="上传图片后自动填入，也可填写图片 URL" />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="coverFile" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-zinc-100" />
                <Button variant="secondary" disabled={uploading} onClick={async () => {
                  const input = document.getElementById("coverFile") as HTMLInputElement | null;
                  const file = input?.files?.[0];
                  if (!file) {
                    setError("请先选择一张图片。");
                    return;
                  }
                  try {
                    setError(null);
                    await uploadCover(file);
                    input.value = "";
                  } catch (uploadError) {
                    setError(uploadError instanceof Error ? uploadError.message : "封面上传失败。");
                  }
                }}>
                  <Upload size={16} />{uploading ? "上传中" : "上传"}
                </Button>
                <Button variant="secondary" disabled={uploading} onClick={async () => {
                  try {
                    setError(null);
                    await importCoverUrl();
                  } catch (uploadError) {
                    setError(uploadError instanceof Error ? uploadError.message : "图片 URL 导入失败。");
                  }
                }}>
                  <Download size={16} />导入 URL
                </Button>
              </div>
              <p className="text-xs text-zinc-500">支持本地上传或从图片 URL 导入 JPG、PNG、WebP、GIF，最大 5MB。</p>
            </div>
          </div>
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

      {!isGame ? (
        <div className="grid gap-4 md:grid-cols-6">
          {["imdbId", "tmdbId", "bangumiId", "igdbId", "malId", "isbn"].map((field) => (
            <div className="space-y-2" key={field}>
              <Label htmlFor={field}>{field}</Label>
              <Input id={field} name={field} defaultValue={(mediaItem?.[field as keyof MediaItemView] as string | null) ?? ""} />
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {!isGame ? (
          <div className="space-y-2">
            <Label htmlFor="plexRatingKey">plexRatingKey</Label>
            <Input id="plexRatingKey" name="plexRatingKey" defaultValue={mediaItem?.plexRatingKey ?? ""} />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="extraData">extraData JSON</Label>
          <Input id="extraData" name="extraData" defaultValue={item?.extraData ?? ""} />
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!hideActions ? (
        <div className="flex justify-end gap-2">
          {onDone ? <Button variant="ghost" onClick={onDone}><X size={16} />取消</Button> : null}
          <Button type="submit" disabled={saving || uploading}><Save size={16} />{saving ? "保存中" : "保存"}</Button>
        </div>
      ) : null}
    </form>
    {success ? (
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-lg border border-emerald-300/40 bg-emerald-500 px-5 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-950/40">
        <CheckCircle2 size={26} />
        保存成功，条目已更新
      </div>
    ) : null}
    </>
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

export function NewGameDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>新建游戏</Button>
      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-5xl rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-50">新建游戏</h2>
              <Button variant="ghost" onClick={() => setOpen(false)} aria-label="关闭"><X size={18} /></Button>
            </div>
            <ItemForm kind="game" onDone={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
