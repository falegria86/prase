"use client"

import { getCorteDelDiaByID, postCorteDelDia } from "@/actions/CorteDelDiaActions";
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
import { IPostCorteDelDia } from "@/interfaces/CorteDelDiaInterface";
import { formatCurrency } from "@/lib/format";
import { CorteDelDiaSchema } from "@/schemas/admin/movimientos/movimientosSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect, useImperativeHandle, useState, useTransition } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

interface NuevoCorteDelDiaFormProps {
    montoInicial: any;
    usuarioId: number
}



export const NuevoCorteDelDiaForm = forwardRef(({ usuarioId }: NuevoCorteDelDiaFormProps, ref) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const corteDelDia = await getCorteDelDiaByID(usuarioId);
            if (!corteDelDia) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al obtener el corte del día",
                    variant: "destructive",
                });
            } else {
                form.reset({
                    ...corteDelDia,
                    TotalIngresos: Number(corteDelDia.TotalIngresos),
                    TotalIngresosEfectivo: Number(corteDelDia.TotalIngresosEfectivo),
                    TotalIngresosTarjeta: Number(corteDelDia.TotalIngresosTarjeta),
                    TotalIngresosTransferencia: Number(corteDelDia.TotalIngresosTransferencia),
                    TotalEgresos: Number(corteDelDia.TotalEgresos),
                    TotalEgresosEfectivo: Number(corteDelDia.TotalEgresosEfectivo),
                    TotalEgresosTarjeta: Number(corteDelDia.TotalEgresosTarjeta),
                    TotalEgresosTransferencia: Number(corteDelDia.TotalEgresosTransferencia),
                    TotalEfectivo: Number(corteDelDia.TotalEfectivo),
                    TotalPagoConTarjeta: Number(corteDelDia.TotalPagoConTarjeta),
                    TotalTransferencia: Number(corteDelDia.TotalTransferencia),
                    SaldoEsperado: Number(corteDelDia.SaldoEsperado),
                    SaldoReal: Number(corteDelDia.SaldoReal),
                    TotalEfectivoCapturado: Number(corteDelDia.TotalEfectivoCapturado),
                    TotalTarjetaCapturado: Number(corteDelDia.TotalTarjetaCapturado),
                    TotalTransferenciaCapturado: Number(corteDelDia.TotalTransferenciaCapturado),
                    Diferencia: Number(corteDelDia.Diferencia),
                });
                calcularTotales();
            }
            setIsLoading(false);
        };
        fetchData();
    }, [usuarioId]);

    const form = useForm<z.infer<typeof CorteDelDiaSchema>>({
        resolver: zodResolver(CorteDelDiaSchema),
        defaultValues: {
            TotalIngresos: 0,
            TotalIngresosEfectivo: 0,
            TotalIngresosTarjeta: 0,
            TotalIngresosTransferencia: 0,
            TotalEgresos: 0,
            TotalEgresosEfectivo: 0,
            TotalEgresosTarjeta: 0,
            TotalEgresosTransferencia: 0,
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
            Estatus: ""
        },
    });

    const transformarDatos = (values: z.infer<typeof CorteDelDiaSchema>, usuarioID: number): IPostCorteDelDia => {
        return {
            usuarioID,
            SaldoReal: values.SaldoReal,
            TotalEfectivoCapturado: values.TotalEfectivoCapturado,
            TotalTarjetaCapturado: values.TotalTarjetaCapturado,
            TotalTransferenciaCapturado: values.TotalTransferenciaCapturado,
            Observaciones: values.Observaciones,
        };
    };

    const onSubmit = async (values: z.infer<typeof CorteDelDiaSchema>) => {
        startTransition(async () => {
            try {
                const datosTransformados: IPostCorteDelDia = transformarDatos(values, usuarioId);
                // Aquí puedes enviar los datos transformados a tu API
                console.log("Datos enviados:", datosTransformados);
                const respuesta = await postCorteDelDia(datosTransformados);
                console.log("🚀 ~ startTransition ~ respuesta:", respuesta)
                if (respuesta) {
                    toast({
                        title: "Éxito",
                        description: "Cierre de caja guardado correctamente",
                        duration: 5000,
                    })
                } else {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al guardar el cierre de caja",
                        variant: "destructive",
                    });
                }
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

    const calcularTotales = () => {


        // Calcular saldo real
        const SaldoReal = form.getValues("TotalEfectivoCapturado") + form.getValues("TotalPagoConTarjeta") + form.getValues("TotalTransferencia");
        form.setValue("SaldoReal", SaldoReal);

        // Calcular diferencia
        form.setValue("Diferencia", form.getValues("SaldoEsperado") - SaldoReal);

        // Guardar los valores de captura
        form.setValue("TotalTarjetaCapturado", form.getValues("TotalPagoConTarjeta"));
        form.setValue("TotalTransferenciaCapturado", form.getValues("TotalTransferencia"));
        // Forzar actualización del formulario
        form.trigger();

    }

    const CustomValue: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => {
        const { getValues } = useFormContext();
        return <div>
            <FormLabel>{label}</FormLabel>
            <p className={className}>{formatCurrency(getValues(value))}</p>
        </div>;
    };

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            // console.log(form.getValues());
            form.handleSubmit(onSubmit)();
        }
    }));

    return (
        <>
            {isLoading ? (
                <LoaderModales texto="Cargando corte del dia" />
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 container">
                        <div className="flex flex-col gap-5 lg:flex-row justify-between">
                            {/* Ingresos */}
                            <div className="w-full border p-3 rounded-md">
                                <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
                                <div className="grid sm:grid-cols-2 gap-4">

                                    <CustomValue
                                        label="Total Ingresos en Efectivo"
                                        value="TotalIngresosEfectivo"
                                    />

                                    <CustomValue
                                        label="Total Ingresos con Tarjeta"
                                        value="TotalIngresosTarjeta"
                                    />

                                    <CustomValue
                                        label="Total Ingresos con Transferencia"
                                        value="TotalIngresosTransferencia"
                                    />

                                    <CustomValue
                                        label="Total Ingresos"
                                        value="TotalIngresos"
                                    />
                                </div>
                            </div>
                            {/* Egresos */}
                            <div className="w-full border p-3 rounded-md">
                                <h3 className="text-lg font-semibold mb-2">Egresos</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <CustomValue
                                        label="Total Egresos en Efectivo"
                                        value="TotalEgresosEfectivo"
                                    />

                                    <CustomValue
                                        label="Total Egresos con Tarjeta"
                                        value="TotalEgresosTarjeta"
                                    />

                                    <CustomValue
                                        label="Total Egresos con Transferencia"
                                        value="TotalEgresosTransferencia"
                                    />

                                    <CustomValue
                                        label="Total Egresos"
                                        value="TotalEgresos"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Resumen general */}
                        <div className="border p-3 rounded-md">
                            <h3 className="text-lg font-semibold mb-2">ResumenGeneral</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <CustomValue
                                    label="Total Efectivo"
                                    value="TotalEfectivo"
                                />
                                <CustomValue
                                    label="Total Pago Con Tarjeta"
                                    value="TotalPagoConTarjeta"
                                />
                                <CustomValue
                                    label="Total Pago Con Transferencia"
                                    value="TotalTransferencia"
                                />
                                <CustomValue
                                    label="Saldo Esperado"
                                    value="SaldoEsperado"
                                />
                                <CustomValue
                                    label="Saldo Real"
                                    value="SaldoReal"
                                />
                                <CustomValue
                                    label="Diferencia"
                                    value="Diferencia"
                                />

                            </div>
                            {/* Totales Capturados */}
                            <h3 className="text-lg font-semibold mb-2 py-3">Totales en este usuario</h3>
                            <div className="grid gap-4">
                                <FormField
                                    name="TotalEfectivoCapturado"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Efectivo</FormLabel>
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

                                <div className="">
                                    <FormField
                                        name="Observaciones"
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
                                </div>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="mt-5"
                        >
                            Enviar
                        </Button>
                    </form>
                </Form>
            )}
        </>

    );
})

NuevoCorteDelDiaForm.displayName = "NuevoCorteDelDiaForm";