import * as z from "zod";

export const nuevaCotizacionSchema = z.object({
    UsuarioID: z.number().min(1, { message: "UsuarioID es requerido" }),
    EstadoCotizacion: z.string().default("REGISTRO"),
    PrimaTotal: z.number().min(1, { message: "La PrimaTotal es requerida" }),
    TipoPagoID: z.number().min(1, { message: "El tipo de pago es requerido" }),
    PorcentajeDescuento: z.number().min(0, { message: "Porcentaje de descuento es requerido" }),
    DerechoPoliza: z.coerce.number().min(1, { message: "Derecho de póliza es requerido" }),
    TipoSumaAseguradaID: z.coerce.number().min(1, { message: "Tipo de suma asegurada es requerido" }),
    SumaAsegurada: z.coerce.number().min(1, { message: "La suma asegurada es requerida" }),
    PeriodoGracia: z.coerce.number().min(1, { message: "El período de gracia es requerido" }),
    PaqueteCoberturaID: z.number().min(1, { message: "El paquete de cobertura es requerido" }),
    UsoVehiculo: z.number().min(1, { message: "El uso del vehículo es requerido" }),
    TipoVehiculo: z.number().min(1, { message: "El tipo de vehículo es requerido" }),
    AMIS: z.string().min(15, { message: "AMIS debe contener al menos 15 caracteres" }),
    NombrePersona: z.string(),
    UnidadSalvamento: z.boolean(),
    VIN: z.string(),
    CP: z.string().min(5, { message: "El código postal es requerido" }),
    Marca: z.string().min(1, { message: "La marca es requerida" }),
    Submarca: z.string().min(1, { message: "La submarca es requerida" }),
    Modelo: z.string().min(1, { message: "El modelo es requerido" }),
    Version: z.string().min(1, { message: "La versión es requerida" }),
    meses: z.coerce.number(),
    vigencia: z.string(),

    minSumaAsegurada: z.coerce.number(),
    maxSumaAsegurada: z.coerce.number(),

    inicioVigencia: z.string().min(1, {
        message: "El inicio de vigencia es requerido."
    }),
    finVigencia: z.string().min(1, {
        message: "El fin de vigencia es requerido."
    }),

    detalles: z.array(
        z.object({
            CoberturaID: z.number().min(1, { message: "CoberturaID es requerido" }),
            MontoSumaAsegurada: z.number().min(1, { message: "Monto de suma asegurada es requerido" }),
            DeducibleID: z.number().min(1, { message: "DeducibleID es requerido" }),
            MontoDeducible: z.number().min(1, { message: "Monto deducible es requerido" }),
            PrimaCalculada: z.number().min(1, { message: "Prima calculada es requerida" }),
            PorcentajePrimaAplicado: z.number().min(0, { message: "Porcentaje prima aplicado es requerido" }),
            ValorAseguradoUsado: z.number().min(1, { message: "Valor asegurado usado es requerido" }),
        })
    ).optional(),

    //Extras usados para manejar info interna
    versionNombre: z.string(),
    marcaNombre: z.string(),
    modeloNombre: z.string(),
});