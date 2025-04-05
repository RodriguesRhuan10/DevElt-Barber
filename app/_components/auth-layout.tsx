import { Scissors } from "lucide-react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-gray-900 to-gray-900">
      <div className="relative w-full max-w-md">
        {/* Efeitos de luz decorativos */}
        <div className="absolute -top-24 -z-10">
          <div className="absolute h-[200px] w-[200px] rounded-full bg-primary/30 blur-[120px]" />
        </div>
        <div className="absolute -bottom-24 right-0 -z-10">
          <div className="absolute h-[200px] w-[200px] rounded-full bg-primary/20 blur-[120px]" />
        </div>

        <div className="w-full px-8 py-12 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
              <div className="relative rounded-full bg-gray-900/90 p-3.5 ring-2 ring-gray-800 backdrop-blur-sm">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-base text-gray-400 text-center max-w-sm">{subtitle}</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl blur-2xl" />
            <div className="relative rounded-xl border border-gray-800 bg-gray-900/80 p-8 backdrop-blur-xl shadow-[0_0_30px_10px_rgba(0,0,0,0.3)] ring-1 ring-gray-800/50">
              {children}
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500">{footerText}</span>{" "}
            <Link
              href={footerLinkHref}
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 