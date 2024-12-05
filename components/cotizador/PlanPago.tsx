import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "@/types/cotizador";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iAjustesCP } from "@/interfaces/AjustesCPInterace";
import { getAjustesCP } from "@/actions/AjustesCP";

interface PlanPagoProps {
  form: UseFormReturn<FormData>;
  tiposPagos: iGetTipoPagos[];
  costoBase: number;
  derechoPoliza: number;
}

export const PlanPago = ({
  form,
  tiposPagos,
  costoBase,
  derechoPoliza,
}: PlanPagoProps) => {
  const [ajustes, setAjustes] = useState<iAjustesCP | undefined>(undefined);
  const cp = form.getValues("CP");

  useEffect(() => {
    const obtenerAjustes = async () => {
      if (!cp) return;
      try {
        const respuesta = await getAjustesCP(cp);
        if (respuesta?.ajuste) setAjustes(respuesta);
      } catch (error) {
        console.error("Error al obtener ajustes:", error);
      }
    };

    obtenerAjustes();
  }, [cp]);

  const aplicarPorcentajeAjuste = (
    monto: number,
    tipoPago: iGetTipoPagos
  ): number => {
    const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;
    return monto * (1 + porcentajeAjuste);
  };

  const aplicarBonificacion = (monto: number, bonificacion: number): number => {
    return monto * (1 - bonificacion / 100);
  };

  const calcularCostoTotal = (tipoPagoId: number, bonificacion = 0): number => {
    const tipoPago = tiposPagos.find((t) => t.TipoPagoID === tipoPagoId);
    if (!tipoPago) return costoBase;

    // Aplicar ajuste por siniestralidad
    const ajusteSiniestralidad = ajustes
      ? costoBase * (parseFloat(ajustes.ajuste.AjustePrima) / 100)
      : 0;

    const costoConAjuste = costoBase + ajusteSiniestralidad;

    const costoAjustado = aplicarPorcentajeAjuste(costoConAjuste, tipoPago);
    const costoNeto = aplicarBonificacion(costoAjustado, bonificacion);

    form.setValue("PrimaTotal", costoNeto * 1.16 + derechoPoliza);

    return costoNeto;
  };

  const calcularPagos = (tipoPagoId: number) => {
    const tipoPago = tiposPagos.find((t) => t.TipoPagoID === tipoPagoId);
    if (!tipoPago || tipoPago.Divisor === 1) return null;

    const costoTotal = calcularCostoTotal(
      tipoPagoId,
      form.getValues("PorcentajeDescuento") || 0
    );
    const pagoSubsecuente = costoTotal / tipoPago.Divisor;
    const primerPago = pagoSubsecuente + derechoPoliza;

    return {
      primerPago,
      pagoSubsecuente,
      numeroPagosSubsecuentes: tipoPago.Divisor - 1,
    };
  };

  const validarBonificacion = (valor: string): number => {
    if (valor === "") return 0;
    const numero = Math.min(Math.max(Number(valor), 0), 35);
    return isNaN(numero) ? 0 : numero;
  };

  const tipoPagoSeleccionado = form.watch("TipoPagoID");
  const bonificacion = form.watch("PorcentajeDescuento") || 0;
  const detallesPago = tipoPagoSeleccionado
    ? calcularPagos(tipoPagoSeleccionado)
    : null;
  const costoNeto = calcularCostoTotal(tipoPagoSeleccionado, bonificacion);
  const costoTotal = costoNeto * 1.16 + derechoPoliza;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Plan de pago
        </CardTitle>
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
                    calcularCostoTotal(
                      tipoPagoId,
                      form.getValues("PorcentajeDescuento")
                    );
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
            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Costo Neto:</span>
              <span>{formatCurrency(costoNeto)}</span>
            </div>

            {ajustes && parseFloat(ajustes.ajuste.AjustePrima) > 0 && (
              <div className="flex justify-end gap-4 items-center text-amber-600">
                <span className="font-medium">
                  Ajuste por siniestralidad ({ajustes.ajuste.AjustePrima}%):
                </span>
                <span>
                  {formatCurrency(
                    costoBase * (parseFloat(ajustes.ajuste.AjustePrima) / 100)
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">IVA:</span>
              <span>{formatCurrency(costoNeto * 0.16)}</span>
            </div>

            {detallesPago ? (
              <>
                <div className="flex justify-end gap-4 items-center">
                  <span className="font-medium">Primer pago:</span>
                  <span>{formatCurrency(detallesPago.primerPago)}</span>
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <span className="font-medium">
                    {detallesPago.numeroPagosSubsecuentes}{" "}
                    {detallesPago.numeroPagosSubsecuentes === 1
                      ? "pago"
                      : "pagos"}{" "}
                    subsecuentes:
                  </span>
                  <span>{formatCurrency(detallesPago.pagoSubsecuente)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-end gap-4 items-center">
                <span className="font-medium">Derecho de póliza:</span>
                <span>{formatCurrency(derechoPoliza)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center pt-2 border-t">
              <span className="text-lg font-semibold">Costo Total Anual:</span>
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
