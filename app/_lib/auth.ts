import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import { db } from "./prisma"
import { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { User } from "next-auth"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas")
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            image: true,
            phoneNumber: true,
          }
        })

        if (!user) {
          throw new Error("Usuário não encontrado")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Senha incorreta")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          phoneNumber: user.phoneNumber,
        } as User
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.image = user.image
        token.phoneNumber = user.phoneNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.image = token.image as string | null
        session.user.phoneNumber = token.phoneNumber as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXT_AUTH_SECRET,
}
