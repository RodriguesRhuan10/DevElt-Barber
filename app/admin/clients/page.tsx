"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import { Input } from "@/app/_components/ui/input"
import { Search, Pencil } from "lucide-react"
import Header from "@/app/_components/header"
import { Button } from "@/app/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import { toast } from "sonner"
import { Badge } from "@/app/_components/ui/badge"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  image: string | null
  phoneNumber: string | null
  createdAt: string
  role: string
}

export default function ClientsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userBeingEdited, setUserBeingEdited] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()

  const handleUpdateUser = async (userId: string, updatedData: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao atualizar usuário")
      }

      const updatedUser = await response.json()
      
      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ))
      
      setFilteredUsers(filteredUsers.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ))

      toast.success("Usuário atualizado com sucesso!")
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar usuário")
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch("/api/user/role")
        if (response.ok) {
          const { role } = await response.json()
          if (role !== "ADMIN") {
            router.push("/admin")
            toast.error("Acesso não autorizado")
            return
          }
          loadUsers()
        } else {
          throw new Error("Erro ao verificar permissões")
        }
      } catch (error) {
        console.error(error)
        router.push("/admin")
        toast.error("Erro ao verificar permissões")
      }
    }

    checkPermission()
  }, [router])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phoneNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-72px)] flex-col gap-8 p-6 lg:p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes cadastrados na plataforma
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber || "Não informado"}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.role === "ADMIN" 
                              ? "destructive" 
                              : user.role === "BARBER" 
                                ? "default" 
                                : "secondary"
                          }
                          className={
                            user.role === "ADMIN"
                              ? "bg-red-500"
                              : user.role === "BARBER"
                                ? "bg-primary"
                                : ""
                          }
                        >
                          {user.role === "ADMIN" 
                            ? "Administrador" 
                            : user.role === "BARBER" 
                              ? "Barbeiro" 
                              : "Cliente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog open={isEditDialogOpen && userBeingEdited?.id === user.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (!open) setUserBeingEdited(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setUserBeingEdited(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Cliente</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                  defaultValue={userBeingEdited?.name}
                                  onChange={(e) => setUserBeingEdited(prev => prev ? {...prev, name: e.target.value} : null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                  defaultValue={userBeingEdited?.email}
                                  onChange={(e) => setUserBeingEdited(prev => prev ? {...prev, email: e.target.value} : null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Telefone</label>
                                <Input
                                  defaultValue={userBeingEdited?.phoneNumber || ""}
                                  onChange={(e) => setUserBeingEdited(prev => prev ? {...prev, phoneNumber: e.target.value} : null)}
                                />
                              </div>
                              {userBeingEdited?.role === "USER" && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Cargo</label>
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => userBeingEdited && handleUpdateUser(userBeingEdited.id, {
                                      ...userBeingEdited,
                                      role: "BARBER"
                                    })}
                                  >
                                    Promover a Barbeiro
                                  </Button>
                                </div>
                              )}
                              {userBeingEdited?.role === "BARBER" && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Cargo</label>
                                  <Button
                                    variant="outline"
                                    className="w-full text-destructive hover:text-destructive"
                                    onClick={() => userBeingEdited && handleUpdateUser(userBeingEdited.id, {
                                      ...userBeingEdited,
                                      role: "USER"
                                    })}
                                  >
                                    Remover Cargo de Barbeiro
                                  </Button>
                                </div>
                              )}
                              <Button 
                                className="w-full"
                                onClick={() => userBeingEdited && handleUpdateUser(userBeingEdited.id, {
                                  name: userBeingEdited.name,
                                  email: userBeingEdited.email,
                                  phoneNumber: userBeingEdited.phoneNumber,
                                })}
                              >
                                Salvar Alterações
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 