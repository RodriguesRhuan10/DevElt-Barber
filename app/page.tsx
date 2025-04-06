import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { db } from "./_lib/prisma"
import { quickSearchOptions } from "./_constants/search"
import BookingItem from "./_components/booking-item"
import Search from "./_components/search"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getConfirmedBookings } from "./_data/get-confirmed-bookings"
import { Badge } from "./_components/ui/badge"
import { Star } from "lucide-react"

const Home = async () => {
  const session = await getServerSession(authOptions)
  const barbershops = await db.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  })
  const confirmedBookings = await getConfirmedBookings()

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="space-y-2 px-4 pb-2 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-white">
              Olá, {session?.user ? session.user.name : "bem vindo"}!
            </h2>
            <p className="text-[10px] text-gray-400">
              <span className="capitalize">
                {format(new Date(), "EEEE, dd", { locale: ptBR })}
              </span>
              <span>&nbsp;de&nbsp;</span>
              <span className="capitalize">
                {format(new Date(), "MMMM", { locale: ptBR })}
              </span>
            </p>
          </div>

          <div className="w-56">
            <Search />
          </div>
        </div>

        {/* Busca Rápida */}
        <div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {quickSearchOptions.map((option) => (
              <Button
                className="flex items-center gap-1.5 whitespace-nowrap bg-custom-dark px-2.5 py-1.5 text-[10px] font-medium hover:bg-custom-dark-80"
                variant="secondary"
                key={option.title}
                asChild
              >
                <Link href={`/barbershops?service=${option.title}`}>
                  <Image
                    src={option.imageUrl}
                    width={12}
                    height={12}
                    alt={option.title}
                    className="h-3 w-3"
                  />
                  {option.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="relative h-[100px] w-full overflow-hidden rounded-lg">
          <Image
            alt="Agende nos melhores com DevElt Barbearia"
            src="/banner-01.jpeg"
            fill
            className="object-cover"
            priority
          />
        </div>

        {confirmedBookings.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Seus Agendamentos</h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Barbearias */}
        <div className="mt-6 rounded-2xl bg-custom-dark p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between border-b border-gray-700/40 pb-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Barbearias</h3>
              <p className="text-sm text-gray-400">Encontre a barbearia ideal para você</p>
            </div>
            <p className="rounded-full bg-gray-700/30 px-3 py-1 text-sm font-medium text-gray-300">
              {barbershops.length} disponíveis
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {barbershops.map((barbershop) => (
              <div key={barbershop.id} className="group relative overflow-hidden rounded-xl border border-gray-800 bg-custom-dark-50 transition-all duration-300 hover:border-gray-700 hover:bg-custom-dark-80 hover:shadow-lg hover:shadow-primary/5">
                <div className="relative aspect-[5/3] w-full">
                  <Image
                    alt={barbershop.name}
                    src={barbershop.imageUrl}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                
                <div className="relative p-2.5">
                  {/* Card content */}
                  <h4 className="line-clamp-1 font-medium text-white group-hover:text-primary">
                    {barbershop.name}
                  </h4>
                  <p className="line-clamp-1 mt-0.5 text-xs text-gray-400">
                    {barbershop.address}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-1">
                    <Badge variant="secondary" className="inline-flex items-center gap-1.5 bg-primary/10 pl-0.5 pr-2 py-[2px] text-[10px] text-primary">
                      <Star size={8} className="fill-primary text-primary" />
                      5,0
                    </Badge>
                    <Button
                      variant="secondary"
                      className="h-7 rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      asChild
                    >
                      <Link href={`/barbershops/${barbershop.id}`}>
                        Reservar
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
