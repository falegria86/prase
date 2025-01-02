import { z } from "zod";

export const editarPolizaSchema = z.object({
    EstadoPoliza: z.enum(["PERIODO DE GRACIA", "ACTIVA", "PENDIENTE"]),
    PrimaTotal: z.coerce.number().min(1, {
        message: "La prima total es requerida"
    }),
    TotalPagos: z.coerce.number().min(0, {
        message: "El total de pagos no puede ser negativo"
    }),
    NumeroPagos: z.coerce.number().min(1, {
        message: "El número de pagos debe ser mayor a 0"
    }),
    DescuentoProntoPago: z.coerce.number().min(0, {
        message: "El descuento no puede ser negativo"
    })
});