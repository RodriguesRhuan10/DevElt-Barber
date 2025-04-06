"use client"

import { Button } from "./ui/button"
import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon, LayoutDashboardIcon, UserCircle, HelpCircle } from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"
import { useEffect, useState } from "react"
import { EditProfileDialog } from "./edit-profile-dialog"

const SidebarSheet = () => {
  const { data } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isBarber, setIsBarber] = useState(false)
  const [timestamp, setTimestamp] = useState(Date.now())
  const handleLogoutClick = () => signOut()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (data?.user?.id) {
        const response = await fetch("/api/user/role")
        if (response.ok) {
          const { role } = await response.json()
          setIsAdmin(role === "ADMIN")
          setIsBarber(role === "BARBER")
        }
      }
    }

    checkAdminStatus()
  }, [data?.user?.id])

  useEffect(() => {
    if (data?.user) {
      setTimestamp(Date.now())
    }
  }, [data])

  const imageUrl = data?.user?.image ? `${data.user.image}?t=${timestamp}` : ""

  return (
    <SheetContent className="flex flex-col gap-6 overflow-y-auto p-0">
      <SheetHeader className="border-b border-gray-800 p-5">
        <SheetTitle className="text-left text-lg font-medium">Menu</SheetTitle>
      </SheetHeader>

      {/* Perfil */}
      <div className="flex items-center gap-3 px-5">
        {data?.user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-gray-800">
              <AvatarImage src={imageUrl} />
              <AvatarFallback>
                <UserCircle className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{data.user.name}</p>
                <p className="text-xs text-gray-400">{data.user.email}</p>
              </div>
              <EditProfileDialog />
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-medium">Olá, faça seu login!</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <LogInIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Links de Navegação */}
      <div className="flex flex-col gap-3 px-5">
        <SheetClose asChild>
          <Button className="h-8 justify-start gap-2 bg-gray-800 text-xs font-medium hover:bg-gray-700" variant="secondary" asChild>
            <Link href="/">
              <HomeIcon size={16} />
              Início
            </Link>
          </Button>
        </SheetClose>

        {data?.user && (
          <Button className="h-8 justify-start gap-2 bg-gray-800 text-xs font-medium hover:bg-gray-700" variant="secondary" asChild>
            <Link href="/bookings">
              <CalendarIcon size={16} />
              Agendamentos
            </Link>
          </Button>
        )}

        {(isAdmin || isBarber) && (
          <Button className="h-8 justify-start gap-2 bg-gray-800 text-xs font-medium hover:bg-gray-700" variant="secondary" asChild>
            <Link href="/admin">
              <LayoutDashboardIcon size={16} />
              Painel Administrativo
            </Link>
          </Button>
        )}

        <SheetClose asChild>
          <Button className="h-8 justify-start gap-2 bg-gray-800 text-xs font-medium hover:bg-gray-700" variant="secondary" asChild>
            <Link href="/support">
              <HelpCircle size={16} />
              Suporte
            </Link>
          </Button>
        </SheetClose>
      </div>

      {/* Serviços */}
      <div className="flex flex-col gap-3 border-t border-gray-800 px-5 py-6">
        <span className="text-xs font-medium uppercase text-gray-400">Serviços</span>
        <div className="grid grid-cols-2 gap-2">
          {quickSearchOptions.map((option) => (
            <SheetClose key={option.title} asChild>
              <Button className="h-8 justify-start gap-2 bg-gray-800 text-xs font-medium hover:bg-gray-700" variant="secondary" asChild>
                <Link href={`/barbershops?service=${option.title}`}>
                  <Image
                    alt={option.title}
                    src={option.imageUrl}
                    height={16}
                    width={16}
                    className="h-4 w-4"
                  />
                  {option.title}
                </Link>
              </Button>
            </SheetClose>
          ))}
        </div>
      </div>

      {/* Logout */}
      {data?.user && (
        <div className="mt-auto border-t border-gray-800 px-5 py-6">
          <Button
            onClick={handleLogoutClick}
            variant="secondary"
            className="h-8 w-full justify-start gap-2 bg-gray-800 text-xs font-medium hover:bg-gray-700"
          >
            <LogOutIcon size={16} />
            Sair da conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
