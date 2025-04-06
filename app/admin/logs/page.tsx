"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../../_components/header"
import { Button } from "../../_components/ui/button"
import { toast } from "sonner"
import { Calendar, Clock, User } from "lucide-react"
import { Card } from "../../_components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../_components/ui/table"
import { Avatar, AvatarFallback } from "../../_components/ui/avatar"

interface Log {
  id: string
  action: string
  details: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

const LogsPage = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/")
    },
  })
  const router = useRouter()
  const [logs, setLogs] = useState<Log[]>([])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/admin/logs")
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao carregar logs")
      }
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao carregar logs")
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchLogs()
      // Atualiza os logs a cada 30 segundos
      const interval = setInterval(fetchLogs, 30000)
      return () => clearInterval(interval)
    }
  }, [status])

  if (status === "loading") {
    return (
      <>
        <Header />
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Logs do Sistema</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => router.push("/admin")}
            >
              Voltar
            </Button>
          </div>
        </div>

        <Card className="space-y-5 p-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Histórico de Cancelamentos</h2>
              <p className="text-sm text-gray-400">Registro de todos os cancelamentos realizados</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <p className="text-sm text-gray-400">Nenhum log encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.filter(log => log.action === "CANCEL_BOOKING").map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(log.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{log.user.name}</p>
                          <p className="text-sm text-gray-400">{log.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{log.details}</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}

export default LogsPage 