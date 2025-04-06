import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { hash, compare } from "bcryptjs"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Senha atual incorreta" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(newPassword, 10)

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: "Senha atualizada com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 