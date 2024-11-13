"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Shield, AlertTriangle, Info } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Cobertura, StepProps } from "@/types/cotizador";
import { formatCurrency } from "@/lib/format";
import { Separator } from "../ui/separator";

interface Coverage {
    CoberturaID: number;
    NombreCobertura: string;
    MontoSumaAsegurada: number;
    DeducibleID: number;
    MontoDeducible: number;
    PrimaCalculada: number;
    PorcentajePrimaAplicado: number;
    ValorAseguradoUsado: number;
    Obligatoria: boolean;
    AplicaSumaAsegurada: boolean;
    EsCoberturaEspecial: boolean;
    DeducibleMin: number;
    DeducibleMax: number;
    RangoSeleccion: number;
    SumaAseguradaMin: string;
    SumaAseguradaMax: string;
    Descripcion: string;
}

export const CoverageStep = ({
    form,
    paquetesCobertura,
    coberturas,
    asociaciones,
    reglasGlobales,
    setIsStepValid,
}: StepProps) => {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [coverages, setCoverages] = useState<Coverage[]>([]);
    const [totalPrima, setTotalPrima] = useState(0);
    const [bonificacion, setBonificacion] = useState(0);

    const calculatePremium = (
        cobertura: Cobertura,
        selectedSumaAsegurada: number,
        selectedDeducible: number
    ) => {
        let prima = 0;

        if (cobertura.PrimaBase) {
            prima = parseFloat(cobertura.PrimaBase);

            const reglasCobertura = reglasGlobales?.filter(
                (regla) =>
                    regla.cobertura?.CoberturaID === cobertura.CoberturaID && regla.Activa
            );

            reglasCobertura?.forEach((regla) => {
                if (regla.TipoAplicacion === "PORCENTAJE") {
                    prima *= 1 + regla.ValorAjuste / 100;
                } else if (regla.TipoAplicacion === "MONTO") {
                    prima += regla.ValorAjuste;
                }
            });
        } else {
            const porcentajePrima = parseFloat(cobertura.PorcentajePrima) / 100;
            prima = selectedSumaAsegurada * porcentajePrima;
        }

        prima *= 1 - selectedDeducible / 100;
        return prima;
    };

    const handlePackageSelect = (packageId: number) => {
        const selectedAssociations = asociaciones?.filter(
            (a) => a.PaqueteCoberturaID === packageId
        ) ?? [];

        const vehicleSumaAsegurada = form.getValues("SumaAsegurada");

        const coverageList = selectedAssociations?.map((association) => {
            const coverage = coberturas?.find(
                (c) => c.CoberturaID === association.CoberturaID
            );
            if (!coverage) return null;

            const sumaAsegurada = coverage.AplicaSumaAsegurada
                ? vehicleSumaAsegurada
                : parseFloat(coverage.SumaAseguradaMin);

            const deducible = parseInt(coverage.DeducibleMin);
            const prima = calculatePremium(coverage, sumaAsegurada, deducible);

            return {
                CoberturaID: coverage.CoberturaID,
                NombreCobertura: coverage.NombreCobertura,
                MontoSumaAsegurada: sumaAsegurada,
                DeducibleID: 1,
                MontoDeducible: deducible,
                PrimaCalculada: prima,
                PorcentajePrimaAplicado: parseFloat(coverage.PorcentajePrima),
                ValorAseguradoUsado: sumaAsegurada,
                Obligatoria: association.Obligatoria,
                AplicaSumaAsegurada: coverage.AplicaSumaAsegurada,
                EsCoberturaEspecial: coverage.EsCoberturaEspecial,
                DeducibleMin: parseInt(coverage.DeducibleMin),
                DeducibleMax: parseInt(coverage.DeducibleMax),
                RangoSeleccion: parseInt(coverage.RangoSeleccion),
                SumaAseguradaMin: coverage.SumaAseguradaMin,
                SumaAseguradaMax: coverage.SumaAseguradaMax,
                Descripcion: coverage.Descripcion,
            };
        }).filter((item): item is Coverage => item !== null);

        setCoverages(coverageList);
        setSelectedPackage(packageId);
        form.setValue("PaqueteCoberturaID", packageId);
        form.setValue("detalles", coverageList);

        const total = coverageList.reduce((sum, item) => sum + item.PrimaCalculada, 0);
        updateTotalPrima(total);
    };

    const updateTotalPrima = (subtotal: number) => {
        const total = subtotal * (1 - bonificacion / 100);
        setTotalPrima(total);
        form.setValue("PrimaTotal", total);
        form.setValue("PorcentajeDescuento", bonificacion);
    };

    const handleSumaAseguradaChange = (coberturaId: number, value: string) => {
        const newCoverages = coverages.map((coverage) => {
            if (coverage.CoberturaID === coberturaId) {
                const newSumaAsegurada = parseFloat(value);

                // Verificar que 'coberturas' y el resultado de 'find' no sean undefined
                const coberturaFound = coberturas?.find((c) => c.CoberturaID === coberturaId);
                if (!coberturaFound) {
                    console.error(`Cobertura con ID ${coberturaId} no encontrada.`);
                    return coverage; // Retornar el coverage actual sin cambios
                }

                const nuevaPrima = calculatePremium(
                    coberturaFound,
                    newSumaAsegurada,
                    coverage.MontoDeducible
                );

                return {
                    ...coverage,
                    MontoSumaAsegurada: newSumaAsegurada,
                    ValorAseguradoUsado: newSumaAsegurada,
                    PrimaCalculada: nuevaPrima,
                };
            }
            return coverage;
        });

        setCoverages(newCoverages);
        form.setValue("detalles", newCoverages);

        const subtotal = newCoverages.reduce((sum, item) => sum + item.PrimaCalculada, 0);
        updateTotalPrima(subtotal);
    };

    const handleDeducibleChange = (coberturaId: number, value: string) => {
        const newCoverages = coverages.map((coverage) => {
            if (coverage.CoberturaID === coberturaId) {
                const newDeducible = parseInt(value);

                // Verificar que 'coberturas' y el resultado de 'find' no sean undefined
                const coberturaFound = coberturas?.find((c) => c.CoberturaID === coberturaId);
                if (!coberturaFound) {
                    console.error(`Cobertura con ID ${coberturaId} no encontrada.`);
                    return coverage; // Retornar el coverage actual sin cambios
                }

                const nuevaPrima = calculatePremium(
                    coberturaFound,
                    coverage.MontoSumaAsegurada,
                    newDeducible
                );

                return {
                    ...coverage,
                    MontoDeducible: newDeducible,
                    PrimaCalculada: nuevaPrima,
                };
            }
            return coverage;
        });

        setCoverages(newCoverages);
        form.setValue("detalles", newCoverages);

        const subtotal = newCoverages.reduce((sum, item) => sum + item.PrimaCalculada, 0);
        updateTotalPrima(subtotal);
    };

    const handleDeleteCobertura = (coberturaId: number) => {
        const newCoverages = coverages.filter(
            (coverage) => coverage.CoberturaID !== coberturaId
        );

        setCoverages(newCoverages);
        form.setValue("detalles", newCoverages);

        const subtotal = newCoverages.reduce((sum, item) => sum + item.PrimaCalculada, 0);
        updateTotalPrima(subtotal);
    };

    const handleBonificacionChange = (value: string) => {
        const parsedValue = parseFloat(value) || 0;
        // Asegurarse de que el valor esté entre 0 y 35
        const newBonificacion = Math.min(Math.max(parsedValue, 0), 35);

        setBonificacion(newBonificacion);

        // Si no hay coverages, no hay nada que actualizar
        if (coverages.length === 0) {
            return;
        }

        // Calcular el subtotal antes del descuento
        const subtotal = coverages.reduce((sum, item) => sum + item.PrimaCalculada, 0);

        // Actualizar prima total con la nueva bonificación
        updateTotalPrima(subtotal);

        // También actualizamos el porcentaje de descuento en el formulario
        form.setValue("PorcentajeDescuento", newBonificacion);

        // Validar el paso después del cambio
        if (setIsStepValid) {
            const validateStep = async () => {
                const isValid = coverages.length > 0 && await form.trigger("PaqueteCoberturaID");
                setIsStepValid(isValid);
            };
            validateStep();
        }
    };

    useEffect(() => {
        const validateStep = async () => {
            const isValid = coverages.length > 0 && await form.trigger("PaqueteCoberturaID");
            setIsStepValid?.(isValid);
        };
        validateStep();
    }, [coverages, form, setIsStepValid]);

    return (
        <div className="space-y-6">
            {/* Selección de paquete */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Selección de Paquete
                    </CardTitle>
                    <CardDescription>
                        Elige el paquete de coberturas que mejor se adapte a tus necesidades
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="PaqueteCoberturaID"
                        render={({ field }) => (
                            <FormItem>
                                <Select
                                    onValueChange={(value) => handlePackageSelect(Number(value))}
                                    value={field.value?.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un paquete" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paquetesCobertura?.map((paquete) => (
                                            <SelectItem
                                                key={paquete.PaqueteCoberturaID}
                                                value={paquete.PaqueteCoberturaID.toString()}
                                            >
                                                {paquete.NombrePaquete}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                {selectedPackage && coverages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                        transition={{ duration: 0.3 }}
                    >
                        {/* Tabla de coberturas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Coberturas Incluidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Cobertura</TableHead>
                                                <TableHead>Suma asegurada</TableHead>
                                                <TableHead>Deducible</TableHead>
                                                <TableHead>Prima</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {coverages.map((coverage) => (
                                                <TableRow key={coverage.CoberturaID}>
                                                    <TableCell>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {coverage.NombreCobertura}
                                                                    </span>
                                                                    {coverage.Obligatoria && (
                                                                        <Badge variant="secondary">Obligatoria</Badge>
                                                                    )}
                                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-xs">{coverage.Descripcion}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={coverage.MontoSumaAsegurada.toString()}
                                                            onValueChange={(value) =>
                                                                handleSumaAseguradaChange(coverage.CoberturaID, value)
                                                            }
                                                            disabled={coverage.AplicaSumaAsegurada}
                                                        >
                                                            <SelectTrigger className="w-[200px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {coverage.AplicaSumaAsegurada ? (
                                                                    <SelectItem
                                                                        value={coverage.MontoSumaAsegurada.toString()}
                                                                    >
                                                                        {formatCurrency(coverage.MontoSumaAsegurada)}
                                                                    </SelectItem>
                                                                ) : (
                                                                    Array.from(
                                                                        {
                                                                            length: Math.floor(
                                                                                (parseFloat(coverage.SumaAseguradaMax) -
                                                                                    parseFloat(coverage.SumaAseguradaMin)) /
                                                                                1000
                                                                            ) + 1,
                                                                        },
                                                                        (_, i) =>
                                                                            parseFloat(coverage.SumaAseguradaMin) +
                                                                            i * 1000
                                                                    ).map((value) => (
                                                                        <SelectItem
                                                                            key={value}
                                                                            value={value.toString()}
                                                                        >
                                                                            {formatCurrency(value)}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={coverage.MontoDeducible.toString()}
                                                            onValueChange={(value) =>
                                                                handleDeducibleChange(coverage.CoberturaID, value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-[100px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.from(
                                                                    {
                                                                        length:
                                                                            Math.floor(
                                                                                (coverage.DeducibleMax -
                                                                                    coverage.DeducibleMin) /
                                                                                coverage.RangoSeleccion
                                                                            ) + 1,
                                                                    },
                                                                    (_, i) =>
                                                                        coverage.DeducibleMin +
                                                                        i * coverage.RangoSeleccion
                                                                ).map((value) => (
                                                                    <SelectItem key={value} value={value.toString()}>
                                                                        {value}%
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(coverage.PrimaCalculada)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {!coverage.Obligatoria && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDeleteCobertura(coverage.CoberturaID)
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sección de bonificación y prima total */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                                    <FormItem className="w-full md:w-1/3">
                                        <FormLabel>Bonificación técnica (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="35"
                                                value={bonificacion}
                                                onChange={(e) => handleBonificacionChange(e.target.value)}
                                            />
                                        </FormControl>
                                        <p className="text-sm text-muted-foreground">
                                            Mínimo 0% - Máximo 35%
                                        </p>
                                    </FormItem>

                                    <div className="text-right flex-1">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>
                                                    {formatCurrency(
                                                        totalPrima / (1 - bonificacion / 100)
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Bonificación ({bonificacion}%):
                                                </span>
                                                <span className="text-green-600">
                                                    -
                                                    {formatCurrency(
                                                        (totalPrima / (1 - bonificacion / 100)) * (bonificacion / 100)
                                                    )}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Prima total:</span>
                                                <span className="text-2xl font-bold text-primary">
                                                    {formatCurrency(totalPrima)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {coverages.some(c => c.EsCoberturaEspecial) && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Coberturas especiales incluidas</AlertTitle>
                                <AlertDescription>
                                    Este paquete incluye coberturas especiales que pueden requerir
                                    aprobación adicional.
                                </AlertDescription>
                            </Alert>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoverageStep;