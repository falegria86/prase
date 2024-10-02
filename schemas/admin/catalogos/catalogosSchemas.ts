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