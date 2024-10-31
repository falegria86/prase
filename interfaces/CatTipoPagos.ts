export interface iGetTipoPagos {
    TipoPagoID: number;
    Descripcion: string;
    PorcentajeAjuste: string;
}

export interface iPostTipoPago {
    Descripcion: string;
    PorcentajeAjuste: number;
}

export interface iPatchTipoPago {
    Descripcion?: string;
    PorcentajeAjuste?: number;
}
