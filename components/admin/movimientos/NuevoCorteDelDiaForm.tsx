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
                Diferencia: 0,
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 container">
                {/* Ingresos */}
                <div className="flex flex-col gap-10 lg:flex-row justify-between">
                    <div className="w-full">
                        <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Ingresos.TotalIngresos"
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
                            <FormField
                                control={form.control}
                                name="Ingresos.TotalIngresosEfectivo"
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
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Ingresos.TotalIngresosTarjeta"
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
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Ingresos.TotalIngresosTransferencia"
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
                    <div className="w-full">
                        <h3 className="text-lg font-semibold mb-2">Egresos</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Egresos.TotalEgresos"
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
                            <FormField
                                control={form.control}
                                name="Egresos.TotalEgresosEfectivo"
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
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Egresos.TotalEgresosTarjeta"
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
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Egresos.TotalEgresosTransferencia"
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
                <h3 className="text-lg font-semibold mb-2">ResumenGeneral</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="ResumenGeneral.TotalEfectivo"
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
                        control={form.control}
                        name="ResumenGeneral.TotalPagoConTarjeta"
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
                        control={form.control}
                        name="ResumenGeneral.TotalTransferencia"
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
                        control={form.control}
                        name="ResumenGeneral.SaldoEsperado"
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
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ResumenGeneral.SaldoReal"
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
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ResumenGeneral.TotalEfectivoCapturado"
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
                        control={form.control}
                        name="ResumenGeneral.TotalTarjetaCapturado"
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
                        control={form.control}
                        name="ResumenGeneral.TotalTransferenciaCapturado"
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
                        control={form.control}
                        name="ResumenGeneral.Diferencia"
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ResumenGeneral.Observaciones"
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
                        control={form.control}
                        name="ResumenGeneral.Estatus"
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

                <Button type="submit" disabled={isPending}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                </Button>
            </form>
        </Form>
    );
}