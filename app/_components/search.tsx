"use client"

import { SearchIcon } from "lucide-react"
import { Input } from "./ui/input"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"

const formSchema = z.object({
  title: z.string().trim().min(1, {
    message: "Digite algo para buscar",
  }),
})

const Search = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })
  const router = useRouter()

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    router.push(`/barbershops?title=${data.title}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Buscar barbearias, serviços..."
                    {...field}
                    className="h-9 w-full rounded-full border-0 bg-gray-800 pl-9 pr-4 text-xs font-medium placeholder:text-gray-500 focus:border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormControl>
              <FormMessage className="mt-1 text-[10px] font-medium text-red-400" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default Search
