"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { AuthLayout } from "@/app/_components/auth-layout"
import { Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciais inválidas")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setError("Ocorreu um erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais para continuar"
      footerText="Não tem uma conta?"
      footerLinkText="Registre-se"
      footerLinkHref="/register"
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
              Entrando...
            </div>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </AuthLayout>
  )
} 