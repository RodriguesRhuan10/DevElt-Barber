import Image from "next/image"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            alt="FSW Barber" 
            src="/logo.png" 
            height={24} 
            width={140} 
            className="transition-opacity hover:opacity-80"
          />
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full hover:bg-gray-800"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </div>
    </header>
  )
}

export default Header
