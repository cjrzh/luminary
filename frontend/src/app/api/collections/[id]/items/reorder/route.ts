import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { collectionItemId?: string; direction?: "up" | "down" };

  if (!body.collectionItemId || (body.direction !== "up" && body.direction !== "down")) {
    return NextResponse.json({ error: "collectionItemId and direction are required" }, { status: 400 });
  }

  const current = await prisma.collectionItem.findFirst({
    where: { id: body.collectionItemId, collectionId: id },
  });

  if (!current) {
    return NextResponse.json({ error: "Collection item not found" }, { status: 404 });
  }

  const neighbor = await prisma.collectionItem.findFirst({
    where: {
      collectionId: id,
      sortOrder: body.direction === "up" ? { lt: current.sortOrder } : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: body.direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.collectionItem.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.collectionItem.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);

  return NextResponse.json({ ok: true });
}
