import "next-auth"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    phoneNumber?: string | null
    role: "USER" | "ADMIN" | "BARBER"
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      phoneNumber?: string | null
      role: "USER" | "ADMIN" | "BARBER"
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "USER" | "ADMIN" | "BARBER"
  }
} 