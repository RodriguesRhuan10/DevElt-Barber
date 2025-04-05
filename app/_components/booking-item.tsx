"use client"

import { type Prisma } from "@prisma/client"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import Image from "next/image"
import PhoneItem from "./phone-item"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { deleteBooking } from "../_actions/delete-booking"
import { toast } from "sonner"
import { useState } from "react"
import BookingSummary from "./booking-summary"
import { Calendar, Clock, MapPin } from "lucide-react"

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
    }
  }>
}

// TODO: receber agendamento como prop
const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const {
    service: { barbershop },
  } = booking
  const isConfirmed = isFuture(booking.date)
  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }
  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }
  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger className="w-full">
        <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all hover:border-gray-700 hover:shadow-lg">
          <div className="flex items-center justify-between p-4">
            <div className="space-y-2">
              <Badge
                className="w-fit"
                variant={isConfirmed ? "default" : "secondary"}
              >
                {isConfirmed ? "Confirmado" : "Finalizado"}
              </Badge>
              <h3 className="font-semibold text-white">
                {booking.service.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.service.barbershop.imageUrl} />
                </Avatar>
                <p>{booking.service.barbershop.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-custom-dark-50 px-4 py-2">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <p className="capitalize">
                  {format(booking.date, "MMMM", { locale: ptBR })}
                </p>
              </div>
              <p className="text-2xl font-bold text-white">
                {format(booking.date, "dd", { locale: ptBR })}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <p>{format(booking.date, "HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="flex w-[85%] flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">Informações da Reserva</SheetTitle>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto pr-3"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          <div className="relative mt-6 flex h-[180px] w-full items-end">
            <Image
              alt={`Mapa da barbearia ${booking.service.barbershop.name}`}
              src="/map.png"
              fill
              className="rounded-xl object-cover"
            />

            <div className="z-50 mx-5 mb-3 w-full rounded-xl border border-gray-800 bg-gray-900/95 backdrop-blur">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={barbershop.imageUrl} />
                </Avatar>
                <div>
                  <h3 className="font-bold text-white">{barbershop.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <p>{barbershop.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Badge
              className="w-fit"
              variant={isConfirmed ? "default" : "secondary"}
            >
              {isConfirmed ? "Confirmado" : "Finalizado"}
            </Badge>

            <div className="mb-3 mt-6">
              <BookingSummary
                barbershop={barbershop}
                service={booking.service}
                selectedDate={booking.date}
              />
            </div>

            <div className="space-y-3">
              {barbershop.phones.map((phone, index) => (
                <PhoneItem key={index} phone={phone} />
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <div className="flex items-center gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </SheetClose>
            {isConfirmed && (
              <Dialog>
                <DialogTrigger className="w-full">
                  <Button variant="destructive" className="w-full">
                    Cancelar Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle>Você deseja cancelar sua reserva?</DialogTitle>
                    <DialogDescription>
                      Ao cancelar, você perderá sua reserva e não poderá
                      recuperá-la. Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose className="w-full">
                      <Button
                        variant="destructive"
                        onClick={handleCancelBooking}
                        className="w-full"
                      >
                        Confirmar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
