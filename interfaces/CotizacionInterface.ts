export interface iGetCotizacion {
    CotizacionID: number;
    UsuarioID: number;
    FechaCotizacion: Date;
    PrimaTotal: string;
    EstadoCotizacion: string;
    TipoPagoID: number;
    PorcentajeDescuento: string;
    DerechoPoliza: string;
    TipoSumaAseguradaID: number;
    SumaAsegurada: string;
    PeriodoGracia: number;
    PaqueteCoberturaID: number;
    FechaUltimaActualizacion: Date | null;
    UsoVehiculo: number;
    TipoVehiculo: number;
    AMIS: null | string;
    NombrePersona: string;
    UnidadSalvamento: number;
    VIN: string;
    CP: string;
    Marca: string;
    Submarca: string;
    Modelo: string;
    Version: string;
    Correo: null | string;
    Telefono: null | string;
    detalles: any[];
}


export interface iPostCotizacion {
    UsuarioID: number;
    PrimaTotal: number;
    Correo: string;
    Telefono: string;
    EstadoCotizacion: string;
    TipoPagoID: number;
    PorcentajeDescuento: number;
    DerechoPoliza: number;
    TipoSumaAseguradaID: number;
    SumaAsegurada: number;
    PeriodoGracia: number;
    PaqueteCoberturaID: number;
    UsoVehiculo: number;
    TipoVehiculo: number;
    NombrePersona: string;
    UnidadSalvamento: boolean;
    VIN: string;
    CP: string;
    Marca: string;
    Submarca: string;
    Modelo: string;
    Version: string;
    detalles: Detalle[];
}

export interface Detalle {
    CoberturaID: number;
    MontoSumaAsegurada: number;
    DeducibleID: number;
    MontoDeducible: number;
    PrimaCalculada: number;
    PorcentajePrimaAplicado: number;
    ValorAseguradoUsado: number;
}

export interface iPatchCotizacion {
    PrimaTotal?: number;
    EstadoCotizacion?: string;
    TipoPagoID?: number;
    PorcentajeDescuento?: number;
    DerechoPoliza?: number;
    SumaAsegurada?: number;
    NombrePersona?: string;
    UnidadSalvamento?: boolean;
    Marca?: string;
    Submarca?: string;
    Modelo?: string;
    Version?: string;
    detalles?: Detalle[];
}

export interface Detalle {
    CoberturaID: number;
    MontoSumaAsegurada: number;
    DeducibleID: number;
    MontoDeducible: number;
    PrimaCalculada: number;
    PorcentajePrimaAplicado: number;
    ValorAseguradoUsado: number;
}
