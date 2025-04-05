"use client"

import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { Textarea } from "@/app/_components/ui/textarea";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function SupportPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (loading) return;

    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);

      const data = {
        name: session?.user?.name || "",
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        type: type,
        message: formData.get("message") as string,
      };

      const response = await fetch("/api/support", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao enviar mensagem");
      }

      if (responseData.success) {
        toast.success("Mensagem enviada com sucesso!");
        
        // Limpar campos do formulário de forma segura
        if (formRef.current) {
          formRef.current.reset();
          setType("");
        }
      } else {
        throw new Error(responseData.message || "Erro ao enviar mensagem");
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center">Suporte Técnico</h2>
          <p className="text-muted-foreground text-center mt-2">
            Como podemos ajudar você hoje?
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={session?.user?.name || ""}
              required
              disabled
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={session?.user?.email || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Telefone (opcional)
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Tipo de Suporte
            </label>
            <Select required value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de suporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendamento">Agendamento</SelectItem>
                <SelectItem value="pagamento">Pagamento</SelectItem>
                <SelectItem value="tecnico">Problema Técnico</SelectItem>
                <SelectItem value="duvida">Dúvida sobre Serviços</SelectItem>
                <SelectItem value="reclamacao">Reclamação</SelectItem>
                <SelectItem value="sugestao">Sugestão</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Mensagem
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="Descreva sua dúvida ou problema..."
              required
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="attachment" className="text-sm font-medium">
              Anexar Imagem (opcional)
            </label>
            <Input
              id="attachment"
              name="attachment"
              type="file"
              accept="image/*"
              className="cursor-pointer"
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Mensagem"}
          </Button>
        </form>
      </Card>
    </div>
  );
} 