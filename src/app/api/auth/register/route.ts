import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: `Database Error: ${errorMessage}` }, { status: 500 });
  }
}
