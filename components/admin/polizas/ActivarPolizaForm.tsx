import { useState } from "react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { StepIndicator } from "@/components/cotizador/StepIndicator";
import { ClientePolizaStep } from "./ClientePolizaStep";
import { VehiculoPolizaStep } from "./VehiculoPolizaStep";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { postPoliza } from "@/actions/PolizasActions";
import { ResumenPolizaStep } from "./ResumenPolizaStep";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";

const pasos = [
    { title: "Cliente", icon: "User" },
    { title: "Vehículo", icon: "Car" },
    { title: "Resumen", icon: "FileText" },
];

interface ActivarPolizaFormProps {
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
}

export const ActivarPolizaForm = ({ cotizacion, coberturas }: ActivarPolizaFormProps) => {
    const [pasoActual, setPasoActual] = useState(1);
    const [pasoMaximoAlcanzado, setPasoMaximoAlcanzado] = useState(1);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [vehiculoId, setVehiculoId] = useState<number | null>(null);
    const [zonaResidencia, setZonaResidencia] = useState("");

    const router = useRouter();
    const { toast } = useToast();

    const manejarSubmitCliente = (idCliente: number, zona?: string) => {
        setClienteId(idCliente);
        if (zona) setZonaResidencia(zona);
        setPasoActual(2);
        setPasoMaximoAlcanzado(2);
    };

    const manejarSubmitVehiculo = (idVehiculo: number) => {
        setVehiculoId(idVehiculo);
        setPasoActual(3);
        setPasoMaximoAlcanzado(3);
    };

    const manejarConfirmacion = async (datosResumen: {
        fechaInicio: Date;
        fechaFin: Date;
        descuentoProntoPago: number;
        tieneReclamos: boolean;
    }) => {
        if (!clienteId || !vehiculoId) return;

        try {
            const datosPoliza = {
                CotizacionID: cotizacion.CotizacionID,
                TipoPagoID: cotizacion.TipoPagoID,
                FechaInicio: datosResumen.fechaInicio.toISOString().split('T')[0],
                FechaFin: datosResumen.fechaFin.toISOString().split('T')[0],
                PrimaTotal: Number(cotizacion.PrimaTotal),
                TotalPagos: 12,
                NumeroPagos: 12,
                DescuentoProntoPago: datosResumen.descuentoProntoPago,
                TieneReclamos: datosResumen.tieneReclamos
            };

            const respuesta = await postPoliza(datosPoliza);
            console.log(respuesta)
            // if (respuesta) {
                toast({
                    title: "Póliza activada",
                    description: "La póliza se ha activado correctamente",
                });
                router.push("/polizas/lista");
                router.refresh();
            // } else {
            //     toast({
            //         title: "Error",
            //         description: "Hubo un problema al activar la póliza",
            //         variant: "destructive",
            //     });
            // }
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un problema al activar la póliza",
                variant: "destructive",
            });
        }
    };

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
                    cotizacion={cotizacion}
                    clienteId={clienteId}
                    zona={zonaResidencia}
                    alSubmit={manejarSubmitVehiculo}
                />
            )}

            {pasoActual === 3 && clienteId && vehiculoId && (
                <ResumenPolizaStep
                    cotizacion={cotizacion}
                    alConfirmar={manejarConfirmacion}
                    coberturas={coberturas}
                />
            )}
        </div>
    )
};