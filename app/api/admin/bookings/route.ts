import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const barbershopId = searchParams.get("barbershopId")

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

    const bookings = await db.booking.findMany({
      where: barbershopId ? {
        service: {
          barbershopId: barbershopId
        }
      } : undefined,
      orderBy: {
        date: "desc",
      },
      include: {
        service: {
          include: {
            barbershop: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 