"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { iGetPolizas, iPatchPoliza } from "@/interfaces/CatPolizas";
import type { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { useToast } from "@/hooks/use-toast";
import { deletePoliza, patchPoliza } from "@/actions/PolizasActions";
import { EditarPolizaForm } from "./EditarPolizaForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TablaPolizasProps {
    polizas: iGetPolizas[];
    coberturas: iGetCoberturas[];
}

export const TablaPolizas = ({ polizas, coberturas }: TablaPolizasProps) => {
    const [polizaExpandida, setPolizaExpandida] = useState<number | null>(null);
    const [detalleVisible, setDetalleVisible] = useState<"historial" | "coberturas" | null>(null);
    const [polizaParaEditar, setPolizaParaEditar] = useState<iGetPolizas | null>(null);
    const [polizaParaEliminar, setPolizaParaEliminar] = useState<iGetPolizas | null>(null);
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState("");
    const [errorMotivo, setErrorMotivo] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState("");

    const { toast } = useToast();
    const router = useRouter();

    const formatearFecha = (fecha: Date) => {
        return new Date(fecha).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const polizasFiltradas = useMemo(() => {
        if (!terminoBusqueda) return polizas;

        return polizas.filter(poliza =>
            poliza.NumeroPoliza.toLowerCase().includes(terminoBusqueda.toLowerCase())
        );
    }, [polizas, terminoBusqueda]);


    const obtenerColorEstado = (estado: string): "default" | "destructive" | "secondary" | "outline" | null | undefined => {
        const colores = {
            "ACTIVA": "default",
            "CANCELADA": "destructive",
            "VENCIDA": "secondary",
        } as const;

        return colores[estado as keyof typeof colores] || "default";
    };

    const obtenerNombreCobertura = (coberturaId: number): string => {
        const cobertura = coberturas.find(c => c.CoberturaID === coberturaId);
        return cobertura?.NombreCobertura || `Cobertura ${coberturaId}`;
    };

    const manejarEliminar = async () => {
        if (!polizaParaEliminar) return;
        if (!motivoCancelacion.trim()) {
            setErrorMotivo(true);
            return;
        }

        try {
            const respuesta = await deletePoliza(polizaParaEliminar.PolizaID, {
                motivo: motivoCancelacion.trim()
            });

            if (respuesta === 'OK') {
                toast({
                    title: "Póliza eliminada",
                    description: "La póliza se eliminó correctamente.",
                });
                router.refresh();
            } else {
                throw new Error("Error al eliminar la póliza");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la póliza.",
                variant: "destructive",
            });
        } finally {
            setPolizaParaEliminar(null);
            setDialogoEliminarAbierto(false);
            setMotivoCancelacion("");
            setErrorMotivo(false);
        }
    };

    const manejarGuardarEdicion = async (datos: iPatchPoliza) => {
        if (!polizaParaEditar) return;

        try {
            const respuesta = await patchPoliza(polizaParaEditar.PolizaID, datos);
            if (respuesta === 'OK') {
                toast({
                    title: "Póliza actualizada",
                    description: "Los cambios se guardaron correctamente.",
                });
                router.refresh();
            } else {
                throw new Error("Error al actualizar la póliza");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios.",
                variant: "destructive",
            });
        } finally {
            setPolizaParaEditar(null);
            setModalEdicionAbierto(false);
        }
    };

    const MensajeVacio = ({ mensaje }: { mensaje: string }) => (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mensaje}</AlertDescription>
        </Alert>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <Input
                    placeholder="Buscar por número de póliza..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Número de Póliza</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Prima Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Pagos</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {polizasFiltradas.map((poliza) => (
                        <>
                            <TableRow
                                key={poliza.PolizaID}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    polizaExpandida === poliza.PolizaID && "bg-muted"
                                )}
                                onClick={() => setPolizaExpandida(
                                    polizaExpandida === poliza.PolizaID ? null : poliza.PolizaID
                                )}
                            >
                                <TableCell className="font-medium">
                                    {poliza.NumeroPoliza}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p>Del: {formatearFecha(poliza.FechaInicio)}</p>
                                        <p>Al: {formatearFecha(poliza.FechaFin)}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(Number(poliza.PrimaTotal))}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={obtenerColorEstado(poliza.EstadoPoliza)}>
                                        {poliza.EstadoPoliza}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p>Total: {poliza.TotalPagos}</p>
                                        <p>Realizados: {poliza.NumeroPagos}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    {polizaExpandida === poliza.PolizaID ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Ver detalles</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPolizaParaEditar(poliza);
                                                        setModalEdicionAbierto(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Editar</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPolizaParaEliminar(poliza);
                                                        setDialogoEliminarAbierto(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Eliminar</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {polizaExpandida === poliza.PolizaID && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0">
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-4"
                                        >
                                            <div className="flex gap-4 mb-4">
                                                <Button
                                                    variant={detalleVisible === "historial" ? "default" : "outline"}
                                                    onClick={() => setDetalleVisible(
                                                        detalleVisible === "historial" ? null : "historial"
                                                    )}
                                                >
                                                    Ver Historial
                                                </Button>
                                                <Button
                                                    variant={detalleVisible === "coberturas" ? "default" : "outline"}
                                                    onClick={() => setDetalleVisible(
                                                        detalleVisible === "coberturas" ? null : "coberturas"
                                                    )}
                                                >
                                                    Ver Coberturas
                                                </Button>
                                            </div>

                                            {detalleVisible === "historial" && (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Historial de la Póliza</CardTitle>
                                                        <CardDescription>
                                                            Versiones y cambios de la póliza
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {poliza.historial.length > 0 ? (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Versión</TableHead>
                                                                        <TableHead>Estado</TableHead>
                                                                        <TableHead>Fecha Versión</TableHead>
                                                                        <TableHead>Pagos</TableHead>
                                                                        <TableHead>Monto por Pago</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {poliza.historial.map((version) => (
                                                                        <TableRow key={version.HistorialID}>
                                                                            <TableCell>{version.Version}</TableCell>
                                                                            <TableCell>
                                                                                <Badge variant={obtenerColorEstado(version.EstadoPoliza)}>
                                                                                    {version.EstadoPoliza}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatearFecha(version.FechaVersion || new Date())}
                                                                            </TableCell>
                                                                            <TableCell>{version.NumeroPagos}</TableCell>
                                                                            <TableCell>
                                                                                {formatCurrency(Number(version.MontoPorPago))}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        ) : (
                                                            <MensajeVacio mensaje="No hay registros en el historial de esta póliza" />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {detalleVisible === "coberturas" && (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Coberturas de la Póliza</CardTitle>
                                                        <CardDescription>
                                                            Detalles de las coberturas incluidas
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {poliza.detalles.length > 0 ? (
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
                                                                    {poliza.detalles.map((detalle) => (
                                                                        <TableRow key={detalle.DetalleID}>
                                                                            <TableCell>
                                                                                {obtenerNombreCobertura(detalle.CoberturaID)}
                                                                            </TableCell>
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
                                                        ) : (
                                                            <MensajeVacio mensaje="No hay coberturas registradas para esta póliza" />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </motion.div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={modalEdicionAbierto} onOpenChange={setModalEdicionAbierto}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Póliza</DialogTitle>
                    </DialogHeader>
                    {polizaParaEditar && (
                        <EditarPolizaForm
                            poliza={polizaParaEditar}
                            onGuardar={manejarGuardarEdicion}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={dialogoEliminarAbierto} onOpenChange={(isOpen) => {
                setDialogoEliminarAbierto(isOpen);
                if (!isOpen) {
                    setMotivoCancelacion("");
                    setErrorMotivo(false);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la póliza
                            {polizaParaEliminar && (
                                <span className="font-semibold"> {polizaParaEliminar.NumeroPoliza}</span>
                            )} y todos sus registros asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="motivo">
                                Motivo de cancelación <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="motivo"
                                value={motivoCancelacion}
                                onChange={(e) => {
                                    setMotivoCancelacion(e.target.value);
                                    setErrorMotivo(false);
                                }}
                                placeholder="Ingresa el motivo de la cancelación"
                                className={cn(
                                    errorMotivo && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            {errorMotivo && (
                                <span className="text-sm text-destructive">
                                    El motivo de cancelación es requerido
                                </span>
                            )}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setPolizaParaEliminar(null);
                            setMotivoCancelacion("");
                            setErrorMotivo(false);
                        }}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={manejarEliminar}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TablaPolizas;