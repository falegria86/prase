import { z } from "zod";

export const editarInicioCajaSchema = z.object({
    MontoInicial: z.coerce.number().min(1, {
        message: 'El deber monto inicial ser mayor a 0'
    }),
    TotalEfectivo: z.coerce.number(),
    TotalTransferencia: z.coerce.number(),
    Estatus: z.string().min(1, {
        message: 'El estatus es requerido'
    }),
})

export const nuevoInicioCajaSchema = z.object({
    MontoInicial: z.number().min(1, { message: "El monto inicial es requerido" }),
    TotalEfectivo: z.number().min(1, { message: "El total de efectivo es requerido" }),
    TotalTransferencia: z.number().min(1, { message: "El total de transferencia es requerido" }),
    UsuarioID: z.number().min(1, { message: "El usuario es requerido" }),
    UsuarioAutorizoID: z.number(),
})
