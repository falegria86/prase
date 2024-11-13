"use client";

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from "@/components/ui/input";
import type { Cobertura } from '@/types/cotizador';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { formatCurrency } from '@/lib/format';

interface PremiumCalculatorProps {
    cobertura: Cobertura;
    onPremiumCalculated: (premium: number) => void;
}

export const PremiumCalculator = ({
    cobertura,
    onPremiumCalculated,
}: PremiumCalculatorProps) => {
    const [sumaAsegurada, setSumaAsegurada] = useState(parseFloat(cobertura.SumaAseguradaMin));
    const [deducible, setDeducible] = useState(parseFloat(cobertura.DeducibleMin));

    const calculatePremium = () => {
        let prima = 0;

        if (cobertura.PrimaBase) {
            prima = parseFloat(cobertura.PrimaBase);
        } else {
            const porcentajePrima = parseFloat(cobertura.PorcentajePrima) / 100;
            prima = sumaAsegurada * porcentajePrima;
        }

        prima *= (1 - deducible / 100);
        onPremiumCalculated(prima);

        return prima;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculadora de Prima
                </CardTitle>
                <CardDescription>
                    Ajusta los valores para calcular la prima
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Suma Asegurada</label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[sumaAsegurada]}
                                min={parseFloat(cobertura.SumaAseguradaMin)}
                                max={parseFloat(cobertura.SumaAseguradaMax)}
                                step={1000}
                                onValueChange={([value]) => {
                                    setSumaAsegurada(value);
                                    calculatePremium();
                                }}
                            />
                            <Input
                                type="number"
                                value={sumaAsegurada}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setSumaAsegurada(value);
                                    calculatePremium();
                                }}
                                className="w-32"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Deducible (%)</label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[deducible]}
                                min={parseFloat(cobertura.DeducibleMin)}
                                max={parseFloat(cobertura.DeducibleMax)}
                                step={parseFloat(cobertura.RangoSeleccion)}
                                onValueChange={([value]) => {
                                    setDeducible(value);
                                    calculatePremium();
                                }}
                            />
                            <Input
                                type="number"
                                value={deducible}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setDeducible(value);
                                    calculatePremium();
                                }}
                                className="w-24"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Prima calculada:</span>
                        <span className="text-2xl font-bold text-primary">
                            {formatCurrency(calculatePremium())}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};