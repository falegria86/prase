

export interface iGetAnios {
    Clave: string;
    Nombre: string;
}

export interface iGetMarcasPorAnio {
    Clave: string;
    Nombre: string;
}

export interface iGetModelosPorAnioMarca {
    Clave: string;
    Nombre: string;
}

export interface iGetVersionesPorAnioMarcaModelo {
    Clave: string;
    Nombre: string;
}

export interface iGetPrecioVersionPorClave {
    Venta: string;
    Compra: string;
    Moneda: string;
}