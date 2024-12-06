import { formatCurrency } from "./format";

// Interfaces compartidas
interface DetalleMostrado {
    CoberturaID: number;
    NombreCobertura: string;
    Descripcion: string;
    MontoSumaAsegurada: number;
    DeducibleID: number;
    MontoDeducible: number;
    PrimaCalculada: number;
    PorcentajePrimaAplicado: number;
    ValorAseguradoUsado: number;
    DisplaySumaAsegurada?: string;
    DisplayDeducible?: string;
    TipoMoneda?: string;
    EsAmparada?: boolean;
    SumaAseguradaPorPasajero?: boolean;
    TipoDeducible?: string;
}

// Funciones de utilidad compartidas
export const obtenerValorSumaAsegurada = (detalle: DetalleMostrado): React.ReactNode => {
    if (detalle.EsAmparada || detalle.MontoSumaAsegurada === 0) {
        return "AMPARADA";
    }

    if (detalle.DisplaySumaAsegurada) {
        return detalle.DisplaySumaAsegurada;
    }

    if (detalle.TipoMoneda === "UMA") {
        return `${detalle.MontoSumaAsegurada} UMAS`;
    }

    if (detalle.SumaAseguradaPorPasajero) {
        return (
            <div className="flex flex-col gap-1" >
                <span>{formatCurrency(detalle.MontoSumaAsegurada)} </span>
                <span className="text-sm text-muted-foreground" > POR CADA PASAJERO </span>
            </div>
        );
    }

    return formatCurrency(detalle.MontoSumaAsegurada);
};

export const obtenerValorDeducible = (detalle: DetalleMostrado): string => {
    if (detalle.TipoDeducible === "UMA") {
        return `${detalle.MontoDeducible} UMAS`;
    }

    return detalle.MontoDeducible > 0 ? `${detalle.MontoDeducible}%` : "NO APLICA";
};

export const generarColumnasPDF = (detalles: DetalleMostrado[]): string[][] => {
    return detalles.map(detalle => [
        detalle.NombreCobertura,
        detalle.EsAmparada
        ? 'AMPARADA' : detalle.MontoSumaAsegurada === 0 ? 'AMPARADA'
        : detalle.TipoMoneda === "UMA" ? `${detalle.MontoSumaAsegurada} UMAS` :
                detalle.SumaAseguradaPorPasajero ? `${formatCurrency(detalle.MontoSumaAsegurada)} POR PASAJERO` :
                    formatCurrency(detalle.MontoSumaAsegurada),
        obtenerValorDeducible(detalle),
        formatCurrency(detalle.PrimaCalculada)
    ]);
};