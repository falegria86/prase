import { z } from "zod"

export const editReglaNegocioSchema = z.object({
    NombreRegla: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    Descripcion: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
    TipoAplicacion: z.string().min(1, {
        message: "El tipo de aplicación es requerido"
    }),
    TipoRegla: z.string().min(1, {
        message: "El tipo de regla es requerido"
    }),
    ValorAjuste: z.string().min(1, {
        message: "El valor de ajuste es requerido"
    }),
    Condicion: z.string().min(1, {
        message: "La condición es requerida"
    }),
    EsGlobal: z.boolean(),
    Activa: z.boolean(),
    CodigoPostal: z.string().min(1, {
        message: "El código postal es requerido"
    }),
    condiciones: z.array(z.object({
        CondicionID: z.number(),
        Campo: z.string().min(1, {
            message: "El campo es requerido"
        }),
        Operador: z.string().min(1, {
            message: "El operador es requerido"
        }),
        Valor: z.string().min(1, {
            message: "El valor es requerido"
        })
    })),
});

export const nuevaReglaNegocioSchema = z.object({
    NombreRegla: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    Descripcion: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
    TipoAplicacion: z.string().min(1, {
        message: "El tipo de aplicación es requerido"
    }),
    TipoRegla: z.string().min(1, {
        message: "El tipo de regla es requerido"
    }),
    ValorAjuste: z.string().min(1, {
        message: "El valor de ajuste es requerido"
    }),
    Condicion: z.string().min(1, {
        message: "La condición es requerida"
    }),
    EsGlobal: z.boolean(),
    Activa: z.boolean(),
    CodigoPostal: z.string().min(1, {
        message: "El código postal es requerido"
    }),
    condiciones: z.array(z.object({
        Campo: z.string().min(1, {
            message: "El campo es requerido"
        }),
        Operador: z.string().min(1, {
            message: "El operador es requerido"
        }),
        Valor: z.string().min(1, {
            message: "El valor es requerido"
        })
    })),
});