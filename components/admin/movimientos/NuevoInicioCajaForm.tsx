"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import SignatureCanvas from 'react-signature-canvas'
import { useRef, useTransition } from "react"
import { SaveIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { postInicioCaja } from "@/actions/MovimientosActions"
import { LoaderModales } from "@/components/LoaderModales"
import { formatCurrency } from "@/lib/format"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { nuevoInicioCajaSchema } from "@/schemas/admin/movimientos/movimientosSchema"
import { iGetUsers } from "@/interfaces/SeguridadInterface"

type ReactSignatureCanvas = SignatureCanvas

interface NuevoInicioCajaFormProps {
    usuarios: iGetUsers[]
    usuarioAutorizoId: number
}

export const NuevoInicioCajaForm = ({
    usuarios,
    usuarioAutorizoId,
}: NuevoInicioCajaFormProps) => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof nuevoInicioCajaSchema>>({
        resolver: zodResolver(nuevoInicioCajaSchema),
        defaultValues: {
            MontoInicial: 0,
            TotalEfectivo: 0,
            TotalTransferencia: 0,
            UsuarioID: 24,
            UsuarioAutorizoID: usuarioAutorizoId,
        },
    })

    const onSubmit = async (values: z.infer<typeof nuevoInicioCajaSchema>) => {
        // console.log(values)
        startTransition(async () => {
            try {
                const respuesta = await postInicioCaja(values)

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
        return (
            <LoaderModales texto="Creando inicio de caja..." />
        )
    }

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

                <FormField
                    control={form.control}
                    name="MontoInicial"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto Inicial</FormLabel>
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

                {/* <div className="space-y-4">
                    <FormLabel>Firma Electrónica</FormLabel>
                    <div className="space-y-2">
                        <div className="border rounded-lg w-fit">
                            <SignatureCanvas
                                ref={signatureRef}
                                canvasProps={{
                                    className: "w-full h-40",
                                    style: { width: "100%", height: "160px" }
                                }}
                                backgroundColor="rgb(255, 255, 255)"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={limpiarFirma}
                            size="sm"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                </div> */}

                <Button type="submit" disabled={isPending}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                </Button>
            </form>
        </Form>
    )
}