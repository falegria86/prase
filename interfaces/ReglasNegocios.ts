export interface ICondicionReglaNegocio {
    CondicionID?: number;
    Campo: string;
    Operador: string;
    Valor: string;
    Evaluacion: string;
}

export interface iPostCobertura {
    CoberturaID: number | null;
}

export interface iGetAllCobertura {
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
    tipoDeducible: TipoDeducible | null;
    tipoMoneda: TipoMoneda | null;
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


export interface iGetAllReglaNegocio {
    ReglaID: number;
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: "PORCENTAJE" | "GLOBAL";
    TipoRegla: string;
    EsGlobal: boolean;
    Activa: boolean;
    cobertura: iGetAllCobertura;
    condiciones: ICondicionReglaNegocio[];
}

export interface iPostReglaNegocio {
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    EsGlobal: boolean;
    Activa: boolean;
    cobertura: iPostCobertura;
    condiciones: ICondicionReglaNegocio[];
}

export interface iPatchReglaNegocio {
    NombreRegla: string;
    EsGlobal: boolean;
    Activa: boolean;
    cobertura: iPostCobertura;
    condiciones: ICondicionReglaNegocio[];
}
