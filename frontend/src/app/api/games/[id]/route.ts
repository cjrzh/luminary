import { NextRequest, NextResponse } from "next/server";
import { gamePatchSchema, toGamePrismaUpdateData } from "@/lib/games";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const game = await prisma.gameItem.findUnique({ where: { id } });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = gamePatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const game = await prisma.gameItem.update({
      where: { id },
      data: toGamePrismaUpdateData(parsed.data),
    });
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await prisma.gameItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
}
