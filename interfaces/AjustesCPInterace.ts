export interface iAjustesCP {
  message: string;
  ajuste: Ajuste;
}

export interface Ajuste {
  CodigoPostal: string;
  IndiceSiniestros: string;
  AjustePrima: string;
  CantSiniestros: number;
  UltimaActualizacion: Date;
}
