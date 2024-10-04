import { z } from "zod"

export const nuevoPaqueteSchema = z.object({
    NombrePaquete: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    DescripcionPaquete: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
});

export const editPaqueteSchema = z.object({
    NombrePaquete: z.string(),
    DescripcionPaquete: z.string(),
});

export const nuevoDeducibleSchema = z.object({
    DeducibleMinimo: z.coerce.number().min(1, {
        message: "El deducible mínimo es requerido"
    }),
    DeducibleMaximo: z.coerce.number().min(1, {
        message: "El deducible máximo es requerido"
    }),
    Rango: z.coerce.number().min(1, {
        message: "El rango es requerido"
    }),
});

export const editDeducibleSchema = z.object({
    DeducibleMinimo: z.coerce.number(),
    DeducibleMaximo: z.coerce.number(),
    Rango: z.coerce.number(),
});

export const editTipoSumaSchema = z.object({
    NombreTipo: z.string().min(1, "El nombre es requerido"),
    DescripcionSuma: z.string().min(1, "La descripción es requerida"),
});

export const nuevoTipoSumaSchema = z.object({
    NombreTipo: z.string().min(1, "El nombre es requerido"),
    DescripcionSuma: z.string().min(1, "La descripción es requerida"),
});

export const nuevaCoberturaSchema = z.object({
    NombreCobertura: z.string().min(1, {
        message: 'Nombre de la cobertura es requerido',
    }),
    Descripcion: z.string().min(1, {
        message: 'Descripción es requerida',
    }),
    PrimaBase: z.string().min(1, {
        message: 'Prima base es requerida',
    }),
    SumaAseguradaMin: z.string().min(1, {
        message: 'Suma asegurada mínima es requerida',
    }),
    SumaAseguradaMax: z.string().min(1, {
        message: 'Suma asegurada máxima es requerida',
    }),
    DeducibleMin: z.string().min(1, {
        message: 'Deducible mínimo es requerido',
    }),
    DeducibleMax: z.string().min(1, {
        message: 'Deducible máximo es requerido',
    }),
    PorcentajePrima: z.string().min(1, {
        message: 'Porcentaje de prima es requerido',
    }),
    RangoSeleccion: z.string().min(1, {
        message: 'Rango de selección es requerido',
    }),
    EsCoberturaEspecial: z.boolean({
        required_error: 'EsCoberturaEspecial es requerido',
    }),
    Variable: z.boolean({
        required_error: 'Variable es requerido',
    }),
    SinValor: z.boolean({
        required_error: 'SinValor es requerido',
    }),
    AplicaSumaAsegurada: z.boolean({
        required_error: 'AplicaSumaAsegurada es requerido',
    }),
});

export const editCoberturaSchema = z.object({
    NombreCobertura: z.string(),
    Descripcion: z.string(),
    PrimaBase: z.string(),
    SumaAseguradaMin: z.string(),
    SumaAseguradaMax: z.string(),
    DeducibleMin: z.string(),
    DeducibleMax: z.string(),
    PorcentajePrima: z.string(),
    RangoSeleccion: z.string(),
    EsCoberturaEspecial: z.boolean(),
    Variable: z.boolean(),
    SinValor: z.boolean(),
    AplicaSumaAsegurada: z.boolean(),
});

export const nuevaAsociacionSchema = z.object({
    paqueteId: z.coerce.number().min(1, { message: "Paquete es requerido" }),
    coberturaIds: z.array(z.number()).min(1, "Debe seleccionar al menos una cobertura"),
    obligatoria: z.boolean(),
});