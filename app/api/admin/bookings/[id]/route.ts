import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Busca o agendamento antes de deletar para registrar no log
    const booking = await db.booking.findUnique({
      where: {
        id: params.id,
      },
      include: {
        service: {
          include: {
            barbershop: true,
          },
        },
        user: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }

    // Verifica as permissões do usuário
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        name: true,
      },
    })

    if (!user || !["ADMIN", "BARBER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }

    // Se for barbeiro, verifica se o agendamento pertence à barbearia correta
    if (user.role === "BARBER") {
      const barbershopId = new URL(request.url).searchParams.get("barbershopId")
      
      if (!barbershopId) {
        return NextResponse.json(
          { error: "ID da barbearia não fornecido" },
          { status: 400 }
        )
      }

      if (barbershopId !== booking.service.barbershop.id) {
        return NextResponse.json(
          { error: "Você não tem permissão para cancelar agendamentos desta barbearia" },
          { status: 403 }
        )
      }
    }

    // Formata a data do agendamento
    const formattedDate = format(new Date(booking.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })

    // Primeiro cria o log
    await db.log.create({
      data: {
        action: "CANCEL_BOOKING",
        details: `Agendamento cancelado por ${user.name} (${user.role}): ${booking.service.name} na barbearia ${booking.service.barbershop.name} para o cliente ${booking.user.name} - Data: ${formattedDate}`,
        userId: session.user.id,
      },
    })

    // Depois deleta o agendamento
    await db.booking.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: "Agendamento cancelado com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 