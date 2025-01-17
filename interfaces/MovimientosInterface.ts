export interface iGetIniciosCaja {
    InicioCajaID: number;
    FechaInicio: Date;
    FechaActualizacion: Date;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
    Usuario: UsuarioInicioCaja;
    UsuarioAutorizo: UsuarioInicioCaja;
}

export interface UsuarioInicioCaja {
    UsuarioID: number;
    NombreUsuario: string;
    Contrasena: string;
    EmpleadoID: number | null;
    SucursalID: null;
}

export interface iPostInicioCaja {
    UsuarioID: number;
    UsuarioAutorizoID: number;
    MontoInicial: number;
    FirmaElectronica: string;
    TotalEfectivo: number;
    TotalTransferencia: number;
}

export interface iPatchInicioCaja {
    MontoInicial?: number;
    TotalEfectivo?: number;
    TotalTransferencia?: number;
    FirmaElectronica?: string;
    Estatus?: string;
}

export interface iGetInicioActivo {
    InicioCajaID: number;
    FechaInicio: Date;
    FechaActualizacion: Date;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
    Usuario: UsuarioInicioCaja;
    UsuarioAutorizo: UsuarioInicioCaja;
}