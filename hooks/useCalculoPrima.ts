import { UseFormReturn } from "react-hook-form";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iAjustesCP } from "@/interfaces/AjustesCPInterace";
import { FormData } from "@/types/cotizador";

interface CalculosPrimaParams {
    form: UseFormReturn<FormData>;
    costoBase: number;
    ajustesCP?: iAjustesCP;
    tipoPago?: iGetTipoPagos;
}

export const useCalculosPrima = () => {
    const calcularAjustes = ({
        form,
        costoBase,
        ajustesCP,
        tipoPago,
    }: CalculosPrimaParams) => {
        const ajusteSiniestralidad = ajustesCP?.ajuste
            ? costoBase * (parseFloat(ajustesCP.ajuste.AjustePrima) / 100)
            : 0;

        const derechoPoliza = form.getValues("DerechoPoliza");
        const subtotalSiniestralidad = costoBase + ajusteSiniestralidad;

        const ajusteTipoPago = tipoPago
            ? (derechoPoliza + subtotalSiniestralidad) * (parseFloat(tipoPago.PorcentajeAjuste) / 100)
            : 0;

        const subtotalTipoPago = subtotalSiniestralidad + ajusteTipoPago;

        const porcentajeDescuento = form.getValues("PorcentajeDescuento") || 0;
        const bonificacion = subtotalTipoPago * (porcentajeDescuento / 100);
        const costoNeto = subtotalTipoPago - bonificacion;

        const montoAntesIVA = costoNeto + derechoPoliza;
        const iva = montoAntesIVA * 0.16;
        const total = montoAntesIVA + iva;

        // Guardar todos los valores calculados en el formulario
        form.setValue("CostoBase", costoBase);
        form.setValue("AjusteSiniestralidad", ajusteSiniestralidad);
        form.setValue("AjusteCP", Number(ajustesCP?.ajuste?.AjustePrima) || 0);
        form.setValue("AjusteTipoPago", ajusteTipoPago);
        form.setValue("SubtotalSiniestralidad", subtotalSiniestralidad);
        form.setValue("SubtotalTipoPago", subtotalTipoPago);
        form.setValue("CostoNeto", costoNeto);
        form.setValue("IVA", iva);
        form.setValue("PrimaTotal", total);

        return {
            ajusteSiniestralidad,
            subtotalSiniestralidad,
            ajusteTipoPago,
            subtotalTipoPago,
            bonificacion,
            costoNeto,
            iva,
            total
        };
    };

    const obtenerPagos = (
        total: number,
        tipoPago: iGetTipoPagos,
        derechoPoliza: number
    ) => {
        if (!tipoPago || tipoPago.Divisor === 1) return null;

        const numeroPagos = tipoPago.Divisor;
        const porcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste) / 100;

        const montoPrimerPagoBase = (total / numeroPagos) + derechoPoliza;
        const montoPrimerPagoAjustado = montoPrimerPagoBase * (1 + porcentajeAjuste);
        const primerPago = montoPrimerPagoAjustado * 1.16;

        const montoTotalAjustado = ((total + derechoPoliza) * (1 + porcentajeAjuste)) * 1.16;
        const pagoSubsecuente = (montoTotalAjustado - primerPago) / (numeroPagos - 1);

        return {
            primerPago,
            pagoSubsecuente,
            numeroPagosSubsecuentes: numeroPagos - 1
        };
    };

    return {
        calcularAjustes,
        obtenerPagos
    };
};