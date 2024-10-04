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
}

export interface iPostCobertura {
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
