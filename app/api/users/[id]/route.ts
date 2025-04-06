import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    // Verifica se o usuário é admin
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
      },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Verifica se o usuário que está sendo editado é um admin
    const targetUser = await db.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        role: true,
      },
    })

    if (targetUser?.role === "ADMIN") {
      return NextResponse.json(
        { message: "Não é possível alterar um administrador" },
        { status: 400 }
      )
    }

    // Verifica se está tentando alterar o cargo para BARBER ou USER
    if (data.role && !["BARBER", "USER"].includes(data.role)) {
      return NextResponse.json(
        { message: "Alteração de cargo não permitida" },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        createdAt: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 