import { useState, useCallback } from 'react';
import type { Cobertura, ReglaGlobal } from '@/types/cotizador';
import { calculatePremium } from '@/lib/utils';

export const useCotizadorCalculations = (reglasGlobales: ReglaGlobal[]) => {
    const [calculations, setCalculations] = useState({
        subtotal: 0,
        discount: 0,
        total: 0
    });

    const updateCalculations = useCallback((
        coverages: {
            cobertura: Cobertura;
            sumaAsegurada: number;
            deducible: number;
        }[],
        discountPercentage: number
    ) => {
        const subtotal = coverages.reduce((acc, { cobertura, sumaAsegurada, deducible }) => {
            return acc + calculatePremium(cobertura, sumaAsegurada, deducible, reglasGlobales);
        }, 0);

        const discount = (subtotal * discountPercentage) / 100;
        const total = subtotal - discount;

        setCalculations({ subtotal, discount, total });
        return { subtotal, discount, total };
    }, [reglasGlobales]);

    return { calculations, updateCalculations };
};