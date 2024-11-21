import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '@/types/cotizador';
import { iGetTipoPagos } from '@/interfaces/CatTipoPagos';

export const PlanPago = ({
    form,
    tiposPagos,
    costoBase,
}: {
    form: UseFormReturn<FormData>;
    tiposPagos: iGetTipoPagos[];
    costoBase: number;
}) => {
    const aplicarPorcentajeAjuste = (monto: number, tipoPago: iGetTipoPagos): number => {
        const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;
        return monto * (1 + porcentajeAjuste);
    };

    const aplicarBonificacion = (monto: number, bonificacion: number): number => {
        return monto * (1 - (bonificacion / 100));
    };

    const calcularCostoTotal = (tipoPagoId: number, bonificacion = 0): number => {
        const tipoPago = tiposPagos.find(t => t.TipoPagoID === tipoPagoId);
        if (!tipoPago) return costoBase;

        const costoAjustado = aplicarPorcentajeAjuste(costoBase, tipoPago);
        const costoFinal = aplicarBonificacion(costoAjustado, bonificacion);

        // Actualizamos PrimaTotal en el formulario
        form.setValue("PrimaTotal", costoFinal);

        return costoFinal;
    };

    const calcularPagos = (tipoPagoId: number) => {
        const tipoPago = tiposPagos.find(t => t.TipoPagoID === tipoPagoId);
        if (!tipoPago || tipoPago.Divisor === 1) return null;

        const costoTotal = calcularCostoTotal(tipoPagoId, form.getValues("PorcentajeDescuento") || 0);
        const pagoSubsecuente = costoTotal / tipoPago.Divisor;
        const primerPago = pagoSubsecuente;

        return {
            primerPago,
            pagoSubsecuente,
            numeroPagosSubsecuentes: tipoPago.Divisor - 1
        };
    };

    const validarBonificacion = (valor: string): number => {
        if (valor === "") return 0;
        const numero = Math.min(Math.max(Number(valor), 0), 35);
        return isNaN(numero) ? 0 : numero;
    };

    const tipoPagoSeleccionado = form.watch("TipoPagoID");
    const bonificacion = form.watch("PorcentajeDescuento") || 0;
    const detallesPago = tipoPagoSeleccionado ? calcularPagos(tipoPagoSeleccionado) : null;
    const costoTotal = tipoPagoSeleccionado ? calcularCostoTotal(tipoPagoSeleccionado, bonificacion) : costoBase;

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Plan de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="TipoPagoID"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Pago</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const tipoPagoId = Number(value);
                                        field.onChange(tipoPagoId);
                                        calcularCostoTotal(tipoPagoId, form.getValues("PorcentajeDescuento"));
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo de pago" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tiposPagos.map((tipo) => (
                                            <SelectItem
                                                key={tipo.TipoPagoID}
                                                value={tipo.TipoPagoID.toString()}
                                            >
                                                {tipo.Descripcion}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Selecciona la forma en que deseas pagar
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="PorcentajeDescuento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bonificación técnica (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        placeholder="0-35%"
                                        onFocus={(e) => {
                                            if (e.target.value === "0") {
                                                field.onChange("");
                                            }
                                        }}
                                        onChange={(e) => {
                                            const valorValidado = validarBonificacion(e.target.value);
                                            field.onChange(valorValidado);

                                            if (tipoPagoSeleccionado) {
                                                calcularCostoTotal(tipoPagoSeleccionado, valorValidado);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>Min. 0% - Max. 35%</FormDescription>
                            </FormItem>
                        )}
                    />
                </div>

                {tipoPagoSeleccionado != 0 && (
                    <div className="mt-4 space-y-2">
                        {detallesPago ? (
                            <>
                                <div className="flex justify-end gap-4 items-center">
                                    <span className="font-medium">Primer pago:</span>
                                    <span>{formatCurrency(detallesPago.primerPago)}</span>
                                </div>
                                <div className="flex justify-end gap-4 items-center">
                                    <span className="font-medium">
                                        {detallesPago.numeroPagosSubsecuentes} {detallesPago.numeroPagosSubsecuentes === 1 ? 'pago' : 'pagos'} subsecuentes:
                                    </span>
                                    <span>{formatCurrency(detallesPago.pagoSubsecuente)}</span>
                                </div>
                            </>
                        ) : null}
                        <div className="flex justify-end gap-4 items-center pt-2 border-t">
                            <span className="text-lg font-semibold">Costo Neto:</span>
                            <span className="text-lg font-bold text-primary">
                                {formatCurrency(costoTotal)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};