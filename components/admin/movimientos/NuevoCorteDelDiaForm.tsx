"use client"

import { LoaderModales } from "@/components/LoaderModales";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { cierreCajaSchema } from "@/schemas/admin/movimientos/movimientosSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const NuevoCorteDelDiaForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof cierreCajaSchema>>({
        resolver: zodResolver(cierreCajaSchema),
        defaultValues: {
            Ingresos: {
                TotalIngresos: 0,
                TotalIngresosEfectivo: 0,
                TotalIngresosTarjeta: 0,
                TotalIngresosTransferencia: 0,
            },
            Egresos: {
                TotalEgresos: 0,
                TotalEgresosEfectivo: 0,
                TotalEgresosTarjeta: 0,
                TotalEgresosTransferencia: 0,
            },
            ResumenGeneral: {
                TotalEfectivo: 0,
                TotalPagoConTarjeta: 0,
                TotalTransferencia: 0,
                SaldoEsperado: 0,
                SaldoReal: 0,
                TotalEfectivoCapturado: 0,
                TotalTarjetaCapturado: 0,
                TotalTransferenciaCapturado: 0,
                Diferencia: 0, // Saldo Esperado - Saldo Real
                Observaciones: "",
                Estatus: "",
            },
        },
    });

    const onSubmit = async (values: z.infer<typeof cierreCajaSchema>) => {
        startTransition(async () => {
            try {
                // Aquí puedes enviar los datos a tu API o realizar otras acciones
                console.log("Datos enviados:", values);

                toast({
                    title: "Éxito",
                    description: "Cierre de caja guardado correctamente",
                });
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al guardar el cierre de caja",
                    variant: "destructive",
                });
            }
        });
    };

    if (isPending) {
        return <LoaderModales texto="Guardando cierre de caja..." />;
    }

    const calcularTotalIngresos = () => {
        const TotalIngresosEfectivo = form.getValues("Ingresos.TotalIngresosEfectivo");
        const TotalIngresosTarjeta = form.getValues("Ingresos.TotalIngresosTarjeta");
        const TotalIngresosTransferencia = form.getValues("Ingresos.TotalIngresosTransferencia");

        const sumaIngresos = TotalIngresosEfectivo + TotalIngresosTarjeta + TotalIngresosTransferencia;

        form.setValue("Ingresos.TotalIngresos", sumaIngresos);
    }

    const calcularTotales = () => {
        // Ingresos
        const TotalIngresosEfectivo = form.getValues("Ingresos.TotalIngresosEfectivo");
        const TotalIngresosTarjeta = form.getValues("Ingresos.TotalIngresosTarjeta");
        const TotalIngresosTransferencia = form.getValues("Ingresos.TotalIngresosTransferencia");
        const TotalIngresos = TotalIngresosEfectivo + TotalIngresosTarjeta + TotalIngresosTransferencia;
        form.setValue("Ingresos.TotalIngresos", TotalIngresos);

        // Egresos
        const TotalEgresosEfectivo = form.getValues("Egresos.TotalEgresosEfectivo");
        const TotalEgresosTarjeta = form.getValues("Egresos.TotalEgresosTarjeta");
        const TotalEgresosTransferencia = form.getValues("Egresos.TotalEgresosTransferencia");
        const TotalEgresos = TotalEgresosEfectivo + TotalEgresosTarjeta + TotalEgresosTransferencia;
        form.setValue("Egresos.TotalEgresos", TotalEgresos);

        // Resumen General
        const SaldoEsperado = form.getValues("ResumenGeneral.SaldoEsperado");

        // Total Efectivo
        form.setValue("ResumenGeneral.TotalEfectivo", TotalIngresosEfectivo - TotalEgresosEfectivo);

        // Total Pago Con Tarjeta
        form.setValue("ResumenGeneral.TotalPagoConTarjeta", TotalIngresosTarjeta - TotalEgresosTarjeta);

        // Total Transferencia
        form.setValue("ResumenGeneral.TotalTransferencia", TotalIngresosTransferencia - TotalEgresosTransferencia);

        // Saldo Real
        const SaldoReal = SaldoEsperado - TotalEgresos + TotalIngresos;
        form.setValue("ResumenGeneral.SaldoReal", SaldoReal);

        // Diferencia
        const Diferencia = SaldoEsperado - SaldoReal;
        form.setValue("ResumenGeneral.Diferencia", Diferencia);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 container">
                {/* Ingresos */}
                <div className="flex flex-col gap-5 lg:flex-row justify-between">
                    <div className="w-full border p-3 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                name="Ingresos.TotalIngresosEfectivo"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Ingresos en Efectivo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                    calcularTotales();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="Ingresos.TotalIngresosTarjeta"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Ingresos con Tarjeta</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                    calcularTotales();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="Ingresos.TotalIngresosTransferencia"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Ingresos con Tranferencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                    calcularTotales();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="Ingresos.TotalIngresos" disabled={true}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Ingresos</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    {/* Egresos */}
                    <div className="w-full border p-3 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Egresos</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                name="Egresos.TotalEgresosEfectivo"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Egresos en Efectivo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                    calcularTotales();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="Egresos.TotalEgresosTarjeta"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Egresos con Tarjeta</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                    calcularTotales();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="Egresos.TotalEgresosTransferencia"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Egresos con Tranferencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                    calcularTotales();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="Egresos.TotalEgresos" disabled={true}
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Egresos</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const valor = e.target.value.replace(/[^0-9]/g, "");
                                                    field.onChange(Number(valor) / 100);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
                {/* Resumen general */}
                <div className="border p-3 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">ResumenGeneral</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                            name="ResumenGeneral.TotalEfectivo" disabled={true}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Efectivo</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.TotalPagoConTarjeta" disabled={true}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Pago con Tarjeta</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.TotalTransferencia" disabled={true}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Transferencia</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.SaldoEsperado"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Saldo Esperado</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                                calcularTotales();
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.SaldoReal" disabled={true}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Saldo Real</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                                calcularTotales();
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.Diferencia" disabled={true}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diferencia</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                            className={field.value < 0 ? "text-red-500" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.TotalTarjetaCapturado"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Tarjeta Capturado</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.TotalTransferenciaCapturado"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Transferencia Capturado</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.TotalEfectivoCapturado"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Efectivo Capturado</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={formatCurrency(field.value)}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9]/g, "");
                                                field.onChange(Number(valor) / 100);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.Observaciones"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observaciones</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="ResumenGeneral.Estatus"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estatus</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isPending}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                </Button>
            </form>
        </Form>
    );
}