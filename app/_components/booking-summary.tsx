import { format } from "date-fns"
import { Card, CardContent } from "./ui/card"
import { Barbershop, BarbershopService } from "@prisma/client"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Home } from "lucide-react"

interface BookingSummaryProps {
  service: Pick<BarbershopService, "name" | "price">
  barbershop: Pick<Barbershop, "name">
  selectedDate: Date
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card className="border-gray-800 bg-gray-900/50">
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-medium">{service.name}</h2>
            <p className="text-[11px] text-gray-400">{barbershop.name}</p>
          </div>
          <p className="text-sm font-medium text-primary">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <h2 className="text-xs text-gray-400">Data</h2>
            </div>
            <p className="text-xs">
              {format(selectedDate, "d 'de' MMMM", {
                locale: ptBR,
              })}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h2 className="text-xs text-gray-400">Horário</h2>
            </div>
            <p className="text-xs">{format(selectedDate, "HH:mm")}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-400" />
              <h2 className="text-xs text-gray-400">Barbearia</h2>
            </div>
            <p className="text-xs">{barbershop.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
