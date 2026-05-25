import { NextRequest, NextResponse } from "next/server";
import { itemInputSchema, getItems, toPrismaData } from "@/lib/items";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = await getItems(query);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = itemInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.mediaItem.create({ data: toPrismaData(parsed.data) });
  return NextResponse.json(item, { status: 201 });
}
