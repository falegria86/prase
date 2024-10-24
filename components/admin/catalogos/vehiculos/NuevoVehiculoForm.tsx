"use client"

import Loading from "@/app/(protected)/loading"
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
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, SaveIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

//schemas
import { postVehiculoSchema } from "@/schemas/admin/vehiculos/vehiculosSchema"
//actions
import { postVehiculo } from "@/actions/vehiculoActions"
//interfaces
import { iGetCliente } from "@/interfaces/ClientesInterface"

interface Props {
    clientes: iGetCliente[];
}

export const NuevoVehiculoForm = ({ clientes }: Props) => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof postVehiculoSchema>>({
        resolver: zodResolver(postVehiculoSchema),
        defaultValues: {
            ClienteID: 0,
            Marca: "",
            Modelo: "",
            AnoFabricacion: 0,
            TipoVehiculo: "",
            ValorVehiculo: 0,
            ValorFactura: 0,
            FechaRegistro: "",
            UsoVehiculo: "",
            ZonaResidencia: "",
            Salvamento: 0
        },
    })

    const onSubmit = (values: z.infer<typeof postVehiculoSchema>) => {
        startTransition(async () => {

            try {
                const resp = await postVehiculo(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear el vehículo.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cliente creado",
                        description: "El cliente ha sido creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear el vehículo.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="Marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="AnoFabricacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año de Fabricación</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1900}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="TipoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Vehículo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ValorVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor del Vehículo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ValorFactura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Factura</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="FechaRegistro"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Registro</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="UsoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Uso de Vehículo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ZonaResidencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zona de Residencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre completo..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Salvamento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salvamento</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ClienteID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientes.map((cliente) => (
                                                        <SelectItem key={cliente.ClienteID} value={cliente.ClienteID + ''}>
                                                            {cliente.NombreCompleto}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isPending} size="lg" className="rounded-md w-full">
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
    );
}
