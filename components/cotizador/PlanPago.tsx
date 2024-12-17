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

interface PropiedadesPlanPago {
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
}: PropiedadesPlanPago) => {
  const [ajustes, setAjustes] = useState<iAjustesCP>();
  const codigoPostal = form.watch("CP");

  useEffect(() => {
    const obtenerAjustes = async () => {
      if (!codigoPostal) return;
      try {
        const respuesta = await getAjustesCP(codigoPostal);
        if (respuesta?.ajuste) setAjustes(respuesta);
      } catch (error) {
        console.error("Error al obtener ajustes:", error);
      }
    };

    obtenerAjustes();
  }, [codigoPostal]);

  const calcularAjusteSiniestralidad = (montoBase: number): number => {
    if (!ajustes) return 0;
    return montoBase * (parseFloat(ajustes.ajuste.AjustePrima) / 100);
  };

  const calcularAjusteTipoPago = (
    monto: number,
    tipoPago: iGetTipoPagos
  ): number => {
    const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;
    return monto * porcentajeAjuste;
  };

  const calcularBonificacion = (monto: number, bonificacion: number): number => {
    return monto * (bonificacion / 100);
  };

  const calcularCostoTotal = (tipoPagoId: number, bonificacion = 0): number => {
    const tipoPago = tiposPagos.find((t) => t.TipoPagoID === tipoPagoId);
    if (!tipoPago) return costoBase;

    const ajusteSiniestralidad = calcularAjusteSiniestralidad(costoBase);
    const subtotalSiniestralidad = costoBase + ajusteSiniestralidad;

    if (tipoPago.Divisor === 1) {
      // Pago anual
      const descuentoBonificacion = calcularBonificacion(subtotalSiniestralidad, bonificacion);
      const subtotalConDescuento = subtotalSiniestralidad - descuentoBonificacion;
      const montoAntesIVA = subtotalConDescuento + derechoPoliza;
      const costoTotal = montoAntesIVA * 1.16;

      form.setValue("PrimaTotal", costoTotal);
      return subtotalConDescuento;
    } else {
      // Pagos fraccionados
      const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;
      const montoTotal = ((subtotalSiniestralidad + derechoPoliza) * (1 + porcentajeAjuste)) * 1.16;

      form.setValue("PrimaTotal", montoTotal);
      return subtotalSiniestralidad;
    }
  };

  const calcularPagos = (tipoPagoId: number): {
    primerPago: number;
    pagoSubsecuente: number;
    numeroPagosSubsecuentes: number;
  } | null => {
    const tipoPago = tiposPagos.find((t) => t.TipoPagoID === tipoPagoId);
    if (!tipoPago || tipoPago.Divisor === 1) return null;

    const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;
    const numeroPagos = tipoPago.Divisor;

    // Primer pago: agregar derecho de póliza antes de IVA
    const montoPrimerPagoBase = (costoBase / numeroPagos) + derechoPoliza;
    const montoPrimerPagoAjustado = montoPrimerPagoBase * (1 + porcentajeAjuste);
    const primerPago = montoPrimerPagoAjustado * 1.16;

    // Pagos subsecuentes
    const montoTotalAjustado = ((costoBase + derechoPoliza) * (1 + porcentajeAjuste)) * 1.16;
    const pagoSubsecuente = (montoTotalAjustado - primerPago) / (numeroPagos - 1);

    return {
      primerPago,
      pagoSubsecuente,
      numeroPagosSubsecuentes: numeroPagos - 1,
    };
  };

  const validarBonificacion = (valor: string): number => {
    if (valor === "") return 0;
    const numero = Math.min(Math.max(Number(valor), 0), 35);
    return isNaN(numero) ? 0 : numero;
  };

  const tipoPagoSeleccionado = form.watch("TipoPagoID");
  const bonificacion = form.watch("PorcentajeDescuento") || 0;
  const tipoPago = tiposPagos.find((t) => t.TipoPagoID === tipoPagoSeleccionado);
  const detallesPago = tipoPagoSeleccionado ? calcularPagos(tipoPagoSeleccionado) : null;

  const ajusteSiniestralidad = calcularAjusteSiniestralidad(costoBase);
  const subtotalSiniestralidad = costoBase + ajusteSiniestralidad;

  const ajusteTipoPago = tipoPago
    ? calcularAjusteTipoPago(subtotalSiniestralidad, tipoPago)
    : 0;
  const subtotalTipoPago = subtotalSiniestralidad + ajusteTipoPago;

  const descuentoBonificacion = calcularBonificacion(subtotalTipoPago, bonificacion);
  const costoNeto = subtotalTipoPago - descuentoBonificacion;

  let iva = 0;
  let costoTotal = 0;

  if (!tipoPago || tipoPago.Divisor === 1) {
    iva = (costoNeto + derechoPoliza) * 0.16;
    costoTotal = (costoNeto + derechoPoliza) * 1.16;
  } else {
    const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;
    const montoAntesIVA = (subtotalSiniestralidad + derechoPoliza) * (1 + porcentajeAjuste);
    iva = montoAntesIVA * 0.16;
    costoTotal = montoAntesIVA * 1.16;

    if (detallesPago) {
      costoTotal = detallesPago.primerPago +
        (detallesPago.pagoSubsecuente * detallesPago.numeroPagosSubsecuentes);
    }
  }

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
                  onValueChange={(valor) => {
                    const tipoPagoId = Number(valor);
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

        {tipoPagoSeleccionado !== 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Costo Base:</span>
              <span>{formatCurrency(costoBase)}</span>
            </div>

            {ajusteSiniestralidad > 0 && (
              <div className="flex justify-end gap-4 items-center text-amber-600">
                <span className="font-medium">
                  Ajuste por siniestralidad ({ajustes?.ajuste.AjustePrima}%):
                </span>
                <span>+{formatCurrency(ajusteSiniestralidad)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Subtotal con ajuste siniestralidad:</span>
              <span>{formatCurrency(subtotalSiniestralidad)}</span>
            </div>

            {ajusteTipoPago > 0 && (
              <div className="flex justify-end gap-4 items-center text-amber-600">
                <span className="font-medium">
                  Ajuste por tipo de pago ({tipoPago?.PorcentajeAjuste}%):
                </span>
                <span>+{formatCurrency(ajusteTipoPago)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Subtotal con ajuste tipo pago:</span>
              <span>{formatCurrency(subtotalTipoPago)}</span>
            </div>

            {descuentoBonificacion > 0 && (
              <div className="flex justify-end gap-4 items-center text-green-600">
                <span className="font-medium">
                  Bonificación técnica ({bonificacion}%):
                </span>
                <span>-{formatCurrency(descuentoBonificacion)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center font-medium">
              <span>Costo Neto:</span>
              <span>{formatCurrency(costoNeto)}</span>
            </div>

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Derecho de póliza:</span>
              <span>+{formatCurrency(derechoPoliza)}</span>
            </div>

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">IVA (16%):</span>
              <span>+{formatCurrency(iva)}</span>
            </div>

            {detallesPago && (
              <>
                <div className="flex justify-end gap-4 items-center pt-2 border-t">
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