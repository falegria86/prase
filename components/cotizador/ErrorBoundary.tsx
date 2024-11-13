"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error en el cotizador</AlertTitle>
                    <AlertDescription>
                        <p className="mb-4">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Recargar página
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}