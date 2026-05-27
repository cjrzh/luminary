import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { itemId?: string };
  const itemId = body.itemId?.trim();

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  const [collection, item, existing] = await Promise.all([
    prisma.collection.findUnique({ where: { id }, select: { id: true } }),
    prisma.mediaItem.findUnique({ where: { id: itemId }, select: { id: true } }),
    prisma.collectionItem.findUnique({ where: { collectionId_itemId: { collectionId: id, itemId } } }),
  ]);

  if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  if (existing) return NextResponse.json(existing);

  const tail = await prisma.collectionItem.findFirst({
    where: { collectionId: id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const collectionItem = await prisma.collectionItem.create({
    data: {
      collectionId: id,
      itemId,
      sortOrder: (tail?.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(collectionItem, { status: 201 });
}
