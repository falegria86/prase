import { z } from "zod";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import { UseFormReturn } from "react-hook-form";
import { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";

export interface Brand {
    Clave: string;
    Nombre: string;
}

export interface Model {
    Clave: string;
    Nombre: string;
}

export interface Version {
    Clave: string;
    Nombre: string;
}

export interface Price {
    Venta: number;
    Compra: number;
}
// Tipo básico para el formulario
export type FormData = z.infer<typeof nuevaCotizacionSchema>;

// Interfaces para la navegación por pasos
export interface Step {
    title: string;
    icon: string;
    description?: string;
}

// Props principales para los componentes de pasos
export interface StepProps {
    form: UseFormReturn<FormData>;
    apiKey?: string;
    tiposVehiculo?: TipoVehiculo[];
    usosVehiculo?: UsoVehiculo[];
    years?: Year[];
    tiposPagos?: TipoPago[];
    tiposSumas?: iGetTiposSumasAseguradas[];
    paquetesCobertura?: PaqueteCobertura[];
    coberturas?: Cobertura[];
    asociaciones?: AsociacionPaqueteCobertura[];
    reglasGlobales?: ReglaGlobal[];
    setIsStepValid?: (valid: boolean) => void;
}

// Interfaces para los datos del vehículo
export interface TipoVehiculo {
    TipoID: number;
    Nombre: string;
    uso: UsoVehiculo;
}

export interface UsoVehiculo {
    UsoID: number;
    Nombre: string;
}

export interface Year {
    Clave: string;
    Nombre: string;
}

// Interfaces para tipos de pago y sumas aseguradas
export interface TipoPago {
    TipoPagoID: number;
    Descripcion: string;
    PorcentajeAjuste: string;
}

export interface TipoSumaAsegurada {
    TipoSumaAseguradaID: number;
    NombreTipo: string;
    DescripcionSuma: string;
    FechaCreacion: Date | null;
}

// Interfaces para coberturas y paquetes
export interface PaqueteCobertura {
    PaqueteCoberturaID: number;
    NombrePaquete: string;
    DescripcionPaquete: string;
    FechaCreacion: Date;
    PrecioTotalFijo: string;
}

export interface Cobertura {
    CoberturaID: number;
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: string;
    SumaAseguradaMin: string;
    SumaAseguradaMax: string;
    DeducibleMin: string;
    DeducibleMax: string;
    PorcentajePrima: string;
    RangoSeleccion: string;
    EsCoberturaEspecial: boolean;
    Variable: boolean;
    SinValor: boolean;
    AplicaSumaAsegurada: boolean;
    tipoDeducible: TipoDeducible | null;
    tipoMoneda: TipoMoneda | null;
}

export interface AsociacionPaqueteCobertura {
    PaqueteCoberturaID: number;
    CoberturaID: number;
    FechaAsociacion: Date;
    Obligatoria: boolean;
}

export interface TipoDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

export interface TipoMoneda {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
}

// Interfaces para reglas de negocio
export interface ReglaGlobal {
    ReglaID: number;
    NombreRegla: string;
    Descripcion: string;
    TipoAplicacion: "PORCENTAJE" | "MONTO";
    TipoRegla: string;
    ValorAjuste: number;
    Condicion: string;
    EsGlobal: boolean;
    Activa: boolean;
    CodigoPostal: string;
    cobertura: Cobertura | null;
    condiciones: CondicionReglaNegocio[];
}

export interface CondicionReglaNegocio {
    CondicionID?: number;
    Campo: string;
    Operador: string;
    Valor: string;
    CodigoPostal: string;
}

// Interfaces para la respuesta del Libro Azul
export interface LibroAzulResponse {
    Clave: string;
    Nombre: string;
}

// Interface para el detalle de cobertura
export interface DetalleCoberturaForm {
    CoberturaID: number;
    MontoSumaAsegurada: number;
    DeducibleID: number;
    MontoDeducible: number;
    PrimaCalculada: number;
    PorcentajePrimaAplicado: number;
    ValorAseguradoUsado: number;
    NombreCobertura: string;
    Obligatoria: boolean;
    AplicaSumaAsegurada: boolean;
}

// Utilidades y funciones de formato
// export const formatCurrency = (amount: number): string => {
//     return new Intl.NumberFormat("es-MX", {
//         style: "currency",
//         currency: "MXN",
//     }).format(amount);
// };

export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Función de cálculo de prima
export const calculatePremium = (
    cobertura: Cobertura,
    selectedSumaAsegurada: number,
    selectedDeducible: number,
    reglasGlobales: ReglaGlobal[]
): number => {
    let prima = 0;

    if (cobertura.PrimaBase) {
        prima = parseFloat(cobertura.PrimaBase);

        const reglasCobertura = reglasGlobales.filter(
            (regla) =>
                regla.cobertura?.CoberturaID === cobertura.CoberturaID &&
                regla.Activa
        );

        reglasCobertura.forEach((regla) => {
            if (regla.TipoAplicacion === "PORCENTAJE") {
                prima *= 1 + regla.ValorAjuste / 100;
            } else if (regla.TipoAplicacion === "MONTO") {
                prima += regla.ValorAjuste;
            }
        });
    } else {
        const porcentajePrima = parseFloat(cobertura.PorcentajePrima) / 100;
        prima = selectedSumaAsegurada * porcentajePrima;
    }

    prima *= 1 - selectedDeducible / 100;

    return prima;
};

// Constantes
export const STEPS: Step[] = [
    { title: "Origen y uso", icon: "Car" },
    { title: "Datos del vehículo", icon: "Truck" },
    { title: "Datos de cotización", icon: "FileText" },
    { title: "Coberturas", icon: "Shield" },
    { title: "Resumen", icon: "CheckCircle" },
];

// Validadores
export const isValidPostalCode = (cp: string): boolean => {
    return /^\d{5}$/.test(cp);
};

export const isValidVIN = (vin: string): boolean => {
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
};