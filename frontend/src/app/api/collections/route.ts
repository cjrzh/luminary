import { NextRequest, NextResponse } from "next/server";
import { collectionInputSchema, toCollectionData } from "@/lib/collections";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const collections = await prisma.collection.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json({ collections });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = collectionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const collection = await prisma.collection.create({ data: toCollectionData(parsed.data) });
  return NextResponse.json(collection, { status: 201 });
}
