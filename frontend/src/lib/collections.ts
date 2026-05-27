import { Prisma } from "@prisma/client";
import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().trim().optional(),
);

export const collectionInputSchema = z.object({
  name: z.string().trim().min(1, "列表名称不能为空"),
  description: optionalText,
});

export type CollectionInput = z.infer<typeof collectionInputSchema>;

export function toCollectionData(input: CollectionInput): Prisma.CollectionCreateInput {
  return {
    name: input.name,
    description: input.description,
  };
}

export function toCollectionUpdateData(input: Partial<CollectionInput>): Prisma.CollectionUpdateInput {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
  };
}
