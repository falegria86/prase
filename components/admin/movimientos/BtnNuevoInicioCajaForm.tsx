"use client"

import { postInicioCaja } from "@/actions/MovimientosActions"
import { LoaderModales } from "@/components/LoaderModales"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { iGetUsers } from "@/interfaces/SeguridadInterface"
import { formatCurrency } from "@/lib/format"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { forwardRef, useImperativeHandle, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const nuevoInicioCajaSchema = z.object({
    TotalEfectivo: z.number().min(1, { message: "El total de efectivo es requerido" }),
    TotalTransferencia: z.number().min(1, { message: "El total de transferencia es requerido" }),
    UsuarioID: z.number().min(1, { message: "El usuario es requerido" }),
    UsuarioAutorizoID: z.number(),
})

interface NuevoInicioCajaFormProps {
    usuarios: iGetUsers[]
    usuarioAutorizoId: number
}

export const NuevoInicioCajaForm = forwardRef(
    ({ usuarios, usuarioAutorizoId }: NuevoInicioCajaFormProps, ref) => {

        const [isPending, startTransition] = useTransition()
        const { toast } = useToast()
        const router = useRouter()

        const form = useForm<z.infer<typeof nuevoInicioCajaSchema>>({
            resolver: zodResolver(nuevoInicioCajaSchema),
            defaultValues: {
                TotalEfectivo: 0,
                TotalTransferencia: 0,
                UsuarioID: 24,
                UsuarioAutorizoID: usuarioAutorizoId,
            },
        })

        const totalEfectivo = form.watch("TotalEfectivo")
        const totalTransferencia = form.watch("TotalTransferencia")
        const montoInicial = totalEfectivo + totalTransferencia

        const onSubmit = async (values: z.infer<typeof nuevoInicioCajaSchema>) => {
            const datosConMontoInicial = {
                ...values,
                MontoInicial: montoInicial
            }

            startTransition(async () => {
                try {
                    const respuesta = await postInicioCaja(datosConMontoInicial)

                    if (respuesta?.error) {
                        toast({
                            title: "Error",
                            description: "Ocurrió un error al crear el inicio de caja",
                            variant: "destructive",
                        })
                        return
                    }

                    toast({
                        title: "Éxito",
                        description: "Inicio de caja creado correctamente",
                    })
                    router.refresh()
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al crear el inicio de caja",
                        variant: "destructive",
                    })
                }
            })
        }

        if (isPending) {
            return <LoaderModales texto="Creando inicio de caja..." />
        }

        // Exponer el método de submit
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useImperativeHandle(ref, () => ({
            submitForm: () => {
                form.handleSubmit(onSubmit)();
            }
        }));



        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 container">
                    <FormField
                        control={form.control}
                        name="UsuarioID"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Usuario</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un usuario" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {usuarios.map((usuario) => (
                                            <SelectItem
                                                key={usuario.UsuarioID}
                                                value={usuario.UsuarioID.toString()}
                                            >
                                                {usuario.NombreUsuario}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>Monto Inicial</FormLabel>
                        <Input
                            value={formatCurrency(montoInicial)}
                            disabled
                        />
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="TotalEfectivo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Efectivo</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={formatCurrency(field.value)}
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "")
                                            field.onChange(Number(valor) / 100)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="TotalTransferencia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Transferencia</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={formatCurrency(field.value)}
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "")
                                            field.onChange(Number(valor) / 100)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        )
    }
);

NuevoInicioCajaForm.displayName = "NuevoInicioCajaForm";