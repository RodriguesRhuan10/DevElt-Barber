"use client"

import { Booking, type Prisma } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { isPast, isToday, set } from "date-fns"
import { createBooking } from "../_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingSummary from "./booking-summary"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ServiceItemProps {
  service: {
    id: string
    name: string
    price: Prisma.Decimal
    description: string
    imageUrl: string
    barbershopId: string
  }
  barbershop: {
    id: string
    name: string
  }
}

const TIME_LIST = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
}

const getTimeList = ({ bookings, selectedDay }: GetTimeListProps) => {
  return TIME_LIST.filter((time) => {
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() === hour &&
        booking.date.getMinutes() === minutes,
    )
    if (hasBookingOnCurrentTime) {
      return false
    }
    return true
  })
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
        barbershopId: barbershop.id
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id, barbershop.id])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime?.split(":")[0]),
      minutes: Number(selectedTime?.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    setSelectedTime(undefined)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      await createBooking({
        serviceId: service.id,
        date: selectedDate,
      })
      handleBookingSheetOpenChange()
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
    })
  }, [dayBookings, selectedDay])

  return (
    <>
      <Card className="overflow-hidden border-gray-800 bg-gray-800/50 transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/80">
        <CardContent className="p-0">
          <div className="flex gap-4">
            {/* IMAGEM */}
            <div className="relative h-[140px] w-[140px]">
              <Image
                alt={service.name}
                src={service.imageUrl}
                fill
                className="object-cover"
              />
            </div>

            {/* CONTEÚDO */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div className="space-y-2">
                <h3 className="text-base font-medium text-white">{service.name}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{service.description}</p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-primary">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(service.price))}
                </p>

                <Sheet
                  open={bookingSheetIsOpen}
                  onOpenChange={handleBookingSheetOpenChange}
                >
                  <Button
                    variant="secondary"
                    className="h-8 rounded-full bg-primary px-4 text-xs font-medium text-white transition-colors hover:bg-primary/80"
                    onClick={handleBookingClick}
                  >
                    Reservar
                  </Button>

                  <SheetContent className="w-full overflow-y-auto border-l border-gray-800 bg-gray-900 p-0 sm:max-w-[440px]">
                    <SheetHeader className="border-b border-gray-800 px-5 py-6">
                      <div className="space-y-1">
                        <SheetTitle className="text-xl font-bold text-white">Fazer Reserva</SheetTitle>
                        <p className="text-sm text-gray-400">Escolha a data e horário para {service.name.toLowerCase()}</p>
                      </div>
                    </SheetHeader>

                    <div className="space-y-6">
                      {/* Calendário */}
                      <div className="border-b border-gray-800 px-5 pb-6 pt-3">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-400">Selecione uma data:</p>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-gray-700 bg-gray-800/50 hover:bg-gray-800">
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-300">
                              {selectedDay ? format(selectedDay, "MMMM 'de' yyyy", { locale: ptBR }) : "Selecione"}
                            </span>
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-gray-700 bg-gray-800/50 hover:bg-gray-800">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={selectedDay}
                          onSelect={handleDateSelect}
                          fromDate={new Date()}
                          className="w-full"
                          classNames={{
                            head_cell: "text-xs font-medium text-gray-400",
                            cell: "text-center text-sm p-0 relative h-9 w-9",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-800",
                            day_today: "bg-gray-800 text-primary font-semibold",
                            day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                            nav_button: "h-8 w-8 rounded-full border-gray-700 bg-gray-800/50 hover:bg-gray-800",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                          }}
                        />
                      </div>

                      {/* Horários */}
                      {selectedDay && (
                        <div className="border-b border-gray-800 px-5 pb-6">
                          <p className="mb-3 text-sm font-medium text-gray-400">Horários disponíveis:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {timeList.length > 0 ? (
                              timeList.map((time) => (
                                <Button
                                  key={time}
                                  variant="outline"
                                  className={`h-9 rounded-full border-gray-700 text-xs font-medium ${
                                    selectedTime === time
                                      ? "border-primary bg-primary text-white hover:bg-primary/90"
                                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-800"
                                  }`}
                                  onClick={() => handleTimeSelect(time)}
                                >
                                  {time}
                                </Button>
                              ))
                            ) : (
                              <p className="col-span-4 text-center text-sm text-gray-400">
                                Nenhum horário disponível neste dia.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Resumo */}
                      {selectedDate && (
                        <div className="space-y-4 px-5 pb-6">
                          <BookingSummary
                            selectedDate={selectedDate}
                            service={service}
                            barbershop={barbershop}
                          />

                          <Button
                            className="w-full rounded-full bg-primary font-medium text-white transition-colors hover:bg-primary/90"
                            onClick={handleCreateBooking}
                          >
                            Confirmar Reserva
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="border-gray-800 bg-gray-900 text-white">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
