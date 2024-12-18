import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, InfoIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type {
    iGetEsquemaPago,
    iGetStatusPago,
    iGetMetodosPago
} from "@/interfaces/CatPolizas";

const esquemaPagoPoliza = z.object({
    PolizaID: z.number(),
    FechaPago: z.string(),
    MontoPagado: z.number().min(1, { message: "El monto debe ser mayor a 0" }),
    ReferenciaPago: z.string(),
    NombreTitular: z.string(),
    FechaMovimiento: z.string(),
    IDMetodoPago: z.number(),
    IDEstatusPago: z.number(),
    UsuarioID: z.number(),
});

type TipoPagoForm = z.infer<typeof esquemaPagoPoliza>;

interface PropiedadesRegistroPago {
    esquemaPago: iGetEsquemaPago;
    polizaId: number;
    usuarioId: number;
    onRegistrarPago: (datos: TipoPagoForm) => Promise<void>;
    statusPago: iGetStatusPago[];
    metodosPago: iGetMetodosPago[];
}

export const RegistroPagoPoliza = ({
    esquemaPago,
    polizaId,
    usuarioId,
    onRegistrarPago,
    statusPago,
    metodosPago,
}: PropiedadesRegistroPago) => {
    const form = useForm<TipoPagoForm>({
        resolver: zodResolver(esquemaPagoPoliza),
        defaultValues: {
            PolizaID: polizaId,
            FechaPago: new Date().toISOString(),
            MontoPagado: 0,
            ReferenciaPago: "",
            NombreTitular: "",
            FechaMovimiento: new Date().toISOString(),
            IDMetodoPago: 3,
            IDEstatusPago: statusPago[0]?.IDEstatusPago || 1,
            UsuarioID: usuarioId,
        },
    });

    const montoPorPagar = esquemaPago.totalPrima - esquemaPago.totalPagado;
    // const pagoSugerido = montoPorPagar / esquemaPago.esquemaPagos.length;
    const metodoPagoSeleccionado = metodosPago.find(m => m.IDMetodoPago === form.watch("IDMetodoPago"));
    const nombreMetodo = metodoPagoSeleccionado?.NombreMetodo.toLowerCase() || "";
    const esEfectivo = nombreMetodo.includes("efectivo");

    const onSubmit = async (datos: TipoPagoForm) => {
        await onRegistrarPago({
            ...datos,
            ReferenciaPago: datos.ReferenciaPago || "",
            NombreTitular: datos.NombreTitular || "",
        });
        form.reset();
    };

    return (
        <div className="space-y-4">
            {esquemaPago.mensajeAtraso && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {esquemaPago.mensajeAtraso}
                    </AlertDescription>
                </Alert>
            )}

            {esquemaPago.descuentoProntoPago > 0 && (
                <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                        Descuento por pronto pago disponible: {formatCurrency(esquemaPago.descuentoProntoPago)}
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="FechaPago"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de pago</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={format(new Date(field.value), "PPP", { locale: es })}
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FormLabel>Monto total de póliza</FormLabel>
                            <Input
                                value={formatCurrency(esquemaPago.totalPrima)}
                                disabled
                            />
                        </div>

                        <div>
                            <FormLabel>Monto por pagar</FormLabel>
                            <Input
                                value={formatCurrency(montoPorPagar)}
                                disabled
                            />
                        </div>
                    </div>

                    {/* <div>
                        <FormLabel>Pago sugerido</FormLabel>
                        <Input
                            value={formatCurrency(pagoSugerido)}
                            disabled
                        />
                    </div> */}

                    <FormField
                        control={form.control}
                        name="MontoPagado"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto a pagar</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={formatCurrency(field.value)}
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            field.onChange(Number(valor) / 100);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="IDMetodoPago"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Método de pago</FormLabel>
                                <Select
                                    onValueChange={(valor) => field.onChange(Number(valor))}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona método de pago" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {metodosPago.map((metodo) => (
                                            <SelectItem
                                                key={metodo.IDMetodoPago}
                                                value={metodo.IDMetodoPago.toString()}
                                            >
                                                {metodo.NombreMetodo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="IDEstatusPago"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado del pago</FormLabel>
                                <Select
                                    onValueChange={(valor) => field.onChange(Number(valor))}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona estado del pago" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {statusPago.map((status) => (
                                            <SelectItem
                                                key={status.IDEstatusPago}
                                                value={status.IDEstatusPago.toString()}
                                            >
                                                {status.NombreEstatus}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {!esEfectivo && (
                        <>
                            <FormField
                                control={form.control}
                                name="ReferenciaPago"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de transacción</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="NombreTitular"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titular de la cuenta</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    <Button type="submit"><CheckCircle2 className="w-4 h-4 mr-2"/>Registrar Pago</Button>
                </form>
            </Form>
        </div>
    );
};