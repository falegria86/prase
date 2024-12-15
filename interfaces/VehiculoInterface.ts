export interface iPostVehiculo {
    ClienteID: number;
    Marca: string;
    Modelo: string;
    AnoFabricacion: number;
    TipoVehiculo: string;
    ValorVehiculo: number;
    ValorFactura: number;
    FechaRegistro: string;
    UsoVehiculo: string;
    ZonaResidencia: string;
    Salvamento: number;
    Placas: string;
    VIN: string;
    NoMotor: string;
}

export interface iGetVehiculo {
    VehiculoID: number;
    ClienteID: number;
    Marca: string;
    Modelo: string;
    AnoFabricacion: number;
    TipoVehiculo: string;
    ValorVehiculo: number;
    ValorFactura: number;
    FechaRegistro: string;
    UsoVehiculo: string;
    ZonaResidencia: string;
    Salvamento: number;
    Placas: null | string;
    VIN: null | string;
    NoMotor: null | string;
}

export interface iPatchVehiculo {
    ValorVehiculo: number;
    UsoVehiculo: string;
}