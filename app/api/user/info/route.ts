import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
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

    const { name, email, phoneNumber, image } = await request.json()

    // Busca o usuário atual para manter os dados existentes
    const currentUser = await db.user.findUnique({
      where: {
        id: session.user.id
      }
    })

    if (!currentUser) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Se email for fornecido, verifica se já está em uso
    if (email && email !== currentUser.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email,
          NOT: {
            id: session.user.id
          }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: "Este email já está em uso" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name || currentUser.name,
        email: email || currentUser.email,
        phoneNumber: phoneNumber || currentUser.phoneNumber,
        image: image !== undefined ? image : currentUser.image,
      },
    })

    return NextResponse.json({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        image: updatedUser.image,
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 