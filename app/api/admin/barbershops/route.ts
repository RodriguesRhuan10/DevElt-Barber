import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Verifica se o usuário é admin ou barbeiro
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
      },
    })

    if (!user || !["ADMIN", "BARBER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }

    const barbershops = await db.barbershop.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    })

    return NextResponse.json(barbershops)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 