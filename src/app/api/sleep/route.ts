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

    const logs = await prisma.sleepLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sleep logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const bedtime = new Date(body.bedtime);
    const wakeTime = new Date(body.wakeTime);
    const durationMinutes = Math.round((wakeTime.getTime() - bedtime.getTime()) / 60000);

    const log = await prisma.sleepLog.create({
      data: {
        userId: session.user.id,
        date: new Date(body.date || Date.now()),
        bedtime,
        wakeTime,
        durationMinutes: durationMinutes > 0 ? durationMinutes : null,
        quality: body.quality || 3,
        disturbances: JSON.stringify(body.disturbances || []),
        freshness: body.freshness || null,
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create sleep log" }, { status: 500 });
  }
}
