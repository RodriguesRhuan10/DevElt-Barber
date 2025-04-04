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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Scissors className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur">
          {children}
        </div>

        <div className="text-center text-sm text-gray-400">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-primary hover:text-primary/90"
          >
            {footerLinkText}
          </Link>
        </div>
      </div>
    </div>
  )
} 