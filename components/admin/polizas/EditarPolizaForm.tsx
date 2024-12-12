import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editarPolizaSchema } from "@/schemas/polizasSchema";
import type { iGetPolizas, iPatchPoliza } from "@/interfaces/CatPolizas";
import { formatCurrency } from "@/lib/format";

interface EditarPolizaFormProps {
    poliza: iGetPolizas;
    onGuardar: (datos: iPatchPoliza) => void;
}

export const EditarPolizaForm = ({ poliza, onGuardar }: EditarPolizaFormProps) => {
    const form = useForm<z.infer<typeof editarPolizaSchema>>({
        resolver: zodResolver(editarPolizaSchema),
        defaultValues: {
            // FechaInicio: new Date(poliza.FechaInicio),
            // FechaFin: new Date(poliza.FechaFin),
            PrimaTotal: Number(poliza.PrimaTotal),
            TotalPagos: Number(poliza.TotalPagos),
            NumeroPagos: poliza.NumeroPagos,
            DescuentoProntoPago: Number(poliza.DescuentoProntoPago || 0),
            // TieneReclamos: poliza.TieneReclamos,
        },
    });

    const onSubmit = (datos: z.infer<typeof editarPolizaSchema>) => {
        onGuardar(datos);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="PrimaTotal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prima Total</FormLabel>
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
                        name="TotalPagos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total de Pagos</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="NumeroPagos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Pagos</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="DescuentoProntoPago"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descuento por Pronto Pago</FormLabel>
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
                </div>

                <Button type="submit" className="w-full">
                    Guardar Cambios
                </Button>
            </form>
        </Form>
    );
};