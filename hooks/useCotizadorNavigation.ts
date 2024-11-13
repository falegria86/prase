import { useState, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { FormData } from '@/types/cotizador';

export const useCotizadorNavigation = (
    form: UseFormReturn<FormData>,
    stepFields: Record<number, (keyof FormData)[]>,
    totalSteps: number
) => {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = useCallback(async () => {
        const fields = stepFields[currentStep];
        const isValid = await form.trigger(fields);

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
            return true;
        }
        return false;
    }, [currentStep, form, stepFields, totalSteps]);

    const handlePrevious = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToStep = useCallback((step: number) => {
        if (step >= 1 && step <= totalSteps) {
            setCurrentStep(step);
        }
    }, [totalSteps]);

    return {
        currentStep,
        handleNext,
        handlePrevious,
        goToStep,
    };
};