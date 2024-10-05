import { z } from "zod";

export const nuevaCotizacionSchema = z.object({
    anio: z.coerce.number().min(1930, {
        message: "El año es requerido"
    }),
    marca: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    uso: z.string().min(1, {
        message: "El uso del vehículo es requerido."
    }),
    tipoVehiculo: z.string().min(1, {
        message: "El tipo de vehículo es requerido."
    }),
    tipo: z.string().min(3, {
        message: "El tipo es requerido."
    }),
    version: z.string().min(3, {
        message: "La versión es requerida."
    }),
    amis: z.coerce.number().min(1, {
        message: "AMIS es requerido."
    }),
    unidadSalvamento: z.string().min(1, {
        message: "Unidad de salvamento es requerida."
    }),
    serie: z.string(),
    ubicacion: z.string().min(3, {
        message: "La ubicación es requerida."
    }),

    derechoPoliza: z.string(),
    vigencia: z.string().min(1, {
        message: "La vigencia es requerida."
    }),
    meses: z.coerce.number(),
    inicioVigencia: z.string().min(1, {
        message: "El inicio de vigencia es requerido."
    }),
    finVigencia: z.string(),
    tipoSumaAsegurada: z.string().min(1, {
        message: "El tipo de suma asegurada es requerido."
    }),
    sumaAsegurada: z.coerce.number().min(1, {
        message: "La suma asegurada es requerida."
    }),
    periodoGracia: z.string().min(1, {
        message: "El período de gracia es requerido."
    }),
    moneda: z.string(),
    nombreAsegurado: z.string(),
});
