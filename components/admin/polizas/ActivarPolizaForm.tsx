"use client";

import { useState } from "react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { StepIndicator } from "@/components/cotizador/StepIndicator";
import { ClientePolizaStep } from "./ClientePolizaStep";
import { VehiculoPolizaStep } from "./VehiculoPolizaStep";
import DocumentosPolizaStep from "./DocumentosPolizaStep";

const pasos = [
    { title: "Cliente", icon: "Car" },
    { title: "Vehículo", icon: "Car" },
    { title: "Póliza", icon: "FileText" },
];

interface ActivarPolizaFormProps {
    cotizacion: iGetCotizacion;
}

export const ActivarPolizaForm = ({ cotizacion }: ActivarPolizaFormProps) => {
    const [pasoActual, setPasoActual] = useState(1);
    const [pasoMaximoAlcanzado, setPasoMaximoAlcanzado] = useState(1);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [zonaResidencia, setZonaResidencia] = useState("");

    const manejarSubmitCliente = (idCliente: number, zona?: string) => {
        setClienteId(idCliente);
        if (zona) setZonaResidencia(zona)
        setPasoActual(2);
        setPasoMaximoAlcanzado(2);
    };

    const manejarSubmitVehiculo = (idVehiculo: number) => {
        console.log(idVehiculo)
        setPasoActual(3);
        setPasoMaximoAlcanzado(3);
    };

    const manejarSubmitDocumentos = (data: any) => {
        console.log(data)
    }
    return (
        <div className="space-y-6">
            <StepIndicator
                pasos={pasos}
                pasoActual={pasoActual}
                pasoMaximoAlcanzado={pasoMaximoAlcanzado}
                alCambiarPaso={setPasoActual}
            />

            {pasoActual === 1 && (
                <ClientePolizaStep
                    nombreInicial={cotizacion.NombrePersona}
                    telefonoInicial={cotizacion.Telefono}
                    emailInicial={cotizacion.Correo}
                    alSubmit={manejarSubmitCliente}
                />
            )}

            {pasoActual === 2 && clienteId && (
                <VehiculoPolizaStep
                    clienteId={clienteId}
                    zona={zonaResidencia}
                    alSubmit={manejarSubmitVehiculo}
                />
            )}

            {pasoActual === 3 && (
                <DocumentosPolizaStep
                    alSubmit={manejarSubmitDocumentos}
                />
            )}
        </div>
    );
};