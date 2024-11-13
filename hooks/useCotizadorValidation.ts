import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { FormData } from '@/types/cotizador';

export const useCotizadorValidation = (
    form: UseFormReturn<FormData>,
    currentStep: number,
    stepFields: Record<number, (keyof FormData)[]>
) => {
    const [isStepValid, setIsStepValid] = useState(false);

    useEffect(() => {
        const validateCurrentStep = async () => {
            const fields = stepFields[currentStep];
            if (!fields) return;

            const isValid = await form.trigger(fields);
            setIsStepValid(isValid);
        };

        validateCurrentStep();

        const subscription = form.watch(async () => {
            validateCurrentStep();
        });

        return () => subscription.unsubscribe();
    }, [currentStep, form, stepFields]);

    return isStepValid;
};