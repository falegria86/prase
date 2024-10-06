import { z } from "zod";

export const registrarUsuarioSchema = z.object({
    username: z.string().email({
        message: "Introduzca un email válido"
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres",
    }),
    idGroup: z.coerce.number().min(1, {
        message: "El grupo es requerido"
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})