import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/app/_lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, password, phoneNumber } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      )
    }

    const userExists = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (userExists) {
      return NextResponse.json(
        { message: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
      },
    })

    return NextResponse.json(
      { message: "Usuário criado com sucesso" },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 