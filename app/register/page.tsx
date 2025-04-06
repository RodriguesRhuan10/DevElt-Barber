"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { AuthLayout } from "@/app/_components/auth-layout"
import { User, Mail, Phone, Lock } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phoneNumber = formData.get("phoneNumber") as string

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao criar conta")
      }

      router.push("/login")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Preencha os dados abaixo para se registrar"
      footerText="Já tem uma conta?"
      footerLinkText="Faça login"
      footerLinkHref="/login"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-300">
            Nome
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome completo"
              className="pl-8 bg-gray-800/50 border-gray-700/75"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-300">
            Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-8 bg-gray-800/50 border-gray-700/75"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">
            Número de Celular
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="(00) 00000-0000"
              className="pl-8 bg-gray-800/50 border-gray-700/75"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-300">
            Senha
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="pl-8 bg-gray-800/50 border-gray-700/75"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando conta...
            </div>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
    </AuthLayout>
  )
} 