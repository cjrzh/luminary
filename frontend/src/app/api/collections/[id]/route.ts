import { NextRequest, NextResponse } from "next/server";
import { collectionInputSchema, toCollectionUpdateData } from "@/lib/collections";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { items: { include: { item: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = collectionInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const collection = await prisma.collection.update({ where: { id }, data: toCollectionUpdateData(parsed.data) });
    return NextResponse.json(collection);
  } catch {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
}
