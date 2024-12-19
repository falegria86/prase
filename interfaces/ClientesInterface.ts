export interface iPostCliente {
    NombreCompleto: string;
    FechaNacimiento: string;
    Genero: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    HistorialSiniestros: number;
    HistorialReclamos: number;
    ZonaResidencia: string;
    FechaRegistro: string;
    RFC: string;
}

export interface iGetCliente {
    ClienteID: number;
    NombreCompleto: string;
    FechaNacimiento: string;
    Genero: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    HistorialSiniestros: number;
    HistorialReclamos: number;
    ZonaResidencia: string;
    FechaRegistro: string;
    RFC: string | null;
}

export interface iPatchCliente {
    Direccion: string;
    Telefono: string;
}