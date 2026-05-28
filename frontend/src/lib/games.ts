import { GamePurchaseStatus, Prisma, WatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const optionalText = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().trim().optional(),
);
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().optional(),
);
const optionalDateText = optionalText.refine(
  (value) => !value || !Number.isNaN(new Date(value).getTime()),
  "日期格式无效",
);

export const gameInputSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空"),
  originalTitle: optionalText,
  coverLocalPath: optionalText,
  sourceUrl: optionalText,
  description: optionalText,
  releaseYear: optionalNumber.refine((value) => value === undefined || (Number.isInteger(value) && value >= 0 && value <= 9999), "年份无效"),
  genres: z.array(z.string().trim().min(1)).optional().default([]),
  status: z.nativeEnum(WatchStatus),
  myRating: optionalNumber.refine((value) => value === undefined || (value >= 1 && value <= 10), "评分必须在 1-10 之间"),
  myReview: optionalText,
  playedAt: optionalDateText,
  purchaseStatus: z.nativeEnum(GamePurchaseStatus).optional().nullable(),
  primaryPlatform: optionalText,
  ownedPlatforms: z.array(z.string().trim().min(1)).optional().default([]),
  normalPriceCny: optionalNumber.refine((value) => value === undefined || value >= 0, "游戏价格不能为负数"),
  steamAppId: optionalText,
  psnTitleId: optionalText,
  psnConceptId: optionalText,
  switchTitleId: optionalText,
  playtimeForeverMinutes: optionalNumber.refine((value) => value === undefined || (Number.isInteger(value) && value >= 0), "总游玩时长必须是非负整数"),
  playtime2WeeksMinutes: optionalNumber.refine((value) => value === undefined || (Number.isInteger(value) && value >= 0), "两周游玩时长必须是非负整数"),
  lastPlayedAt: optionalDateText,
  externalIds: optionalText,
  extraData: optionalText,
});

export const gamePatchSchema = gameInputSchema.partial().extend({
  genres: z.array(z.string().trim().min(1)).optional(),
});

export type GameInput = z.infer<typeof gameInputSchema>;
export type GamePatchInput = z.infer<typeof gamePatchSchema>;

export type GameListQuery = {
  status?: string;
  purchaseStatus?: string;
  minRating?: string;
  maxRating?: string;
  releaseYearFrom?: string;
  releaseYearTo?: string;
  genre?: string;
  platform?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: string;
  pageSize?: string;
};

function toDate(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

export function toGamePrismaData(input: GameInput): Prisma.GameItemCreateInput {
  return {
    title: input.title,
    originalTitle: input.originalTitle,
    coverLocalPath: input.coverLocalPath,
    sourceUrl: input.sourceUrl,
    description: input.description,
    releaseYear: input.releaseYear,
    genres: JSON.stringify(input.genres ?? []),
    status: input.status,
    myRating: input.myRating,
    myReview: input.myReview,
    playedAt: toDate(input.playedAt),
    purchaseStatus: input.purchaseStatus || null,
    primaryPlatform: input.primaryPlatform,
    ownedPlatforms: JSON.stringify(input.ownedPlatforms ?? []),
    normalPriceCny: input.normalPriceCny,
    steamAppId: input.steamAppId,
    psnTitleId: input.psnTitleId,
    psnConceptId: input.psnConceptId,
    switchTitleId: input.switchTitleId,
    playtimeForeverMinutes: input.playtimeForeverMinutes,
    playtime2WeeksMinutes: input.playtime2WeeksMinutes,
    lastPlayedAt: toDate(input.lastPlayedAt),
    externalIds: input.externalIds,
    extraData: input.extraData,
  };
}

export function toGamePrismaUpdateData(input: GamePatchInput): Prisma.GameItemUpdateInput {
  const { genres, playedAt, lastPlayedAt, purchaseStatus, ownedPlatforms, ...rest } = input;
  const data: Prisma.GameItemUpdateInput = { ...rest };
  if (genres !== undefined) data.genres = JSON.stringify(genres);
  if (playedAt !== undefined) data.playedAt = toDate(playedAt);
  if (lastPlayedAt !== undefined) data.lastPlayedAt = toDate(lastPlayedAt);
  if (purchaseStatus !== undefined) data.purchaseStatus = purchaseStatus || null;
  if (ownedPlatforms !== undefined) data.ownedPlatforms = JSON.stringify(ownedPlatforms);
  return data;
}

export function buildGameWhere(query: GameListQuery): Prisma.GameItemWhereInput {
  const where: Prisma.GameItemWhereInput = {};

  if (query.status && query.status in WatchStatus) where.status = query.status as WatchStatus;
  if (query.purchaseStatus && query.purchaseStatus in GamePurchaseStatus) where.purchaseStatus = query.purchaseStatus as GamePurchaseStatus;
  if (query.search) {
    where.OR = [{ title: { contains: query.search } }, { originalTitle: { contains: query.search } }];
  }
  if (query.genre) where.genres = { contains: query.genre };
  if (query.platform) where.ownedPlatforms = { contains: query.platform };

  const minRating = Number(query.minRating);
  const maxRating = Number(query.maxRating);
  if (Number.isFinite(minRating) || Number.isFinite(maxRating)) {
    where.myRating = {
      ...(Number.isFinite(minRating) ? { gte: minRating } : {}),
      ...(Number.isFinite(maxRating) ? { lte: maxRating } : {}),
    };
  }

  const from = Number(query.releaseYearFrom);
  const to = Number(query.releaseYearTo);
  if (Number.isFinite(from) || Number.isFinite(to)) {
    where.releaseYear = {
      ...(Number.isFinite(from) ? { gte: from } : {}),
      ...(Number.isFinite(to) ? { lte: to } : {}),
    };
  }

  return where;
}

export async function getGames(query: GameListQuery) {
  const sortFields = ["createdAt", "myRating", "playedAt", "releaseYear", "lastPlayedAt"];
  const sort = sortFields.includes(query.sort ?? "") ? query.sort! : "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";
  const page = Math.max(Number(query.page ?? 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? 20) || 20, 1), 100);
  const where = buildGameWhere(query);

  const [games, total] = await Promise.all([
    prisma.gameItem.findMany({ where, orderBy: { [sort]: order }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.gameItem.count({ where }),
  ]);

  return { games, total, page, pageSize };
}
