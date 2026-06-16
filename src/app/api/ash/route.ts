import { NextRequest, NextResponse } from "next/server";
import { getAshResponse } from "@/lib/insights";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    }

    const body = await request.json();
    const messages = body.messages || [];
    
    // Extract question from messages array or direct question field
    let question = "";
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      question = lastMessage.content || "";
    } else {
      question = body.question || "";
    }

    // Fallback if no API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Falling back to mock response.");
      const mockContext = {
        lastPeriod: context?.lastPeriod,
        lastSleep: context?.recentSleep?.[0],
        lastMood: context?.recentMood?.[0],
      };
      const response = getAshResponse(question, mockContext);

      return NextResponse.json({
        message: response,
        disclaimer:
          "I provide educational wellness information and not medical advice. For health concerns, please consult a qualified healthcare provider.",
      });
    }

    const systemPrompt = `You are Ash, a compassionate, intelligent wellness assistant for a women's health tracker called AshLog. 
You help the user understand their menstrual cycle, sleep patterns, and mood.
Keep responses concise, empathetic, and actionable. Do not give direct medical diagnoses.
Always add a gentle, encouraging tone.

Context about the user:
Name: ${context?.userName || "User"}
Last Period Log: ${context?.lastPeriod ? JSON.stringify(context.lastPeriod) : "None"}
Recent Sleep Logs (last 7): ${context?.recentSleep ? JSON.stringify(context.recentSleep) : "None"}
Recent Mood Logs (last 7): ${context?.recentMood ? JSON.stringify(context.recentMood) : "None"}

When interpreting their data, be conversational and helpful. Focus on the relationships between their cycle, sleep, and mood.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(question);
    const responseText = result.response.text();

    return NextResponse.json({
      message: responseText,
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

