import { z } from "zod";

const formasPago = ["Efectivo", "Transferencia", "Deposito", "Tarjeta"] as const;

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

export const nuevoMovimientoSchema = z.object({
    TipoTransaccion: z.enum(["Ingreso", "Egreso"]),
    FormaPago: z.enum(formasPago),
    Monto: z.number().min(1, "El monto debe ser mayor a 0"),
    UsuarioCreoID: z.number(),
    CuentaBancariaID: z.number(),
    Descripcion: z.string().min(1, "La descripción es requerida"),
    UsuarioValidoID: z.number().optional()
}).refine((data) => {
    if (data.FormaPago !== "Efectivo" && !data.UsuarioValidoID) {
        return false;
    }
    return true;
}, {
    message: "El usuario validador es requerido para pagos que no son en efectivo",
    path: ["UsuarioValidoID"]
});

export const eliminarMovimientoSchema = z.object({
    codigo: z.string().min(1, "El código es requerido"),
    motivo: z.string().min(1, "El motivo es requerido")
})

export const corteCajaSchema = z.object({
    SaldoReal: z.number().min(0, "El saldo real es requerido"),
    TotalEfectivoCapturado: z.number().min(0, "El total de efectivo es requerido"),
    TotalTarjetaCapturado: z.number().min(0, "El total de tarjeta es requerido"),
    TotalTransferenciaCapturado: z.number().min(0, "El total de transferencia es requerido"),
    Observaciones: z.string().default(""),
}).refine((datos) => {
    const sumaTotales = datos.TotalEfectivoCapturado +
        datos.TotalTarjetaCapturado +
        datos.TotalTransferenciaCapturado;

    return Math.abs(sumaTotales - datos.SaldoReal) < 0.01; // Usamos una pequeña tolerancia para evitar problemas con decimales
}, {
    message: "La suma de los totales debe ser igual al saldo real",
    path: ["TotalEfectivoCapturado"] // El error se mostrará en el campo de efectivo
});