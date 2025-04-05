"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Pencil, Upload } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarImage } from "./ui/avatar"

export function EditProfileDialog() {
  const { data: session, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url")

  async function handleUpdateInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const name = formData.get("name") as string
      const email = formData.get("email") as string
      const phoneNumber = formData.get("phoneNumber") as string
      const imageUrl = formData.get("imageUrl") as string

      const response = await fetch("/api/user/info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          image: imageUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao atualizar informações")
      }

      const data = await response.json()
      
      // Atualiza a sessão com os novos dados
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          image: data.user.image,
        },
      })

      toast.success("Informações atualizadas com sucesso!")
      setIsOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar informações")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const currentPassword = formData.get("currentPassword") as string
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (newPassword !== confirmPassword) {
        toast.error("As senhas não coincidem")
        return
      }

      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao atualizar senha")
      }

      toast.success("Senha atualizada com sucesso!")
      setIsOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar senha")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsLoading(true)

      let imageUrl = ""

      if (imageMethod === "url") {
        const formData = new FormData(event.currentTarget)
        imageUrl = formData.get("imageUrl") as string
      } else if (selectedFile) {
        const uploadData = new FormData()
        uploadData.append("file", selectedFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.details || errorData.error || "Erro ao fazer upload da imagem")
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.url
      }

      if (!imageUrl && !selectedFile) {
        throw new Error("Por favor, selecione uma imagem ou forneça uma URL")
      }

      // Primeiro, atualiza no banco de dados
      const response = await fetch("/api/user/info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar imagem no banco de dados");
      }

      // Depois, atualiza a sessão com a nova imagem e força uma atualização
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          image: imageUrl,
        },
      };

      await updateSession(newSession);

      // Aguarda um momento para garantir que a sessão foi atualizada
      await new Promise(resolve => setTimeout(resolve, 100));

      toast.success("Imagem atualizada com sucesso!")
      setIsOpen(false)
      setPreviewImage(null)
      setSelectedFile(null)
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar imagem")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validar o tipo e tamanho do arquivo
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WEBP.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
        return;
      }

      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setImageMethod("upload");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="image">Imagem</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={session?.user?.name || ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={session?.user?.email || ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número de Celular</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  defaultValue={session?.user?.phoneNumber || ""}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <form onSubmit={handleUpdateImage} className="space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={previewImage || session?.user?.image || ""} />
                </Avatar>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={imageMethod === "url" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setImageMethod("url")}
                  >
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageMethod === "upload" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setImageMethod("upload")}
                  >
                    Upload
                  </Button>
                </div>

                {imageMethod === "url" ? (
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="https://exemplo.com/sua-imagem.jpg"
                      defaultValue={session?.user?.image || ""}
                      onChange={(e) => setPreviewImage(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="imageFile">Upload de Imagem</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("imageFile")?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Escolher arquivo
                      </Button>
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Arquivo selecionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 