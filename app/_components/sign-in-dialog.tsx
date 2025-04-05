import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import Link from "next/link"

const SignInDialog = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Faça login na plataforma</DialogTitle>
        <DialogDescription>
          Entre com suas credenciais ou crie uma nova conta.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <Button asChild>
          <Link href="/login">Fazer login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Criar conta</Link>
        </Button>
      </div>
    </>
  )
}

export default SignInDialog
