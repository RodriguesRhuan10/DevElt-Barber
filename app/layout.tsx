import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Footer from "./_components/footer"
import AuthProvider from "./_providers/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevElt Barber",
  description: "Agende seu horário nas melhores barbearias da cidade",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-gray-900`}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "white",
              color: "black",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            },
            classNames: {
              toast: "group toast",
              success: "group-[.toast]:border-green-500",
              error: "group-[.toast]:border-red-500",
              warning: "group-[.toast]:border-yellow-500",
              info: "group-[.toast]:border-blue-500",
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}
