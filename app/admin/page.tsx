"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { toast } from "sonner"
import { Badge } from "../_components/ui/badge"
import { Calendar, Clock, Mail, MessageCircle, Phone, User, Users } from "lucide-react"
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

  useEffect(() => {
    if (!sessionData?.user) {
      return router.push("/")
    }

    const fetchData = async () => {
      try {
        const [bookingsResponse, usersResponse] = await Promise.all([
          fetch("/api/admin/bookings"),
          fetch("/api/users")
        ])

        if (!bookingsResponse.ok || !usersResponse.ok) {
          throw new Error()
        }

        const bookingsData = await bookingsResponse.json()
        const usersData = await usersResponse.json()

        setBookings(bookingsData)
        setUserCount(usersData.length)
      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar dados!")
      }
    }

    fetchData()
  }, [router, sessionData?.user])

  const handleCancelBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error()
      }
      // Atualiza a lista de agendamentos removendo o item cancelado
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== id),
      )
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva!")
    }
  }

  return (
    <>
      <Header />
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/admin/clients")}
          >
            <Users className="h-4 w-4" />
            Clientes
          </Button>
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
              <p className="text-2xl font-bold">5</p>
            </div>
          </Card>
        </div>

        <Card className="space-y-5 p-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Agendamentos</h2>
              <p className="text-sm text-gray-400">Gerencie os agendamentos da barbearia</p>
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
              {bookings.length === 0 ? (
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
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancelar
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