import { NextRequest, NextResponse } from "next/server";
import { getAshResponse } from "@/lib/insights";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let context = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const lastPeriod = await prisma.periodLog.findFirst({
          where: { userId: user.id },
          orderBy: { date: "desc" },
        });

        const lastSleep = await prisma.sleepLog.findFirst({
          where: { userId: user.id },
          orderBy: { date: "desc" },
        });

        const lastMood = await prisma.moodLog.findFirst({
          where: { userId: user.id },
          orderBy: { date: "desc" },
        });

        context = { lastPeriod, lastSleep, lastMood };
      }
    }

    const body = await request.json();
    
    // Extract question from messages array or direct question field
    let question = "";
    if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1];
      question = lastMessage.content || "";
    } else {
      question = body.question || "";
    }

    const response = getAshResponse(question, context);

    return NextResponse.json({
      message: response,
      disclaimer:
        "I provide educational wellness information and not medical advice. For health concerns, please consult a qualified healthcare provider.",
    });
  } catch (error) {
    console.error("Ash API Error:", error);
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    );
  }
}

