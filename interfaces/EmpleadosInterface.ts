export interface iGetEmpleados {
    EmpleadoID: number;
    Nombre: string;
    Paterno: string;
    Materno: null | string;
    FechaNacimiento: Date;
    SueldoQuincenal: string;
    PorcentajeComisiones: string;
    TipoEmpleado: TipoEmpleado | null;
}

export interface TipoEmpleado {
    TipoEmpleadoID: number;
    Descripcion: string;
}
