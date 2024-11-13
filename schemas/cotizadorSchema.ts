import * as z from "zod";

// Schemas auxiliares
const detalleSchema = z.object({
    CoberturaID: z.number().min(1, "CoberturaID es requerido"),
    MontoSumaAsegurada: z.number().min(1, "Monto de suma asegurada es requerido"),
    DeducibleID: z.number().min(1, "DeducibleID es requerido"),
    MontoDeducible: z.number().min(1, "Monto deducible es requerido"),
    PrimaCalculada: z.number().min(1, "Prima calculada es requerida"),
    PorcentajePrimaAplicado: z.number().min(0, "Porcentaje prima aplicado es requerido"),
    ValorAseguradoUsado: z.number().min(1, "Valor asegurado usado es requerido"),
});

export const nuevaCotizacionSchema = z.object({
    // Datos básicos
    UsuarioID: z.number().min(1, "UsuarioID es requerido"),
    EstadoCotizacion: z.string().default("REGISTRO"),

    // Datos financieros
    PrimaTotal: z.number().min(0, "La Prima Total no puede ser negativa"),
    TipoPagoID: z.number().min(1, "El tipo de pago es requerido"),
    PorcentajeDescuento: z.number()
        .min(0, "El descuento no puede ser negativo")
        .max(35, "El descuento no puede superar el 35%"),
    DerechoPoliza: z.coerce.number().min(0, "Derecho de póliza no puede ser negativo"),

    // Datos de suma asegurada
    TipoSumaAseguradaID: z.coerce.number().min(1, "Tipo de suma asegurada es requerido"),
    SumaAsegurada: z.coerce.number()
        .min(1, "La suma asegurada es requerida")
        .refine((val) => val > 0, "La suma asegurada debe ser mayor a 0"),

    // Datos de la póliza
    PeriodoGracia: z.coerce.number(),
    PaqueteCoberturaID: z.number().min(1, "El paquete de cobertura es requerido"),

    // Datos del vehículo
    UsoVehiculo: z.number().min(1, "El uso del vehículo es requerido"),
    TipoVehiculo: z.number().min(1, "El tipo de vehículo es requerido"),
    AMIS: z.string().min(15, "AMIS debe contener al menos 15 caracteres"),

    // Datos opcionales
    NombrePersona: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .optional()
        .or(z.literal("")),
    UnidadSalvamento: z.boolean(),
    VIN: z.string()
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN inválido")
        .optional()
        .or(z.literal("")),

    // Datos de ubicación
    CP: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),

    // Datos del vehículo extendidos
    Modelo: z.string().min(1, "El año es requerido"),
    Marca: z.string().min(1, "La marca es requerida"),
    Submarca: z.string().min(1, "El modelo es requerido"),
    Version: z.string().min(1, "La versión es requerida"),

    // Datos de vigencia
    meses: z.coerce.number()
        .min(1, "Mínimo 1 mes")
        .max(12, "Máximo 12 meses"),
    vigencia: z.enum(["Anual", "Por meses"]),

    // Rangos de suma asegurada
    minSumaAsegurada: z.coerce.number(),
    maxSumaAsegurada: z.coerce.number(),

    // Fechas
    inicioVigencia: z.string()
        .min(1, "El inicio de vigencia es requerido")
        .refine((date) => new Date(date) >= new Date(), "La fecha de inicio debe ser posterior a hoy"),
    finVigencia: z.string()
        .min(1, "El fin de vigencia es requerido"),

    // Detalles de coberturas
    detalles: z.array(detalleSchema).optional(),

    // Campos auxiliares
    versionNombre: z.string(),
    marcaNombre: z.string(),
    modeloNombre: z.string(),
}).refine(
    (data) => {
        if (data.minSumaAsegurada > 0 && data.maxSumaAsegurada > 0) {
            return data.SumaAsegurada >= data.minSumaAsegurada &&
                data.SumaAsegurada <= data.maxSumaAsegurada;
        }
        return true;
    },
    {
        message: "La suma asegurada debe estar dentro del rango permitido",
        path: ["SumaAsegurada"],
    }
).refine(
    (data) => {
        const inicio = new Date(data.inicioVigencia);
        const fin = new Date(data.finVigencia);
        return fin > inicio;
    },
    {
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
        path: ["finVigencia"],
    }
);

// Tipo inferido del schema
export type CotizacionFormData = z.infer<typeof nuevaCotizacionSchema>;