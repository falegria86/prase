"use client";

import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { formatDateFullTz } from "@/lib/format-date";
import {
    getPagosByIdPoliza,
    patchPagoPoliza,
    deletePagoPoliza
} from "@/actions/PolizasActions";
import type {
    iGetPagosPoliza,
    iGetStatusPago,
    iGetMetodosPago
} from "@/interfaces/CatPolizas";

interface PropiedadesEditarPagos {
    polizaId: number;
    statusPago: iGetStatusPago[];
    metodosPago: iGetMetodosPago[];
    usuarioId: number;
}

export const EditarPagosPoliza = ({
    polizaId,
    statusPago,
    metodosPago,
    usuarioId
}: PropiedadesEditarPagos) => {
    const [pagos, setPagos] = useState<iGetPagosPoliza[]>([]);
    const [pagoEditando, setPagoEditando] = useState<number | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const cargarPagos = async () => {
            const data = await getPagosByIdPoliza(polizaId);
            if (data) setPagos(data);
        };
        cargarPagos();
    }, [polizaId]);

    const actualizarPago = async (pagoId: number, nuevosDatos: any) => {
        try {
            await patchPagoPoliza(pagoId, nuevosDatos);
            toast({
                title: "Pago actualizado",
                description: "El pago se actualizó correctamente.",
            });
            setPagoEditando(null);
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al actualizar el pago",
                variant: "destructive",
            });
        }
    };

    const eliminarPago = async (pagoId: number) => {
        try {
            await deletePagoPoliza(pagoId, {
                usuarioidPoliza: usuarioId,
                motivoCancelacion: "Cancelación de pago"
            });
            toast({
                title: "Pago eliminado",
                description: "El pago se eliminó correctamente.",
            });
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al eliminar el pago",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pagos.map((pago) => (
                        <TableRow key={pago.PagoID}>
                            <TableCell>
                                {formatDateFullTz(pago.FechaPago)}
                            </TableCell>
                            <TableCell>
                                {pagoEditando === pago.PagoID ? (
                                    <Input
                                        type="number"
                                        defaultValue={pago.MontoPagado}
                                        onChange={(e) => {
                                            actualizarPago(pago.PagoID, {
                                                MontoPagado: Number(e.target.value)
                                            });
                                        }}
                                    />
                                ) : (
                                    formatCurrency(Number(pago.MontoPagado))
                                )}
                            </TableCell>
                            <TableCell>
                                {pagoEditando === pago.PagoID ? (
                                    <Select
                                        defaultValue={pago.MetodoPago.IDMetodoPago.toString()}
                                        onValueChange={(valor) => {
                                            actualizarPago(pago.PagoID, {
                                                IDMetodoPago: Number(valor)
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
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
                                ) : (
                                    pago.MetodoPago.NombreMetodo
                                )}
                            </TableCell>
                            <TableCell>
                                {pagoEditando === pago.PagoID ? (
                                    <Select
                                        defaultValue={pago.EstatusPago.IDEstatusPago.toString()}
                                        onValueChange={(valor) => {
                                            actualizarPago(pago.PagoID, {
                                                IDEstatusPago: Number(valor)
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
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
                                ) : (
                                    <Badge>
                                        {pago.EstatusPago.NombreEstatus}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPagoEditando(
                                            pagoEditando === pago.PagoID ? null : pago.PagoID
                                        )}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => eliminarPago(pago.PagoID)}
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};