import { z } from "zod"

export const nuevoPaqueteSchema = z.object({
    NombrePaquete: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    DescripcionPaquete: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
})