import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { db } from "./_lib/prisma"
import BarbershopItem from "./_components/barbershop-item"
import { quickSearchOptions } from "./_constants/search"
import BookingItem from "./_components/booking-item"
import Search from "./_components/search"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getConfirmedBookings } from "./_data/get-confirmed-bookings"

const Home = async () => {
  const session = await getServerSession(authOptions)
  const barbershops = await db.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  })
  const confirmedBookings = await getConfirmedBookings()

  return (
    <div>
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
                className="flex items-center gap-1.5 whitespace-nowrap bg-gray-800 px-2.5 py-1.5 text-[10px] font-medium hover:bg-gray-700"
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
            alt="Agende nos melhores com FSW Barber"
            src="/banner-01.png"
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-white">Barbearias</h3>
            <p className="text-[9px] text-gray-400">{barbershops.length} disponíveis</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
