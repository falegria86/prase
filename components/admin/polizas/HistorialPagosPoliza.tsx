import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CalendarRange, CreditCard, Info } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { formatDateFullTz } from "@/lib/format-date";
import { getTotalPagarPoliza, getPagosByIdPoliza } from "@/actions/PolizasActions";
import type { iGetPagosPoliza } from "@/interfaces/CatPolizas";

interface PropiedadesHistorialPagos {
    polizaId: number;
}

export const HistorialPagosPoliza = ({ polizaId }: PropiedadesHistorialPagos) => {
    const [pagos, setPagos] = useState<iGetPagosPoliza[]>([]);
    const [totalPagar, setTotalPagar] = useState<string>("");

    useEffect(() => {
        const cargarDatos = async () => {
            const [pagosData, totalData] = await Promise.all([
                getPagosByIdPoliza(polizaId),
                getTotalPagarPoliza(polizaId)
            ]);

            if (pagosData) setPagos(pagosData);
            if (totalData) setTotalPagar(totalData);
        };

        cargarDatos();
    }, [polizaId]);

    const totalPagado = pagos.reduce((total, pago) =>
        total + Number(pago.MontoPagado), 0
    );

    const obtenerColorEstado = (estado: string): "default" | "destructive" | "secondary" | "outline" | null | undefined => {
        const estados = {
            "PENDIENTE": "secondary",
            "PAGADO": "default",
            "CANCELADO": "destructive",
        } as const;

        return estados[estado as keyof typeof estados] || "default";
    };

    if (pagos.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No hay pagos registrados para esta póliza
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Resumen de Pagos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total a pagar:</span>
                                <span className="font-medium">{formatCurrency(Number(totalPagar))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total pagado:</span>
                                <span className="font-medium">{formatCurrency(totalPagado)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Saldo restante:</span>
                                <span className="font-medium text-primary">
                                    {formatCurrency(Number(totalPagar) - totalPagado)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Estadísticas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total de pagos:</span>
                                <span className="font-medium">{pagos.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Promedio por pago:</span>
                                <span className="font-medium">
                                    {formatCurrency(totalPagado / pagos.length)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarRange className="h-4 w-4" />
                        Historial Detallado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                            {pagos.map((pago, index) => (
                                <div key={pago.PagoID} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    Pago #{index + 1}
                                                </span>
                                                <Badge variant={obtenerColorEstado(pago.EstatusPago.NombreEstatus)}>
                                                    {pago.EstatusPago.NombreEstatus}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDateFullTz(pago.FechaPago)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {formatCurrency(Number(pago.MontoPagado))}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {pago.MetodoPago.NombreMetodo}
                                            </div>
                                        </div>
                                    </div>

                                    {pago.NombreTitular && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Titular: </span>
                                            {pago.NombreTitular}
                                        </div>
                                    )}

                                    {pago.ReferenciaPago && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Referencia: </span>
                                            {pago.ReferenciaPago}
                                        </div>
                                    )}

                                    {pago.MotivoCancelacion && (
                                        <div className="text-sm text-destructive">
                                            <span className="font-medium">Motivo de cancelación: </span>
                                            {pago.MotivoCancelacion}
                                        </div>
                                    )}

                                    {index < pagos.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};