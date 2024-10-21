import { z } from 'zod';

export const postVehiculoSchema = z.object({
    ClienteID: z.coerce.number(),
    Marca: z.string().min(1), // Asegura que tenga al menos un carácter
    Modelo: z.string().min(1), // Asegura que tenga al menos un carácter
    AnoFabricacion: z.coerce.number().min(1900).max(new Date().getFullYear()), // Validación de año
    TipoVehiculo: z.string().min(1),
    ValorVehiculo: z.coerce.number().min(0, "Debe ser un número mayor o igual a 0"), // Debe ser un número positivo
    ValorFactura: z.coerce.number().min(0, "Debe ser un número mayor o igual a 0"),  // Debe ser un número positivo
    FechaRegistro: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "FechaRegistro debe ser una fecha válida",
    }),
    UsoVehiculo: z.string().min(1),
    ZonaResidencia: z.string().min(1),
    Salvamento: z.coerce.number().min(0, "Debe ser un número mayor o igual a 0"), // Debe ser un número no negativo
});

export const patchVehiculoSchema = z.object({
    ValorVehiculo: z.coerce.number().min(0, "Debe ser un número mayor o igual a 0"), // Debe ser un número positivo
    UsoVehiculo: z.string().min(1), // Asegura que tenga al menos un carácter
});
