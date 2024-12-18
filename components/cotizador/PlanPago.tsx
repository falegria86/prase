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
import { useCalculosPrima } from "@/hooks/useCalculoPrima";

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
  const { calcularAjustes, obtenerPagos } = useCalculosPrima();
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

  const tipoPagoSeleccionado = form.watch("TipoPagoID");
  const bonificacion = form.watch("PorcentajeDescuento") || 0;
  const tipoPago = tiposPagos.find((t) => t.TipoPagoID === tipoPagoSeleccionado);

  const resultados = calcularAjustes({
    form,
    costoBase,
    ajustesCP: ajustes,
    tipoPago
  });

  const detallesPago = tipoPago ? obtenerPagos(
    costoBase,
    tipoPago,
    derechoPoliza
  ) : null;

  const validarBonificacion = (valor: string): number => {
    if (valor === "") return 0;
    const numero = Math.min(Math.max(Number(valor), 0), 35);
    return isNaN(numero) ? 0 : numero;
  };

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
                    const tipoPago = tiposPagos.find(t => t.TipoPagoID === tipoPagoId);
                    calcularAjustes({
                      form,
                      costoBase,
                      ajustesCP: ajustes,
                      tipoPago
                    });
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
                      calcularAjustes({
                        form,
                        costoBase,
                        ajustesCP: ajustes,
                        tipoPago
                      });
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

            {resultados.ajusteSiniestralidad > 0 && (
              <div className="flex justify-end gap-4 items-center text-amber-600">
                <span className="font-medium">
                  Ajuste por siniestralidad ({ajustes?.ajuste.AjustePrima}%):
                </span>
                <span>+{formatCurrency(resultados.ajusteSiniestralidad)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Subtotal con ajuste siniestralidad:</span>
              <span>{formatCurrency(resultados.subtotalSiniestralidad)}</span>
            </div>

            {resultados.ajusteTipoPago > 0 && (
              <div className="flex justify-end gap-4 items-center text-amber-600">
                <span className="font-medium">
                  Ajuste por tipo de pago ({tipoPago?.PorcentajeAjuste}%):
                </span>
                <span>+{formatCurrency(resultados.ajusteTipoPago)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Subtotal con ajuste tipo pago:</span>
              <span>{formatCurrency(resultados.subtotalTipoPago)}</span>
            </div>

            {resultados.bonificacion > 0 && (
              <div className="flex justify-end gap-4 items-center text-green-600">
                <span className="font-medium">
                  Bonificación técnica ({bonificacion}%):
                </span>
                <span>-{formatCurrency(resultados.bonificacion)}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 items-center font-medium">
              <span>Costo Neto:</span>
              <span>{formatCurrency(resultados.costoNeto)}</span>
            </div>

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">Derecho de póliza:</span>
              <span>+{formatCurrency(derechoPoliza)}</span>
            </div>

            <div className="flex justify-end gap-4 items-center">
              <span className="font-medium">IVA (16%):</span>
              <span>+{formatCurrency(resultados.iva)}</span>
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
                    {detallesPago.numeroPagosSubsecuentes === 1 ? "pago" : "pagos"}{" "}
                    subsecuentes:
                  </span>
                  <span>{formatCurrency(detallesPago.pagoSubsecuente)}</span>
                </div>
              </>
            )}

            <div className="flex justify-end gap-4 items-center pt-2 border-t">
              <span className="text-lg font-semibold">Costo Total Anual:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(resultados.total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};