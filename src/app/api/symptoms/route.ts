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

    const logs = await prisma.symptomLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch symptom logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const log = await prisma.symptomLog.create({
      data: {
        userId: session.user.id,
        date: new Date(body.date || Date.now()),
        symptoms: JSON.stringify(body.symptoms || []),
        timeOfDay: body.timeOfDay || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create symptom log" }, { status: 500 });
  }
}
