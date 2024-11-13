import { AlertCircle } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import type { FormData } from '@/types/cotizador';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ValidationSummaryProps {
    errors: FieldErrors<FormData>;
}

export const ValidationSummary = ({ errors }: ValidationSummaryProps) => {
    const errorCount = Object.keys(errors).length;

    if (errorCount === 0) return null;

    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errores de validación</AlertTitle>
            <AlertDescription>
                <p className="mb-2">
                    Por favor, corrige los siguientes errores para continuar:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                    {Object.entries(errors).map(([key, error]) => (
                        <li key={key}>
                            {error.message}
                        </li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
};