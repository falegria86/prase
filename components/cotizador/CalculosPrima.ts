interface DatosPrima {
    costoBase: number;
    ajustes?: {
        ajuste: {
            AjustePrima: string;
        };
    };
    tipoPago?: {
        PorcentajeAjuste: string;
        Divisor: number;
    };
    bonificacion?: number;
    derechoPoliza: number;
}

interface ResultadosCalculo {
    ajusteSiniestralidad: number;
    subtotalSiniestralidad: number;
    ajusteTipoPago: number;
    subtotalTipoPago: number;
    bonificacion: number;
    costoNeto: number;
    iva: number;
    total: number;
}

interface ResultadosPagos {
    primerPago: number;
    pagoSubsecuente: number;
    numeroPagosSubsecuentes: number;
}

export const calcularPrima = ({
    costoBase,
    ajustes,
    tipoPago,
    bonificacion = 0,
    derechoPoliza
}: DatosPrima): ResultadosCalculo => {
    const ajusteSiniestralidad = ajustes?.ajuste
        ? costoBase * (Number(ajustes.ajuste.AjustePrima) / 100)
        : 0;

    const subtotalSiniestralidad = Number(costoBase + ajusteSiniestralidad);

    const ajusteTipoPago = tipoPago
        ? (derechoPoliza + subtotalSiniestralidad) * (Number(tipoPago.PorcentajeAjuste) / 100)
        : 0;

    const subtotalTipoPago = subtotalSiniestralidad + ajusteTipoPago;
    const bonificacionMonto = subtotalTipoPago * (bonificacion / 100);
    const costoNeto = subtotalTipoPago - bonificacionMonto;

    const montoAntesIVA = costoNeto + derechoPoliza;
    const iva = montoAntesIVA * 0.16;
    const total = montoAntesIVA + iva;

    return {
        ajusteSiniestralidad,
        subtotalSiniestralidad,
        ajusteTipoPago,
        subtotalTipoPago,
        bonificacion: bonificacionMonto,
        costoNeto,
        iva,
        total
    };
};

export const calcularPagos = (
    total: number,
    tipoPago: { Divisor: number; PorcentajeAjuste: string },
    derechoPoliza: number,
    ajustes?: {
        ajuste: {
            AjustePrima: string;
        };
    },
    bonificacion = 0
): ResultadosPagos | null => {
    if (!tipoPago || tipoPago.Divisor === 1) return null;

    const resultados = calcularPrima({
        costoBase: total,
        ajustes,
        tipoPago,
        bonificacion,
        derechoPoliza
    });

    const numeroPagos = tipoPago.Divisor;
    const montoPrimerPagoBase = (total / numeroPagos) + derechoPoliza;
    const primerPago = montoPrimerPagoBase;
    const montoRestante = total - primerPago;
    const pagoSubsecuente = montoRestante / (numeroPagos - 1);
    console.log("costo base: ", total)
    console.log(montoPrimerPagoBase)

    return {
        primerPago,
        pagoSubsecuente,
        numeroPagosSubsecuentes: numeroPagos - 1
    };
};