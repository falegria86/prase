export interface iPostPoliza {
    CotizacionID: number;
    TipoPagoID: number;
    FechaInicio: Date;
    FechaFin: Date;
    PrimaTotal: number;
    TotalPagos: number;
    NumeroPagos: number;
    DescuentoProntoPago: number;
    TieneReclamos: boolean;
}

export interface iPatchPoliza {
    TipoPagoID?: number;
    FechaInicio?: Date;
    FechaFin?: Date;
    PrimaTotal?: number;
    TotalPagos?: number;
    NumeroPagos?: number;
    DescuentoProntoPago?: number;
    TieneReclamos?: boolean;
}

export interface iGetPolizas {
    PolizaID: number;
    NumeroPoliza: string;
    FechaInicio: Date;
    FechaFin: Date;
    EstadoPoliza: string;
    PrimaTotal: string;
    TotalPagos: string;
    NumeroPagos: number;
    DescuentoProntoPago: string;
    VersionActual: string;
    TieneReclamos: boolean;
    FechayHora: Date;
    FechaEmision: Date;
    historial: Historial[];
    detalles: Detalle[];
}

export interface Detalle {
    DetalleID: number;
    CoberturaID: number;
    MontoSumaAsegurada: string;
    MontoDeducible: string;
    PrimaCalculada: string;
    EsPoliza: boolean;
    PorcentajePrimaAplicado: string;
    ValorAseguradoUsado: string;
}

export interface Historial {
    HistorialID: number;
    NumeroPoliza: string;
    Version: number;
    FechaInicio: Date;
    FechaFin: Date;
    EstadoPoliza: string;
    TotalPagos: string;
    NumeroPagos: number;
    MontoPorPago: string;
    DescuentoProntoPago: string;
    FechaCancelacion: Date | null;
    MotivoCancelacion: string | null;
    FechaVersion: Date | null;
}
