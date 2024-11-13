"use client";

import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check } from 'lucide-react';
import type { PaqueteCobertura, Cobertura } from '@/types/cotizador';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

interface PackageSelectorProps {
    packages: PaqueteCobertura[];
    coberturas: Cobertura[];
    selectedPackageId?: number;
    onSelect: (packageId: number) => void;
    calculatePackageTotal: (packageId: number) => number;
}

export const PackageSelector = ({
    packages,
    coberturas,
    selectedPackageId,
    onSelect,
    calculatePackageTotal,
}: PackageSelectorProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
                const total = calculatePackageTotal(pkg.PaqueteCoberturaID);
                const isSelected = selectedPackageId === pkg.PaqueteCoberturaID;

                return (
                    <motion.div
                        key={pkg.PaqueteCoberturaID}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className={cn(
                                "cursor-pointer transition-all",
                                isSelected && "border-primary ring-2 ring-primary"
                            )}
                            onClick={() => onSelect(pkg.PaqueteCoberturaID)}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className={cn(
                                            "h-5 w-5",
                                            isSelected ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        {pkg.NombrePaquete}
                                    </CardTitle>
                                    {isSelected && (
                                        <Badge variant="default">
                                            <Check className="h-3 w-3 mr-1" />
                                            Seleccionado
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {pkg.DescripcionPaquete}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-2xl font-bold text-primary">
                                        {formatCurrency(total)}
                                    </div>
                                    <div className="space-y-2">
                                        {coberturas
                                            .filter((cob) =>
                                                // Aquí irían las coberturas asociadas al paquete
                                                true
                                            )
                                            .map((cob) => (
                                                <div
                                                    key={cob.CoberturaID}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {cob.NombreCobertura}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
};