export interface ICondicionReglaNegocio {
    CondicionID?: number;
    Campo: string;
    Operador: string;
    Valor: string;
}

export interface iGetAllReglaNegocio {
    ReglaID: number;
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    ValorAjuste: string;
    Condicion: string;
    EsGlobal: boolean;
    Activa: boolean;
    CodigoPostal: string;
    condiciones: ICondicionReglaNegocio[];
}

export interface iPostReglaNegocio {
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    ValorAjuste: string;
    Condicion: string;
    EsGlobal: boolean;
    Activa: boolean;
    CodigoPostal: string;
    condiciones: ICondicionReglaNegocio[];
}

export interface iPatchReglaNegocio {
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: string;
    TipoRegla: string;
    ValorAjuste: string;
    Condicion: string;
    EsGlobal: boolean;
    Activa: boolean;
    CodigoPostal: string;
    condiciones: ICondicionReglaNegocio[];
}