"use client";

import { useState } from 'react';
import {
    FileText,
    Download,
    Mail,
    Share2,
    Printer,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormData } from '@/types/cotizador';

interface QuoteExporterProps {
    quoteData: FormData;
    onExportComplete?: (url: string) => void;
}

export const QuoteExporter = ({
    quoteData,
    onExportComplete
}: QuoteExporterProps) => {
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
    const [email, setEmail] = useState('');
    const [includeOptions, setIncludeOptions] = useState({
        vehicleDetails: true,
        coverageDetails: true,
        paymentDetails: true,
        terms: true
    });

    const handleExport = async () => {
        setLoading(true);
        try {
            // Aquí iría la lógica real de exportación
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulación de URL del documento
            const documentUrl = 'https://example.com/quote.pdf';
            onExportComplete?.(documentUrl);

        } catch (error) {
            console.error('Error al exportar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Cotización de Seguro',
                    text: `Cotización para ${quoteData.NombrePersona}`,
                    url: window.location.href
                });
            } catch (error) {
                console.error('Error al compartir:', error);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Exportar Cotización
                </CardTitle>
                <CardDescription>
                    Exporta o comparte la cotización en diferentes formatos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Formato de exportación</Label>
                        <Select
                            value={format}
                            onValueChange={(value: 'pdf' | 'excel') => setFormat(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona formato" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="excel">Excel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Enviar por correo (opcional)</Label>
                        <Input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Incluir en el documento:</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="vehicleDetails"
                                    checked={includeOptions.vehicleDetails}
                                    onCheckedChange={(checked) =>
                                        setIncludeOptions(prev => ({
                                            ...prev,
                                            vehicleDetails: checked as boolean
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="vehicleDetails"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Detalles del vehículo
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="coverageDetails"
                                    checked={includeOptions.coverageDetails}
                                    onCheckedChange={(checked) =>
                                        setIncludeOptions(prev => ({
                                            ...prev,
                                            coverageDetails: checked as boolean
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="coverageDetails"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Detalle de coberturas
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="paymentDetails"
                                    checked={includeOptions.paymentDetails}
                                    onCheckedChange={(checked) =>
                                        setIncludeOptions(prev => ({
                                            ...prev,
                                            paymentDetails: checked as boolean
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="paymentDetails"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Detalles de pago
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={includeOptions.terms}
                                    onCheckedChange={(checked) =>
                                        setIncludeOptions(prev => ({
                                            ...prev,
                                            terms: checked as boolean
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Términos y condiciones
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={loading}
                        onClick={() => setEmail('')}
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleExport}
                        className="min-w-[120px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exportando...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};