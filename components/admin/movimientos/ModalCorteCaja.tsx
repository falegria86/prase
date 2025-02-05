import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getCorteUsuario, postGuardarCorteCaja } from "@/actions/CortesCajaActions";
import { formatCurrency } from "@/lib/format";
import { corteCajaSchema } from "@/schemas/admin/movimientos/movimientosSchema";

interface ModalCorteCajaProps {
    abierto: boolean;
    alCerrar: () => void;
    usuarioId: number;
}

export function ModalCorteCaja({ abierto, alCerrar, usuarioId }: ModalCorteCajaProps) {
    const [isPending, startTransition] = useTransition();
    const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
    const [datosCorteCaja, setDatosCorteCaja] = useState<any>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof corteCajaSchema>>({
        resolver: zodResolver(corteCajaSchema),
        defaultValues: {
            SaldoReal: 0,
            TotalEfectivoCapturado: 0,
            TotalTarjetaCapturado: 0,
            TotalTransferenciaCapturado: 0,
            Observaciones: "",
        },
    });

    const manejarConfirmacion = () => {
        startTransition(async () => {
            try {
                const respuesta = await getCorteUsuario(usuarioId);
                if (respuesta) {
                    setDatosCorteCaja(respuesta);
                    setConfirmacionAbierta(false);
                    form.setValue("SaldoReal", respuesta.SaldoReal);
                    form.setValue("TotalEfectivoCapturado", respuesta.TotalEfectivoCapturado);
                    form.setValue("TotalTarjetaCapturado", respuesta.TotalTarjetaCapturado);
                    form.setValue("TotalTransferenciaCapturado", respuesta.TotalTransferenciaCapturado);
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo obtener la información del corte",
                        variant: "destructive",
                    });
                    alCerrar();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al procesar la solicitud",
                    variant: "destructive",
                });
                alCerrar();
            }
        });
    };

    const onSubmit = async (valores: z.infer<typeof corteCajaSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postGuardarCorteCaja({
                    ...valores,
                    usuarioID: usuarioId,
                });

                if (respuesta) {
                    toast({
                        title: "Corte guardado",
                        description: "El corte de caja se ha guardado exitosamente",
                    });
                    alCerrar();
                    window.location.reload();
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo guardar el corte de caja",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al guardar el corte",
                    variant: "destructive",
                });
            }
        });
    };

    if (!abierto) return null;

    if (confirmacionAbierta) {
        return (
            <Dialog open={confirmacionAbierta} onOpenChange={() => setConfirmacionAbierta(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Corte de Caja</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas realizar el corte de caja? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-4 mt-4">
                        <Button variant="outline" onClick={() => setConfirmacionAbierta(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={manejarConfirmacion} disabled={isPending}>
                            Confirmar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!datosCorteCaja) {
        setConfirmacionAbierta(true);
        return null;
    }

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Corte de Caja</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Alert>
                                <AlertTitle>
                                    Saldo Esperado:
                                </AlertTitle>
                                <AlertDescription>
                                    {formatCurrency(datosCorteCaja.SaldoEsperado)}
                                </AlertDescription>
                            </Alert>

                            <Alert variant={form.watch("SaldoReal") ===
                                (form.watch("TotalEfectivoCapturado") +
                                    form.watch("TotalTarjetaCapturado") +
                                    form.watch("TotalTransferenciaCapturado"))
                                ? "default"
                                : "destructive"}>
                                <AlertTitle>
                                    Suma de Totales:
                                </AlertTitle>
                                <AlertDescription>
                                    {formatCurrency(
                                        form.watch("TotalEfectivoCapturado") +
                                        form.watch("TotalTarjetaCapturado") +
                                        form.watch("TotalTransferenciaCapturado")
                                    )}
                                </AlertDescription>
                            </Alert>

                            <FormField
                                control={form.control}
                                name="SaldoReal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Saldo Real</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
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
                                name="TotalEfectivoCapturado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Efectivo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
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
                                name="TotalTarjetaCapturado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Tarjeta</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
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
                                name="TotalTransferenciaCapturado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Transferencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
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

                        <FormField
                            control={form.control}
                            name="Observaciones"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observaciones</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Observaciones sobre el corte..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={alCerrar}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                Guardar Corte
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}