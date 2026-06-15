import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Prisma handles cascading deletes if configured in schema,
    // otherwise we need to delete related records first or trust prisma cascading if it was defined.
    // Let's delete the user. Prisma's SQLite with onDelete: Cascade handles the rest if configured.
    // If not, we do it manually to be safe.
    
    await prisma.$transaction([
      prisma.periodLog.deleteMany({ where: { userId } }),
      prisma.symptomLog.deleteMany({ where: { userId } }),
      prisma.sleepLog.deleteMany({ where: { userId } }),
      prisma.moodLog.deleteMany({ where: { userId } }),
      prisma.journalEntry.deleteMany({ where: { userId } }),
      prisma.cycleData.deleteMany({ where: { userId } }),
      prisma.insight.deleteMany({ where: { userId } }),
      prisma.userSettings.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ message: "Account and all data deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
