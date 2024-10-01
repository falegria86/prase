export interface iGetAllPaquetes {
    PaqueteCoberturaID: number;
    NombrePaquete: string;
    DescripcionPaquete: string;
    FechaCreacion: Date;
}

export interface iPostPaqueteCobertura {
    NombrePaquete: string;
    DescripcionPaquete: string;
}

export interface iPatchPaqueteCobertura {
    NombrePaquete?: string;
    DescripcionPaquete?: string;
}

export interface iPostPaqueteResp {
    NombrePaquete: string;
    DescripcionPaquete: string;
    PaqueteCoberturaID: number;
    FechaCreacion: Date;
}
