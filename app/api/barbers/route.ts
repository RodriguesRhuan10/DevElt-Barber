import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const barbers = await db.user.findMany({
      where: {
        role: "BARBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
      },
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar barbeiros." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { name, email, password, phoneNumber, image } = await request.json();

    // Validações
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const barber = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "BARBER",
        phoneNumber: phoneNumber?.trim(),
        image
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true
      }
    });

    return NextResponse.json(
      { 
        message: "Barbeiro criado com sucesso",
        barber 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar barbeiro:", error);
    return NextResponse.json(
      { error: "Erro ao criar barbeiro." },
      { status: 500 }
    );
  }
} 