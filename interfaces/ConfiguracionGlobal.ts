export interface IPostConfiguracionGlobal {
    NombreConfiguracion: string;
    ValorConfiguracion: number;
    Descripcion: string;
}

export interface IPatchConfiguracionGlobal {
    ValorConfiguracion: number;
    Descripcion: string;
}

export interface IGetAllConfiguracionGlobal {
    ConfiguracionID: number;
    NombreConfiguracion: string;
    ValorConfiguracion: number;
    Descripcion: string;
    UltimaActualizacion: string;
}