export interface ICondicionReglaNegocio {
    CondicionID?: number;
    Campo: string;
    Operador: string;
    Valor: string;
    CodigoPostal: string;
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
}

export interface iGetAllReglaNegocio {
    ReglaID: number;
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    ValorAjuste: number;
    Condicion: string;
    EsGlobal: boolean;
    Activa: boolean;
    CodigoPostal: string;
    cobertura: iGetAllCobertura;
    condiciones: ICondicionReglaNegocio[];
}

export interface iPostReglaNegocio {
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    ValorAjuste: number;
    Condicion: string;
    EsGlobal: boolean;
    Activa: boolean;
    CodigoPostal: string;
    cobertura: iPostCobertura;
    condiciones: ICondicionReglaNegocio[];
}

export interface iPatchReglaNegocio {
    NombreRegla: string;
    ValorAjuste: number;
    EsGlobal: boolean;
    Activa: boolean;
    cobertura: iPostCobertura;
    condiciones: ICondicionReglaNegocio[];
}
