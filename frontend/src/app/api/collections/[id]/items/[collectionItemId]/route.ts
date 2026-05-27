import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; collectionItemId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id, collectionItemId } = await params;

  const result = await prisma.collectionItem.deleteMany({
    where: { id: collectionItemId, collectionId: id },
  });

  if (!result.count) {
    return NextResponse.json({ error: "Collection item not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
