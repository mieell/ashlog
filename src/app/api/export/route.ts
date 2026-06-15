import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Fetch all user data
    const [user, periodLogs, symptomLogs, sleepLogs, moodLogs, journalEntries, cycleData, insights, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, createdAt: true } }),
      prisma.periodLog.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.symptomLog.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.moodLog.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.journalEntry.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.cycleData.findMany({ where: { userId }, orderBy: { startDate: 'asc' } }),
      prisma.insight.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      app: "AshLog",
      user,
      settings,
      data: {
        periodLogs,
        symptomLogs,
        sleepLogs,
        moodLogs,
        journalEntries,
        cycleData,
        insights,
      }
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ashlog_export_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
