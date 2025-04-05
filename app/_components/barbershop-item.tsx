import { Barbershop } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { StarIcon, MapPin, Clock } from "lucide-react"
import Link from "next/link"

interface BarbershopItemProps {
  barbershop: Barbershop
}

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition-all hover:border-gray-700 hover:shadow-lg">
      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <Image
          alt={barbershop.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          src={barbershop.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/50 to-transparent" />

        <Badge
          className="absolute left-2 top-2 flex items-center gap-0.5 bg-gray-900/80 px-1 py-0.5 backdrop-blur-sm"
          variant="secondary"
        >
          <StarIcon size={8} className="fill-primary text-primary" />
          <p className="text-[9px] font-medium leading-none">5,0</p>
        </Badge>
      </div>

      <div className="p-1.5">
        <div className="flex items-center justify-between gap-1">
          <h3 className="truncate text-[11px] font-medium text-white">
            {barbershop.name}
          </h3>
          <Badge variant="outline" className="border-primary/20 px-1 py-0 text-[9px] font-normal text-primary">
            Aberto
          </Badge>
        </div>
        
        <div className="mt-0.5 flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[9px] text-gray-400">
            <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
            <p className="truncate leading-none">{barbershop.address}</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-400">
            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
            <p className="truncate leading-none">Seg - Sáb • 9h - 18h</p>
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="mt-1.5 h-6 w-full bg-primary px-2 text-[9px] font-medium leading-none hover:bg-primary/90" 
          asChild
        >
          <Link href={`/barbershops/${barbershop.id}`}>
            Reservar
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default BarbershopItem
