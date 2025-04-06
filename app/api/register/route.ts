import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/app/_lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function POST(request: Request) {
  try {
    // Validar o corpo da requisição
    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json(
        { message: "Corpo da requisição inválido" },
        { status: 400 }
      )
    }

    const { name, email, password, phoneNumber } = body

    // Validações mais detalhadas
    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json(
        { message: "Email inválido" },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    try {
      const userExists = await db.user.findUnique({
        where: { email },
        select: { id: true }
      })

      if (userExists) {
        return NextResponse.json(
          { message: "Email já cadastrado" },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error("Erro ao verificar usuário existente:", error)
      return NextResponse.json(
        { message: "Erro ao verificar disponibilidade do email" },
        { status: 500 }
      )
    }

    // Criar o usuário
    try {
      const hashedPassword = await hash(password, 10)

      const user = await db.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          phoneNumber: phoneNumber?.trim(),
          role: "USER"
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })

      return NextResponse.json(
        {
          message: "Usuário criado com sucesso",
          user
        },
        { status: 201 }
      )
    } catch (error) {
      // Log detalhado do erro
      console.error("Erro detalhado ao criar usuário:", {
        error,
        name: error instanceof Error ? error.name : 'Unknown Error',
        message: error instanceof Error ? error.message : 'Unknown Error',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Tratamento específico para erros do Prisma
      if (error instanceof PrismaClientKnownRequestError) {
        return NextResponse.json(
          { 
            message: "Erro ao criar usuário no banco de dados",
            code: error.code,
            meta: error.meta
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          message: "Erro ao criar usuário",
          details: error instanceof Error ? error.message : "Erro desconhecido"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    // Log do erro geral
    console.error("Erro geral na rota de registro:", error)
    
    return NextResponse.json(
      { 
        message: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
} 