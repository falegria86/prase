"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Info,
    CreditCard,
    Trash2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Cobertura, StepProps } from "@/types/cotizador";
import { formatCurrency } from "@/lib/format";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";

interface PricingBreakdown {
    subtotal: number;
    discount: number;
    total: number;
    firstPayment: number;
    subsequentPayment: number;
    numberOfPayments: number;
}

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
    // reglasGlobales,
    tiposPagos,
    setIsStepValid,
}: StepProps) => {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [regularCoverages, setRegularCoverages] = useState<Coverage[]>([]);
    const [accessoryCoverages, setAccessoryCoverages] = useState<Coverage[]>([]);
    const [selectedTipoPago, setSelectedTipoPago] = useState<iGetTipoPagos | null>(null);
    const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
    const [bonificacion, setBonificacion] = useState(0);

    const calculatePremium = (
        cobertura: Cobertura,
        selectedSumaAsegurada: number,
        selectedDeducible: number
    ): number => {
        //Caso 1: Prima base con deducible
        if (cobertura.PrimaBase && cobertura.DeducibleMin) {
            const primaBase = parseFloat(cobertura.PrimaBase);
            return primaBase * (1 - selectedDeducible / 100);
        }

        //Caso 2: Basado en prima asegurada con tasa
        const tasaBase = parseFloat(cobertura.PorcentajePrima) / 100;

        //Caso 3: Con deducible
        if (cobertura.DeducibleMin) {
            const costoInicial = selectedSumaAsegurada * tasaBase;
            return costoInicial * (1 - selectedDeducible / 100);
        }

        //Case 4: Sin deducible
        return selectedSumaAsegurada * tasaBase;
    };

    const calculatePaymentBreakdown = (
        subtotal: number,
        tipoPago: iGetTipoPagos,
        bonificacion: number
    ): PricingBreakdown => {
        const discountAmount = (subtotal * bonificacion) / 10;
        const totalAfterDiscount = subtotal - discountAmount;

        const currentDivisor = tipoPago.Divisor;
        const currentPorcentajeAjuste = parseFloat(tipoPago.PorcentajeAjuste);

        if (currentDivisor === 1) {
            return {
                subtotal,
                discount: discountAmount,
                total: totalAfterDiscount,
                firstPayment: totalAfterDiscount,
                subsequentPayment: 0,
                numberOfPayments: 1
            };
        }

        const adjustedTotal = totalAfterDiscount * (1 + currentPorcentajeAjuste / 100);
        const paymentAmount = adjustedTotal / currentDivisor;

        return {
            subtotal,
            discount: discountAmount,
            total: adjustedTotal,
            firstPayment: paymentAmount,
            subsequentPayment: paymentAmount,
            numberOfPayments: currentDivisor
        };
    };

    const updatePricing = () => {
        if (!selectedTipoPago) return;

        const subtotal = [...regularCoverages, ...accessoryCoverages].reduce(
            (sum, coverage) => sum + coverage.PrimaCalculada,
            0
        );

        const breakdown = calculatePaymentBreakdown(subtotal, selectedTipoPago, bonificacion);
        setPricingBreakdown(breakdown);

        // Update form values
        form.setValue("PrimaTotal", breakdown.total);
        form.setValue("PorcentajeDescuento", bonificacion);
    };

    const handlePackageSelect = async (packageId: number) => {
        const selectedAssociations = asociaciones?.filter(
            (a) => a.PaqueteCoberturaID === packageId
        ) ?? [];

        const vehicleSumaAsegurada = form.getValues("SumaAsegurada");

        const allCoverages = selectedAssociations?.map((association) => {
            const coverage = coberturas?.find(
                (c) => c.CoberturaID === association.CoberturaID
            );
            if (!coverage) return null;

            const sumaAsegurada = coverage.AplicaSumaAsegurada
                ? vehicleSumaAsegurada
                : parseFloat(coverage.SumaAseguradaMin);

            const deducible = parseInt(coverage.DeducibleMin);
            const prima = calculatePremium(coverage, sumaAsegurada, deducible);

            // Construir el objeto según el schema requerido
            const detalleCoverage = {
                CoberturaID: coverage.CoberturaID,
                MontoSumaAsegurada: Number(sumaAsegurada),
                DeducibleID: 1, // Valor por defecto
                MontoDeducible: Number(deducible),
                PrimaCalculada: Number(prima),
                PorcentajePrimaAplicado: Number(coverage.PorcentajePrima),
                ValorAseguradoUsado: Number(sumaAsegurada)
            };

            return {
                ...detalleCoverage,
                NombreCobertura: coverage.NombreCobertura,
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

        const regular = allCoverages.filter(c => c.EsCoberturaEspecial);
        const accessory = allCoverages.filter(c => !c.EsCoberturaEspecial);

        setRegularCoverages(regular);
        setAccessoryCoverages(accessory);
        setSelectedPackage(packageId);

        // Actualizar form con los valores requeridos
        form.setValue("PaqueteCoberturaID", packageId);

        // Extraer solo los campos necesarios para el schema de detalles
        const detallesForm = allCoverages.map(coverage => ({
            CoberturaID: coverage.CoberturaID,
            MontoSumaAsegurada: Number(coverage.MontoSumaAsegurada),
            DeducibleID: Number(coverage.DeducibleID),
            MontoDeducible: Number(coverage.MontoDeducible),
            PrimaCalculada: Number(coverage.PrimaCalculada),
            PorcentajePrimaAplicado: Number(coverage.PorcentajePrimaAplicado),
            ValorAseguradoUsado: Number(coverage.ValorAseguradoUsado),
            NombreCobertura: coverage.NombreCobertura,
        }));

        form.setValue("detalles", detallesForm);

        // Calcular y establecer la prima total incluso sin bonificación
        const subtotal = allCoverages.reduce(
            (sum, coverage) => sum + coverage.PrimaCalculada,
            0
        );
        form.setValue("PrimaTotal", subtotal);

        // Si hay un tipo de pago seleccionado, actualizar el cálculo
        if (selectedTipoPago) {
            const breakdown = calculatePaymentBreakdown(subtotal, selectedTipoPago, bonificacion);
            setPricingBreakdown(breakdown);
            form.setValue("PrimaTotal", breakdown.total);
        }
    };

    const handleSumaAseguradaChange = (coberturaId: number, value: string) => {
        const updateCoverages = (coverages: Coverage[]) =>
            coverages.map((coverage) => {
                if (coverage.CoberturaID === coberturaId) {
                    const newSumaAsegurada = parseFloat(value);
                    const coberturaFound = coberturas?.find((c) => c.CoberturaID === coberturaId);
                    if (!coberturaFound) return coverage;

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

        setRegularCoverages(updateCoverages(regularCoverages));
        setAccessoryCoverages(updateCoverages(accessoryCoverages));
        updatePricing();
    };

    const handleTipoPagoSelect = (tipoPagoId: string) => {
        const selectedTipo = tiposPagos?.find(tp => tp.TipoPagoID === parseInt(tipoPagoId));
        if (selectedTipo) {
            const tipoPagoCompleto: iGetTipoPagos = {
                TipoPagoID: selectedTipo.TipoPagoID,
                Descripcion: selectedTipo.Descripcion,
                PorcentajeAjuste: selectedTipo.PorcentajeAjuste,
                Divisor: selectedTipo.Divisor
            };

            // Actualizar form con el ID del tipo de pago
            form.setValue("TipoPagoID", tipoPagoCompleto.TipoPagoID);

            const subtotal = [...regularCoverages, ...accessoryCoverages].reduce(
                (sum, coverage) => sum + coverage.PrimaCalculada,
                0
            );

            const breakdown = calculatePaymentBreakdown(
                subtotal,
                tipoPagoCompleto,
                bonificacion
            );

            setPricingBreakdown(breakdown);
            setSelectedTipoPago(tipoPagoCompleto);

            // Actualizar PrimaTotal en el form
            form.setValue("PrimaTotal", breakdown.total);
        }
    };

    const handleDeducibleChange = (coberturaId: number, value: string) => {
        const updateCoverages = (coverages: Coverage[]) =>
            coverages.map((coverage) => {
                if (coverage.CoberturaID === coberturaId) {
                    const newDeducible = parseInt(value);
                    const coberturaFound = coberturas?.find((c) => c.CoberturaID === coberturaId);
                    if (!coberturaFound) return coverage;

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

        // Actualizar los estados locales
        const newRegularCoverages = updateCoverages(regularCoverages);
        const newAccessoryCoverages = updateCoverages(accessoryCoverages);

        setRegularCoverages(newRegularCoverages);
        setAccessoryCoverages(newAccessoryCoverages);

        // Actualizar el formulario con los detalles actualizados
        const allUpdatedCoverages = [...newRegularCoverages, ...newAccessoryCoverages].map(coverage => ({
            CoberturaID: coverage.CoberturaID,
            MontoSumaAsegurada: coverage.MontoSumaAsegurada,
            DeducibleID: coverage.DeducibleID,
            MontoDeducible: coverage.MontoDeducible,
            PrimaCalculada: coverage.PrimaCalculada,
            PorcentajePrimaAplicado: coverage.PorcentajePrimaAplicado,
            ValorAseguradoUsado: coverage.ValorAseguradoUsado,
            NombreCobertura: coverage.NombreCobertura
        }));

        form.setValue("detalles", allUpdatedCoverages, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });

        updatePricing();
    };

    const handleDeleteCobertura = (coberturaId: number) => {
        // Filter out the deleted coverage
        const updateCoverages = (coverages: Coverage[]) =>
            coverages.filter((coverage) => coverage.CoberturaID !== coberturaId);

        // Update both coverage arrays
        const newRegularCoverages = updateCoverages(regularCoverages);
        const newAccessoryCoverages = updateCoverages(accessoryCoverages);

        // Update state
        setRegularCoverages(newRegularCoverages);
        setAccessoryCoverages(newAccessoryCoverages);

        // Update form details
        const allCoverages = [...newRegularCoverages, ...newAccessoryCoverages];
        form.setValue("detalles", allCoverages);

        // Calculate and update pricing if a payment type is selected
        if (selectedTipoPago) {
            const subtotal = allCoverages.reduce(
                (sum, coverage) => sum + coverage.PrimaCalculada,
                0
            );
            const breakdown = calculatePaymentBreakdown(subtotal, selectedTipoPago, bonificacion);
            setPricingBreakdown(breakdown);
            form.setValue("PrimaTotal", breakdown.total);
        }
    };

    const handleBonificacionChange = (value: string) => {
        const parsedValue = parseFloat(value) || 0;
        const newBonificacion = Math.min(Math.max(parsedValue, 0), 35);
        setBonificacion(newBonificacion);
        updatePricing();
    };

    useEffect(() => {
        const validateStep = async () => {
            const isValid =
                (regularCoverages.length > 0 || accessoryCoverages.length > 0) &&
                await form.trigger("PaqueteCoberturaID");
            setIsStepValid?.(isValid);
        };
        validateStep();
    }, [regularCoverages, accessoryCoverages, form, setIsStepValid]);

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
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <div>
                {selectedPackage && (regularCoverages.length > 0 || accessoryCoverages.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                        transition={{ duration: 0.3 }}
                    >
                        {/* Coberturas Principales */}
                        {regularCoverages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Coberturas Principales</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                            {regularCoverages.map((coverage) => (
                                                <TableRow key={coverage.CoberturaID}>
                                                    <TableCell>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {coverage.NombreCobertura}
                                                                    </span>
                                                                    {coverage.Obligatoria && (
                                                                        <Badge variant="secondary">
                                                                            Obligatoria
                                                                        </Badge>
                                                                    )}
                                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-xs">
                                                                        {coverage.Descripcion}
                                                                    </p>
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
                                </CardContent>
                            </Card>
                        )}

                        {/* Coberturas Accesorias */}
                        {accessoryCoverages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Coberturas Accesorias</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                            {accessoryCoverages.map((coverage) => (
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
                                                                    <SelectItem value={coverage.MontoSumaAsegurada.toString()}>
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
                                                                        <SelectItem key={value} value={value.toString()}>
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
                                </CardContent>
                            </Card>
                        )}

                        {/* Tipo de Pago */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Forma de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Select
                                        value={selectedTipoPago?.TipoPagoID.toString()}
                                        onValueChange={handleTipoPagoSelect}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona forma de pago" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposPagos?.map((tipo) => (
                                                <SelectItem
                                                    key={tipo.TipoPagoID}
                                                    value={tipo.TipoPagoID.toString()}
                                                >
                                                    {tipo.Descripcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {pricingBreakdown && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>{formatCurrency(pricingBreakdown.subtotal)}</span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Bonificación ({bonificacion}%):
                                                </span>
                                                <span className="text-green-600">
                                                    -{formatCurrency(pricingBreakdown.discount)}
                                                </span>
                                            </div>

                                            {selectedTipoPago && selectedTipoPago.Divisor > 1 && (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Primer pago:</span>
                                                        <span>{formatCurrency(pricingBreakdown.firstPayment)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            {pricingBreakdown.numberOfPayments - 1} pagos subsecuentes de:
                                                        </span>
                                                        <span>{formatCurrency(pricingBreakdown.subsequentPayment)}</span>
                                                    </div>
                                                </>
                                            )}

                                            <Separator />

                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Prima total:</span>
                                                <span className="text-2xl font-bold text-primary">
                                                    {formatCurrency(pricingBreakdown.total)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bonificación */}
                        <Card>
                            <CardContent className="pt-6">
                                <FormItem>
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
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CoverageStep;