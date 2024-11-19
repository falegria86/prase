export interface iGetCoberturas {
    CoberturaID: number;
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: string;
    SumaAseguradaMin: string;
    SumaAseguradaMax: string;
    DeducibleMin: string;
    DeducibleMax: string;
    PorcentajePrima: string;
    RangoSeleccion: string;
    EsCoberturaEspecial: boolean;
    Variable: boolean;
    SinValor: boolean;
    AplicaSumaAsegurada: boolean;
    IndiceSiniestralidad: null;
    CoberturaAmparada: boolean;
    sumaAseguradaPorPasajero: boolean;
    tipoDeducible: TipoDeducible;
    tipoMoneda: TipoMoneda;
}

export interface TipoDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

export interface TipoMoneda {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
}


export interface TipoDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

export interface iPostCobertura {
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: number;
    SumaAseguradaMin: number;
    SumaAseguradaMax: number;
    DeducibleMin: number;
    DeducibleMax: number;
    PorcentajePrima: number;
    RangoSeleccion: number;
    EsCoberturaEspecial: boolean;
    Variable: boolean;
    SinValor: boolean;
    AplicaSumaAsegurada: boolean;
    tipoDeducible: TipoDeduciblePost;
    tipoMoneda: TipoMonedaPost;
}

export interface TipoDeduciblePost {
    TipoDeducibleID: number;
}

export interface TipoMonedaPost {
    TipoMonedaID: number;
}

export interface iPostCoberturaResp {
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: string;
    SumaAseguradaMin: string;
    SumaAseguradaMax: string;
    DeducibleMin: string;
    DeducibleMax: string;
    PorcentajePrima: string;
    RangoSeleccion: string;
    EsCoberturaEspecial: boolean;
    Variable: boolean;
    SinValor: boolean;
    CoberturaID: number;
}

export interface iPatchCobertura {
    NombreCobertura?: string;
    Descripcion?: string;
    PrimaBase?: string;
    SumaAseguradaMin?: string;
    SumaAseguradaMax?: string;
    DeducibleMin?: string;
    DeducibleMax?: string;
    PorcentajePrima?: string;
    RangoSeleccion?: string;
    EsCoberturaEspecial?: boolean;
    Variable?: boolean;
    SinValor?: boolean;
    AplicaSumaAsegurada?: boolean;
}

export interface iGetTiposMoneda {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
}
