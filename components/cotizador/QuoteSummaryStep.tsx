"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Car,
    Calendar,
    Shield,
    CreditCard,
    User,
    MapPin,
    CheckCircle,
    Info,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { StepProps } from "@/types/cotizador";
import { formatCurrency } from "@/lib/format";

interface DetalleCoberturaExtendido {
    CoberturaID: number;
    MontoSumaAsegurada: number;
    DeducibleID: number;
    MontoDeducible: number;
    PrimaCalculada: number;
    PorcentajePrimaAplicado: number;
    ValorAseguradoUsado: number;
    NombreCobertura: string;
    DisplaySumaAsegurada?: string;
    DisplayDeducible?: string;
    TipoMoneda?: string;
    EsAmparada?: boolean;
    SumaAseguradaPorPasajero?: boolean;
    Descripcion?: string;
}

const mostrarValorSumaAsegurada = (detalle: DetalleCoberturaExtendido): React.ReactNode => {
    if (detalle.EsAmparada) {
        return "AMPARADA";
    }

    if (detalle.DisplaySumaAsegurada) {
        return detalle.DisplaySumaAsegurada;
    }

    if (detalle.TipoMoneda === "UMA") {
        return `${detalle.MontoSumaAsegurada} UMAS`;
    }

    if (detalle.SumaAseguradaPorPasajero) {
        return (
            <div className="flex flex-col gap-1">
                <span>{formatCurrency(detalle.MontoSumaAsegurada)}</span>
                <span className="text-sm text-muted-foreground">POR CADA PASAJERO</span>
            </div>
        );
    }

    return formatCurrency(detalle.MontoSumaAsegurada);
};

const mostrarValorDeducible = (detalle: DetalleCoberturaExtendido): string => {
    if (detalle.EsAmparada) {
        return "NO APLICA";
    }

    if (detalle.DisplayDeducible) {
        return detalle.DisplayDeducible;
    }

    if (detalle.TipoMoneda === "UMA") {
        return `${detalle.MontoDeducible} UMAS`;
    }

    return `${detalle.MontoDeducible}%`;
};

export const QuoteSummaryStep = ({ form, setIsStepValid }: StepProps) => {
    const formData = form.getValues();

    useEffect(() => {
        setIsStepValid?.(true);
    }, [setIsStepValid]);

    // Función para formatear fecha
    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Calcular los totales
    const costoNeto = formData.PrimaTotal || 0;
    const gastosExpedicion = formData.DerechoPoliza || 0;
    const subtotal = costoNeto + gastosExpedicion;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Datos del Vehículo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Datos del Vehículo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Marca</p>
                                <p className="font-medium">{formData.marcaNombre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Modelo</p>
                                <p className="font-medium">{formData.modeloNombre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Año</p>
                                <p className="font-medium">{formData.Modelo}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Versión</p>
                                <p className="font-medium">{formData.versionNombre}</p>
                            </div>
                        </div>

                        {formData.VIN && (
                            <Badge variant="secondary" className="gap-1">
                                <Info className="h-3 w-3" />
                                VIN: {formData.VIN}
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                {/* Datos de la Póliza */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Datos de la Póliza
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Suma Asegurada</p>
                                <p className="font-medium">
                                    {formatCurrency(formData.SumaAsegurada)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Período de Gracia</p>
                                <p className="font-medium">{formData.PeriodoGracia} días</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Vigencia</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    Del {formatDate(formData.inicioVigencia)} al{" "}
                                    {formatDate(formData.finVigencia)}
                                </span>
                            </div>
                        </div>

                        {formData.NombrePersona && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Asegurado</p>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{formData.NombrePersona}</span>
                                </div>
                            </div>
                        )}

                        {formData.CP && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Ubicación</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>CP: {formData.CP}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Coberturas Incluidas */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Coberturas Incluidas
                        </CardTitle>
                        <CardDescription>
                            Detalle de las coberturas seleccionadas
                        </CardDescription>
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
                                {formData.detalles.map((detalle) => (
                                    <TableRow key={detalle.CoberturaID}>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="flex items-center gap-2">
                                                            <span>{detalle.NombreCobertura}</span>
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{detalle.Descripcion}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            {mostrarValorSumaAsegurada(detalle)}
                                        </TableCell>
                                        <TableCell>
                                            {mostrarValorDeducible(detalle)}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(detalle.PrimaCalculada)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Resumen de Costos */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Resumen de Costos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Costo Neto</span>
                                <span>{formatCurrency(costoNeto)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Gastos de Expedición (Derecho de Póliza)
                                </span>
                                <span>{formatCurrency(gastosExpedicion)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    IVA (16%)
                                </span>
                                <span>{formatCurrency(iva)}</span>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center pt-2">
                                <span className="font-medium">Costo Total Anual</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Alertas y Notas */}
            <div className="space-y-4">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        Tu cotización está lista para ser procesada. Verifica todos los datos
                        antes de continuar.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
};

export default QuoteSummaryStep;