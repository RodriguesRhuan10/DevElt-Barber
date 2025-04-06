"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { toast } from "sonner"
import { Badge } from "../_components/ui/badge"
import { Calendar, Clock, Mail, MessageCircle, Phone, User, Users, History } from "lucide-react"
import { Card } from "../_components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../_components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "../_components/ui/avatar"

interface Booking {
  id: string
  date: string
  status: string
  user: {
    name: string
    email: string
    phoneNumber: string | null
    image: string | null
  }
  service: {
    name: string
    price: number
    barbershop: {
      id: string
      name: string
      imageUrl: string
    }
  }
}

const AdminPage = () => {
  const { data: sessionData } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [todayBookings, setTodayBookings] = useState(0)
  const [barbershops, setBarbershops] = useState<{ id: string; name: string; imageUrl: string }[]>([])
  const [selectedBarbershop, setSelectedBarbershop] = useState<string | null>(null)
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null)

  const fetchBarbershops = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/barbershops")
      if (!response.ok) throw new Error("Erro ao carregar barbearias")
      const data = await response.json()
      setBarbershops(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar barbearias")
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      if (!selectedBarbershop) {
        setBookings([])
        setTodayBookings(0)
        return
      }

      // Busca os agendamentos e usuários em paralelo
      const [bookingsResponse, usersResponse] = await Promise.all([
        fetch(`/api/admin/bookings?barbershopId=${selectedBarbershop}`),
        isAdmin ? fetch("/api/users") : null
      ].filter(Boolean) as Promise<Response>[])

      if (!bookingsResponse.ok) throw new Error("Erro ao carregar agendamentos")
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData)

      // Calcula agendamentos de hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayBookings = bookingsData.filter((booking: Booking) => {
        const bookingDate = new Date(booking.date)
        bookingDate.setHours(0, 0, 0, 0)
        return bookingDate.getTime() === today.getTime()
      })
      setTodayBookings(todayBookings.length)

      // Atualiza contagem de usuários se for admin
      if (isAdmin && usersResponse) {
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUserCount(usersData.length)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar dados")
    }
  }, [isAdmin, selectedBarbershop])

  useEffect(() => {
    if (!sessionData?.user) {
      router.push("/")
      return
    }

    const checkPermission = async () => {
      try {
        const response = await fetch("/api/user/role")
        if (response.ok) {
          const { role } = await response.json()
          if (!["ADMIN", "BARBER"].includes(role)) {
            router.push("/")
            toast.error("Acesso não autorizado")
            return
          }
          setIsAdmin(role === "ADMIN")
          fetchBarbershops()
          fetchData()
        } else {
          throw new Error("Erro ao verificar permissões")
        }
      } catch (error) {
        console.error(error)
        router.push("/")
        toast.error("Erro ao verificar permissões")
      }
    }

    checkPermission()

    // Atualiza os dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [sessionData, router, fetchData, fetchBarbershops])

  // Função para formatar o número de telefone e gerar o link do WhatsApp
  const getWhatsAppLink = (booking: Booking) => {
    if (!booking.user.phoneNumber) return ""
    // Remove todos os caracteres não numéricos
    const formattedNumber = booking.user.phoneNumber.replace(/\D/g, "")
    // Adiciona o código do país (55 para Brasil) se não existir
    const numberWithCountry = formattedNumber.startsWith("55") ? formattedNumber : `55${formattedNumber}`
    
    // Formata a data e hora
    const data = format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })
    const hora = format(new Date(booking.date), "HH:mm")
    const valor = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(booking.service.price)

    // Cria a mensagem personalizada
    const message = encodeURIComponent(
      `Olá, ${booking.user.name}! Somos da barbearia ${booking.service.barbershop.name}, ` +
      `o seu serviço ${booking.service.name} na data ${data} e horário ${hora} ` +
      `foi confirmado no valor de ${valor}.`
    )
    
    return `https://wa.me/${numberWithCountry}?text=${message}`
  }

  const handleCancelBooking = async (id: string, barbershopId: string) => {
    if (!barbershopId) {
      toast.error("Selecione uma barbearia primeiro")
      return
    }

    try {
      setCancelingBookingId(id)
      
      const response = await fetch(`/api/admin/bookings/${id}?barbershopId=${barbershopId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar reserva")
      }
      
      // Atualiza a lista de agendamentos removendo o item cancelado
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== id),
      )
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao cancelar reserva!")
    } finally {
      setCancelingBookingId(null)
    }
  }

  return (
    <>
      <Header />
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push("/admin/clients")}
              >
                <Users className="h-4 w-4" />
                Clientes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push("/admin/logs")}
              >
                <History className="h-4 w-4" />
                Logs
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Agendamentos</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Clientes</p>
              <p className="text-2xl font-bold">{userCount}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Hoje</p>
              <p className="text-2xl font-bold">{todayBookings}</p>
            </div>
          </Card>
        </div>

        <Card className="space-y-5 p-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Agendamentos</h2>
              <p className="text-sm text-gray-400">Gerencie os agendamentos da barbearia</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-10 rounded-md border border-gray-800 bg-gray-900 px-3 text-sm text-white"
                value={selectedBarbershop || ""}
                onChange={(e) => setSelectedBarbershop(e.target.value)}
              >
                <option value="" disabled>Selecione uma barbearia</option>
                {barbershops.map((barbershop) => (
                  <option key={barbershop.id} value={barbershop.id}>
                    {barbershop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedBarbershop ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-sm text-gray-400">Selecione uma Barbearia para ver os Serviços</p>
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-sm text-gray-400">Nenhum agendamento encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Badge variant="secondary">Confirmado</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            {booking.user.image ? (
                              <AvatarImage src={booking.user.image} alt={booking.user.name} className="hover:scale-[3] hover:absolute hover:z-50 transition-transform" />
                            ) : (
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.user.name}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span>{booking.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span>{booking.user.phoneNumber || "Não informado"}</span>
                            {booking.user.phoneNumber && (
                              <a
                                href={getWhatsAppLink(booking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-emerald-600 p-1 transition-colors hover:bg-emerald-500"
                              >
                                <MessageCircle className="h-3 w-3 text-white" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{booking.service.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(booking.date), "HH:mm")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">
                        {Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(booking.service.price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id, booking.service.barbershop.id)}
                        disabled={cancelingBookingId === booking.id}
                      >
                        {cancelingBookingId === booking.id ? "Cancelando..." : "Cancelar"}
                      </Button>
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

export default AdminPage 