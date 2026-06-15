import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/api/auth/signin"); // We'll use the default sign in page for now
  }

  // Find the user ID based on email since JWT might not have the ID if we didn't log in recently
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/api/auth/signin");
  }

  const userId = user.id;

  // Fetch real data for the dashboard
  const lastPeriod = await prisma.periodLog.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const lastSleep = await prisma.sleepLog.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const lastMood = await prisma.moodLog.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const insights = await prisma.insight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  // Calculate some basic mock stats using the real data if available
  // E.g., if we have a last period date, we can calculate days since then
  const daysSincePeriod = lastPeriod 
    ? Math.floor((new Date().getTime() - new Date(lastPeriod.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <DashboardClient 
      user={user} 
      lastPeriod={lastPeriod} 
      lastSleep={lastSleep} 
      lastMood={lastMood} 
      insights={insights}
      daysSincePeriod={daysSincePeriod}
    />
  );
}
