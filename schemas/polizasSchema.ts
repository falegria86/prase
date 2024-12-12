import { z } from "zod";

export const editarPolizaSchema = z.object({
    // FechaInicio: z.date({
    //     message: "La fecha de inicio es requerida",
    // }),
    // FechaFin: z.date({
    //     message: "La fecha de fin es requerida",
    // }),
    PrimaTotal: z.coerce.number().min(1, { message: "La prima total es requerida" }),
    TotalPagos: z.coerce.number().min(1, { message: "El total de pagos es requerido" }),
    NumeroPagos: z.coerce.number().min(1, { message: "El número de pagos es requerido" }),
    DescuentoProntoPago: z.coerce.number(),
    // TieneReclamos: z.boolean(),
});