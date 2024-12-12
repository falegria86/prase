"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { iGetVehiculo, iPostVehiculo } from "@/interfaces/VehiculoInterface";
import { getAllVehiculos, postVehiculo } from "@/actions/vehiculoActions";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";

const vehiculoSchema = z.object({
    vehiculoExistente: z.string().optional(),
    marca: z.string().min(1, "La marca es requerida"),
    modelo: z.string().min(1, "El modelo es requerido"),
    anoFabricacion: z.coerce.number().min(1900, "Año inválido"),
    tipoVehiculo: z.string().min(1, "El tipo de vehículo es requerido"),
    valorVehiculo: z.coerce.number().min(1, "El valor del vehículo es requerido"),
    valorFactura: z.coerce.number().min(1, "El valor de factura es requerido"),
    usoVehiculo: z.string().min(1, "El uso del vehículo es requerido"),
    zonaResidencia: z.string().min(1, "La zona de residencia es requerida"),
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoPolizaStepProps {
    clienteId: number;
    cotizacion: iGetCotizacion;
    alSubmit: (idVehiculo: number) => void;
    zona: string;
}

export const VehiculoPolizaStep = ({ 
    clienteId, 
    cotizacion, 
    alSubmit, 
    zona 
}: VehiculoPolizaStepProps) => {
    const [vehiculos, setVehiculos] = useState<iGetVehiculo[]>([]);
    const vehiculosCliente = vehiculos.filter(v => v.ClienteID === clienteId);

    const form = useForm<VehiculoFormData>({
        resolver: zodResolver(vehiculoSchema),
        defaultValues: {
            marca: cotizacion.Marca,
            modelo: cotizacion.Modelo,
            anoFabricacion: Number(cotizacion.Modelo),
            tipoVehiculo: cotizacion.TipoVehiculo.toString(),
            valorVehiculo: 0,
            valorFactura: 0,
            usoVehiculo: cotizacion.UsoVehiculo.toString(),
            zonaResidencia: zona,
        },
    });

    useEffect(() => {
        const cargarVehiculos = async () => {
            const respuesta = await getAllVehiculos();
            if (respuesta) {
                setVehiculos(respuesta);
            }
        };

        cargarVehiculos();
    }, []);

    const manejarSeleccionVehiculo = (valorSeleccionado: string) => {
        if (valorSeleccionado === "nuevo") {
            form.reset({
                vehiculoExistente: undefined,
                marca: cotizacion.Marca,
                modelo: cotizacion.Modelo,
                anoFabricacion: Number(cotizacion.Modelo),
                tipoVehiculo: cotizacion.TipoVehiculo.toString(),
                valorVehiculo: 0,
                valorFactura: 0,
                usoVehiculo: cotizacion.UsoVehiculo.toString(),
                zonaResidencia: zona,
            });
        } else {
            const vehiculoSeleccionado = vehiculos.find(
                vehiculo => vehiculo.VehiculoID.toString() === valorSeleccionado
            );
            if (vehiculoSeleccionado) {
                form.reset({
                    vehiculoExistente: valorSeleccionado,
                    marca: vehiculoSeleccionado.Marca,
                    modelo: vehiculoSeleccionado.Modelo,
                    anoFabricacion: vehiculoSeleccionado.AnoFabricacion,
                    tipoVehiculo: vehiculoSeleccionado.TipoVehiculo,
                    valorVehiculo: Number(vehiculoSeleccionado.ValorVehiculo),
                    valorFactura: Number(vehiculoSeleccionado.ValorFactura),
                    usoVehiculo: vehiculoSeleccionado.UsoVehiculo,
                    zonaResidencia: vehiculoSeleccionado.ZonaResidencia,
                });
            }
        }
    };

    const onSubmit = async (datos: VehiculoFormData) => {
        if (datos.vehiculoExistente) {
            alSubmit(parseInt(datos.vehiculoExistente));
            return;
        }

        const datosVehiculo: iPostVehiculo = {
            ClienteID: clienteId,
            Marca: datos.marca,
            Modelo: datos.modelo,
            AnoFabricacion: datos.anoFabricacion,
            TipoVehiculo: datos.tipoVehiculo,
            ValorVehiculo: datos.valorVehiculo,
            ValorFactura: datos.valorFactura,
            FechaRegistro: new Date().toISOString(),
            UsoVehiculo: datos.usoVehiculo,
            ZonaResidencia: datos.zonaResidencia,
            Salvamento: 0,
        };

        try {
            const respuesta = await postVehiculo(datosVehiculo);
            if (respuesta?.VehiculoID) {
                alSubmit(respuesta.VehiculoID);
            }
        } catch (error) {
            console.error('Error al registrar vehículo:', error);
        }
    };

    const deshabilitarCampos = !!form.watch("vehiculoExistente");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información del Vehículo</CardTitle>
                <CardDescription>
                    {vehiculosCliente.length > 0
                        ? "Selecciona un vehículo existente o registra uno nuevo"
                        : "El cliente no cuenta con vehículos registrados"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {vehiculosCliente.length > 0 && (
                            <FormField
                                control={form.control}
                                name="vehiculoExistente"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehículo</FormLabel>
                                        <Select
                                            onValueChange={manejarSeleccionVehiculo}
                                            value={field.value || "nuevo"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar vehículo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="nuevo">Nuevo Vehículo</SelectItem>
                                                {vehiculosCliente.map((vehiculo) => (
                                                    <SelectItem
                                                        key={vehiculo.VehiculoID}
                                                        value={vehiculo.VehiculoID.toString()}
                                                    >
                                                        {`${vehiculo.Marca} ${vehiculo.Modelo} ${vehiculo.AnoFabricacion}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="anoFabricacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año de Fabricación</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={deshabilitarCampos}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tipoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Vehículo</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valorVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor del Vehículo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={deshabilitarCampos}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valorFactura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Factura</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={deshabilitarCampos}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="usoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Uso del Vehículo</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zonaResidencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zona de Residencia</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={deshabilitarCampos} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <Button type="submit">
                                Siguiente
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};