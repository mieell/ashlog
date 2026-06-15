import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        date: new Date(body.date || Date.now()),
        content: body.content || "",
        moodTag: body.moodTag || null,
        symptomTag: body.symptomTag || null,
        isPrivate: true,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 });
  }
}
