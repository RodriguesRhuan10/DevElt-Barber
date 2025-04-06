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

    // Verifica se o usuário é admin
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
      },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      )
    }

    // Busca os logs de cancelamento ordenados por data
    const logs = await db.log.findMany({
      where: {
        action: "CANCEL_BOOKING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Erro ao buscar logs:", error)
    return NextResponse.json(
      { error: "Erro ao carregar logs do sistema" },
      { status: 500 }
    )
  }
} 