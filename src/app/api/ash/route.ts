import { NextRequest, NextResponse } from "next/server";
import { getAshResponse } from "@/lib/insights";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let context: any = null;

    if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (user) {
          const lastPeriod = await prisma.periodLog.findFirst({
            where: { userId: user.id },
            orderBy: { date: "desc" },
          });

          const recentSleep = await prisma.sleepLog.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: 7,
          });

          const recentMood = await prisma.moodLog.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: 7,
          });

          context = { lastPeriod, recentSleep, recentMood, userName: user.name };
        }
      } catch (dbError: any) {
        console.warn("Database unavailable, proceeding without user context:", dbError?.message);
      }
    }

    const body = await request.json();
    const messages = body.messages || [];

    // Extract the latest user question
    let question = "";
    if (Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      question = lastMessage.content || "";
    } else {
      question = body.question || "";
    }

    // Mock fallback helper
    const mockContext = {
      lastPeriod: context?.lastPeriod,
      lastSleep: context?.recentSleep?.[0],
      lastMood: context?.recentMood?.[0],
    };
    const getMockResponse = () =>
      NextResponse.json({
        message: getAshResponse(question, mockContext),
        disclaimer:
          "I provide educational wellness information and not medical advice. For health concerns, please consult a qualified healthcare provider.",
      });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn("GEMINI_API_KEY missing — using mock.");
      return getMockResponse();
    }

    // ── Build Gemini request ──
    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = `You are Ash, a compassionate and intelligent wellness assistant for a women's health tracker called AshLog.
You help the user understand their menstrual cycle, sleep patterns, and mood.
Keep responses concise (2-4 sentences), empathetic, and actionable.
Do not give direct medical diagnoses. Always add a gentle, encouraging tone.
If the user says hi or greets you, respond warmly and ask how they are feeling today.

Context about the user:
Name: ${context?.userName || "User"}
Last Period Log: ${context?.lastPeriod ? JSON.stringify(context.lastPeriod) : "None"}
Recent Sleep (last 7): ${context?.recentSleep ? JSON.stringify(context.recentSleep) : "None"}
Recent Mood (last 7): ${context?.recentMood ? JSON.stringify(context.recentMood) : "None"}

Be conversational and helpful. Focus on the relationships between their cycle, sleep, and mood.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    });

    // ── Simple single-turn call (most reliable) ──
    try {
      const result = await model.generateContent(question);
      const responseText = result.response.text();

      return NextResponse.json({
        message: responseText,
        disclaimer:
          "I provide educational wellness information and not medical advice. For health concerns, please consult a qualified healthcare provider.",
      });
    } catch (geminiError: any) {
      console.error("Gemini API Error:", geminiError?.message || geminiError);
      return getMockResponse();
    }
  } catch (error: any) {
    console.error("Ash API Fatal Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to process your question" },
      { status: 500 }
    );
  }
}
