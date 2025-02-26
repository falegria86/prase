export interface InicioCaja {
    InicioCajaID: number;
    FechaInicio: string;
    FechaActualizacion: string;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
}

export interface IGetAllCorteDia {
    CorteUsuarioID: number;
    FechaCorte: string;
    FechaActualizacion: string;
    TotalIngresos: string;
    TotalIngresosEfectivo: string;
    TotalIngresosTarjeta: string;
    TotalIngresosTransferencia: string;
    TotalEgresos: string;
    TotalEgresosEfectivo: string;
    TotalEgresosTarjeta: string;
    TotalEgresosTransferencia: string;
    TotalEfectivo: string;
    TotalPagoConTarjeta: string;
    TotalTransferencia: string;
    SaldoEsperado: string;
    SaldoReal: string;
    TotalEfectivoCapturado: string;
    TotalTarjetaCapturado: string;
    TotalTransferenciaCapturado: string;
    Diferencia: string;
    Observaciones: string;
    Estatus: string;
    InicioCaja: InicioCaja;
}
