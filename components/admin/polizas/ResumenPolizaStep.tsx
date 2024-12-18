import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Info, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const resumenSchema = z.object({
    fechaInicio: z.date(),
    fechaFin: z.date(),
    descuentoProntoPago: z.coerce.number().min(0),
    tieneReclamos: z.boolean(),
});

interface ResumenPolizaStepProps {
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
    alConfirmar: (datos: z.infer<typeof resumenSchema>) => void;
}

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

export const ResumenPolizaStep = ({
    cotizacion,
    coberturas,
    alConfirmar
}: ResumenPolizaStepProps) => {

    const form = useForm<z.infer<typeof resumenSchema>>({
        resolver: zodResolver(resumenSchema),
        defaultValues: {
            fechaInicio: hoy,
            fechaFin: new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate()),
            descuentoProntoPago: 0,
            tieneReclamos: false,
        },
    });

    const obtenerNombreCobertura = (coberturaId: number): string => {
        const cobertura = coberturas?.find(c => c.CoberturaID === coberturaId);
        return cobertura?.NombreCobertura || `Cobertura ${coberturaId}`;
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(alConfirmar)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Fechas y descuentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fechaInicio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de inicio</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={e => field.onChange(new Date(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fechaFin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de fin</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={e => field.onChange(new Date(e.target.value))}
                                            min={form.getValues("fechaInicio").toISOString().split('T')[0]}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descuentoProntoPago"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descuento por pronto pago</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            min="0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tieneReclamos"
                            render={({ field }) => (
                                <FormItem className="flex items-end space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Tiene reclamos previos</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Vehículo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Marca:</span>{" "}
                                {cotizacion.Marca}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Modelo:</span>{" "}
                                {cotizacion.Modelo}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Versión:</span>{" "}
                                {cotizacion.Version}
                            </p>
                            {cotizacion.VIN && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">VIN:</span>{" "}
                                    {cotizacion.VIN}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Cliente:</span>{" "}
                                {cotizacion.NombrePersona}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Teléfono:</span>{" "}
                                {cotizacion.Telefono}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Email:</span>{" "}
                                {cotizacion.Correo}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coberturas Incluidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cobertura</TableHead>
                                    <TableHead>Suma Asegurada</TableHead>
                                    <TableHead>Deducible</TableHead>
                                    <TableHead>Prima</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cotizacion.detalles.map((detalle) => (
                                    <TableRow key={detalle.DetalleID}>
                                        <TableCell>{obtenerNombreCobertura(detalle.CoberturaID)}</TableCell>
                                        <TableCell>
                                            {formatCurrency(Number(detalle.MontoSumaAsegurada))}
                                        </TableCell>
                                        <TableCell>{detalle.MontoDeducible}%</TableCell>
                                        <TableCell>
                                            {formatCurrency(Number(detalle.PrimaCalculada))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Pagos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-semibold">
                                <span>Total Anual:</span>
                                <span className="text-primary">
                                    {formatCurrency(Number(cotizacion.PrimaTotal))}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Revisa cuidadosamente todos los detalles antes de activar la póliza.
                        Esta acción no se puede deshacer.
                    </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                    <Button type="submit" className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Activar Póliza
                    </Button>
                </div>
            </form>
        </Form>
    );
};