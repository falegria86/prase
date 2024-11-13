"use client";

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { FormData } from '@/types/cotizador';
import { formatCurrency } from '@/lib/format';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Quote extends FormData {
    id: number;
    fecha: string;
    estado: 'REGISTRO' | 'EMITIDA' | 'CANCELADA';
}

interface QuoteComparisonProps {
    quotes: Quote[];
    onQuoteSelect?: (quoteId: number) => void;
}

interface ComparisonSection {
    title: string;
    fields: {
        key: keyof Quote | string;
        label: string;
        format?: (value: any) => string;
        compareBy?: (a: any, b: any) => boolean;
    }[];
}

const estados = {
    REGISTRO: { label: 'En Proceso', color: 'bg-yellow-100 text-yellow-800' },
    EMITIDA: { label: 'Emitida', color: 'bg-green-100 text-green-800' },
    CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
} as const;

export const QuoteComparison = ({
    quotes,
    onQuoteSelect,
}: QuoteComparisonProps) => {
    const [selectedQuotes, setSelectedQuotes] = useState<Quote[]>(quotes);
    const [bestQuote, setBestQuote] = useState<Quote | null>(null);

    const sections: ComparisonSection[] = [
        {
            title: "Información del Vehículo",
            fields: [
                { key: "marcaNombre", label: "Marca" },
                { key: "modeloNombre", label: "Modelo" },
                { key: "Modelo", label: "Año" },
                { key: "versionNombre", label: "Versión" },
            ]
        },
        {
            title: "Coberturas",
            fields: [
                {
                    key: "SumaAsegurada",
                    label: "Suma Asegurada",
                    format: formatCurrency
                },
                {
                    key: "PeriodoGracia",
                    label: "Período de Gracia",
                    format: (value: number) => `${value} días`
                },
            ]
        },
        {
            title: "Costos",
            fields: [
                {
                    key: "PrimaTotal",
                    label: "Prima Total",
                    format: formatCurrency,
                    compareBy: (a: number, b: number) => a < b
                },
                {
                    key: "DerechoPoliza",
                    label: "Derecho de Póliza",
                    format: formatCurrency
                },
                {
                    key: "PorcentajeDescuento",
                    label: "Descuento",
                    format: (value: number) => `${value}%`
                },
            ]
        }
    ];

    useEffect(() => {
        // Encontrar la mejor cotización basada en el precio más bajo
        if (selectedQuotes.length > 0) {
            const best = selectedQuotes.reduce((prev, current) => {
                return (prev.PrimaTotal < current.PrimaTotal) ? prev : current;
            });
            setBestQuote(best);
        }
    }, [selectedQuotes]);

    const getDifference = (key: string, format?: (value: any) => string, compareBy?: (a: any, b: any) => boolean) => {
        const values = selectedQuotes.map(q => q[key as keyof Quote]);
        const allEqual = values.every(v => v === values[0]);

        if (allEqual) return null;

        const min = Math.min(...(values as number[]));
        const max = Math.max(...(values as number[]));
        const diff = max - min;

        return {
            min: format ? format(min) : min,
            max: format ? format(max) : max,
            diff: format ? format(diff) : diff,
            best: compareBy ? values.reduce((a, b) => compareBy(a, b) ? a : b) : null
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comparación de Cotizaciones</CardTitle>
                <CardDescription>
                    Compara las características y costos de tus cotizaciones
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    {selectedQuotes.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {sections.map((section) => (
                                <div key={section.title} className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Característica</TableHead>
                                                {selectedQuotes.map((quote, index) => (
                                                    <TableHead key={quote.id || index}>
                                                        <div className="flex items-center gap-2">
                                                            <span>Cotización {index + 1}</span>
                                                            <Badge
                                                                variant="secondary"
                                                                className={estados[quote.estado].color}
                                                            >
                                                                {estados[quote.estado].label}
                                                            </Badge>
                                                            {bestQuote?.id === quote.id && (
                                                                <Badge variant="default" className="bg-green-500">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Mejor opción
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableHead>
                                                ))}
                                                <TableHead>Diferencia</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {section.fields.map((field) => (
                                                <TableRow key={field.key}>
                                                    <TableCell className="font-medium">
                                                        {field.label}
                                                    </TableCell>
                                                    {selectedQuotes.map((quote, index) => (
                                                        <TableCell key={quote.id || index}>
                                                            <div className="flex items-center gap-2">
                                                                {field.format ?
                                                                    field.format(quote[field.key as keyof Quote]) :
                                                                    quote[field.key as keyof Quote]?.toString()
                                                                }
                                                                {field.compareBy && quote[field.key as keyof Quote] ===
                                                                    getDifference(field.key, field.format, field.compareBy)?.best && (
                                                                        <Badge variant="default" className="bg-green-500">
                                                                            Mejor
                                                                        </Badge>
                                                                    )}
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                                    <TableCell>
                                                        {getDifference(field.key, field.format)?.diff && (
                                                            <Badge variant="secondary" className="font-mono">
                                                                {getDifference(field.key, field.format)?.diff}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}

                            {bestQuote && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-6"
                                >
                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <AlertDescription className="flex items-center justify-between">
                                            <span>
                                                La cotización {selectedQuotes.findIndex(q => q.id === bestQuote.id) + 1} es la mejor opción con un precio de {formatCurrency(bestQuote.PrimaTotal)}
                                            </span>
                                            <Button
                                                onClick={() => onQuoteSelect?.(bestQuote.id)}
                                                className="ml-4"
                                            >
                                                Seleccionar
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    No hay cotizaciones seleccionadas para comparar
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedQuotes([])}
                        disabled={selectedQuotes.length === 0}
                    >
                        Limpiar comparación
                    </Button>
                    {bestQuote && (
                        <Button
                            onClick={() => onQuoteSelect?.(bestQuote.id)}
                            disabled={!bestQuote}
                        >
                            Seleccionar mejor opción
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default QuoteComparison;