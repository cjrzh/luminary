import { MediaType, PlexStatus, Prisma, WatchStatus } from "@prisma/client";
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

export const itemInputSchema = z.object({
  mediaType: z.nativeEnum(MediaType),
  title: z.string().trim().min(1, "标题不能为空"),
  originalTitle: optionalText,
  coverLocalPath: optionalText,
  description: optionalText,
  releaseYear: optionalNumber.refine((value) => value === undefined || (Number.isInteger(value) && value >= 0 && value <= 9999), "年份无效"),
  genres: z.array(z.string().trim().min(1)).optional().default([]),
  status: z.nativeEnum(WatchStatus),
  myRating: optionalNumber.refine((value) => value === undefined || (value >= 1 && value <= 10), "评分必须在 1-10 之间"),
  myReview: optionalText,
  watchedAt: optionalDateText,
  imdbId: optionalText,
  tmdbId: optionalText,
  bangumiId: optionalText,
  igdbId: optionalText,
  malId: optionalText,
  isbn: optionalText,
  plexRatingKey: optionalText,
  plexStatus: z.nativeEnum(PlexStatus).optional().nullable(),
  plexSyncedAt: optionalDateText,
  extraData: optionalText,
});

export const itemPatchSchema = itemInputSchema.partial().extend({
  genres: z.array(z.string().trim().min(1)).optional(),
});

export type ItemInput = z.infer<typeof itemInputSchema>;
export type ItemPatchInput = z.infer<typeof itemPatchSchema>;

export type ItemListQuery = {
  mediaType?: string;
  status?: string;
  plexStatus?: string;
  minRating?: string;
  maxRating?: string;
  releaseYearFrom?: string;
  releaseYearTo?: string;
  genre?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: string;
  pageSize?: string;
};

function toDate(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

export function toPrismaData(input: ItemInput): Prisma.MediaItemCreateInput {
  return {
    ...input,
    genres: JSON.stringify(input.genres ?? []),
    watchedAt: toDate(input.watchedAt),
    plexSyncedAt: toDate(input.plexSyncedAt),
    plexStatus: input.plexStatus || null,
  };
}

export function toPrismaUpdateData(input: ItemPatchInput): Prisma.MediaItemUpdateInput {
  const { genres, watchedAt, plexSyncedAt, plexStatus, ...rest } = input;
  const data: Prisma.MediaItemUpdateInput = { ...rest };
  if (genres !== undefined) data.genres = JSON.stringify(genres);
  if (watchedAt !== undefined) data.watchedAt = toDate(watchedAt);
  if (plexSyncedAt !== undefined) data.plexSyncedAt = toDate(plexSyncedAt);
  if (plexStatus !== undefined) data.plexStatus = plexStatus || null;
  return data;
}

export function buildItemWhere(query: ItemListQuery): Prisma.MediaItemWhereInput {
  const where: Prisma.MediaItemWhereInput = {};

  if (query.mediaType && query.mediaType in MediaType) where.mediaType = query.mediaType as MediaType;
  if (query.status && query.status in WatchStatus) where.status = query.status as WatchStatus;
  if (query.plexStatus && query.plexStatus in PlexStatus) where.plexStatus = query.plexStatus as PlexStatus;
  if (query.search) {
    where.OR = [{ title: { contains: query.search } }, { originalTitle: { contains: query.search } }];
  }
  if (query.genre) where.genres = { contains: query.genre };

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

export async function getItems(query: ItemListQuery) {
  const sortFields = ["createdAt", "myRating", "watchedAt", "releaseYear"];
  const sort = sortFields.includes(query.sort ?? "") ? query.sort! : "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";
  const page = Math.max(Number(query.page ?? 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? 20) || 20, 1), 100);
  const where = buildItemWhere(query);

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({ where, orderBy: { [sort]: order }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.mediaItem.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
