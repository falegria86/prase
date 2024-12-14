export interface iPostPoliza {
    CotizacionID: number;
    FechaInicio: Date | string;
    FechaFin: Date | string;
    EstadoPoliza: string;
    PrimaTotal: number;
    TotalPagos: number;
    NumeroPagos: number;
    DescuentoProntoPago: number;
    TipoPagoID: number;
    VersionActual: number;
    TieneReclamos: boolean;
    VehiculoID: number;
    ClienteID: number;
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
    tieneDocumentos?: boolean;
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

export interface iGetDocumentos {
    DocumentoDigitalizadoID: number;
    RutaArchivo: string;
    FechaCarga: Date;
    EstadoDocumento: string;
    Documento: Documento;
    Poliza: Poliza;
}

export interface Documento {
    DocumentoID: number;
    NombreDocumento: string;
    Descripcion: string;
}

export interface Poliza {
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
}


export interface iPostDocumento {
    Base64: string;
    PolizaID: number;
    DocumentoID: number;
    EstadoDocumento: string;
}
