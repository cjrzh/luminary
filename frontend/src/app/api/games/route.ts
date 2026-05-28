import { NextRequest, NextResponse } from "next/server";
import { gameInputSchema, getGames, toGamePrismaData } from "@/lib/games";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = await getGames(query);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = gameInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const game = await prisma.gameItem.create({ data: toGamePrismaData(parsed.data) });
  return NextResponse.json(game, { status: 201 });
}
