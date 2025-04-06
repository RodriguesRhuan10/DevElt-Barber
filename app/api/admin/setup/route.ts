import { NextResponse } from "next/server"
import { db } from "@/app/_lib/prisma"

export async function GET() {
  try {
    const adminEmail = "admin@admin10.com"

    const updatedUser = await db.user.update({
      where: {
        email: adminEmail,
      },
      data: {
        role: "ADMIN",
      },
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Usuário definido como administrador com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao definir usuário como administrador" },
      { status: 500 }
    )
  }
} 