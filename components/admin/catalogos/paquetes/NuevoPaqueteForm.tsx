"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { nuevoPaqueteSchema } from "@/schemas/admin/catalogos/catalogosSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SaveIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { postPaqueteCobertura } from "@/actions/CatPaquetesActions"
import Loading from "@/app/(protected)/loading"

export const NuevoPaqueteForm = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevoPaqueteSchema>>({
        resolver: zodResolver(nuevoPaqueteSchema),
        defaultValues: {
            NombrePaquete: '',
            DescripcionPaquete: '',
        },
    })

    const onSubmit = (values: z.infer<typeof nuevoPaqueteSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postPaqueteCobertura(values)

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el paquete.",
                        variant: "destructive",
                    })
                } else {
                    toast({
                        title: "Paquete creado",
                        description: "El paquete se ha creado exitosamente.",
                        variant: "default",
                    })
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el paquete.",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="NombrePaquete"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del paquete</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Paquete de cobertura..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="DescripcionPaquete"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción del paquete</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Describe lo que incluye el paquete..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} size="lg">
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-4 h-4 mr-2" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    )
}