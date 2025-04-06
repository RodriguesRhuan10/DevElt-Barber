import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

export async function GET() {
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
        email: true,
      },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 403 }
      )
    }

    // Lista de emails de administradores
    const adminEmails = ["davidsoonzk@gmail.com"] // Email correto do admin

    // Atualiza os cargos
    const updates = await Promise.all([
      // Define os usuários específicos como ADMIN
      ...adminEmails.map(email =>
        db.user.update({
          where: { email },
          data: { role: "ADMIN" },
        })
      ),
      
      // Reseta todos os outros usuários para USER se não forem BARBER
      db.user.updateMany({
        where: {
          email: { notIn: adminEmails },
          role: "ADMIN",
        },
        data: { role: "USER" },
      }),
    ])

    return NextResponse.json({
      message: "Cargos atualizados com sucesso",
      updates
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 