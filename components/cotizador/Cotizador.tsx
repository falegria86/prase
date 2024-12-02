"use client";

import type { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import type { Step } from "@/types/cotizador";
import VehicleDataStep from "./VehicleDataStep";
import QuoteDataStep from "./QuoteDataStep";
import CoverageStep from "./CoverageStep";
import QuoteSummaryStep from "./QuoteSummaryStep";
import VehicleUseStep from "./VehicleUseStep";
import { StepIndicator } from "./StepIndicator";
import { iGetTiposVehiculo, iGetUsosVehiculo } from "@/interfaces/CatVehiculosInterface";
import { iGetAnios } from "@/interfaces/LibroAzul";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";
import { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";
import { iGetAllPaquetes, iGetAsociacionPaqueteCobertura } from "@/interfaces/CatPaquetesInterface";
import { iGetCoberturas, iGetTiposMoneda } from "@/interfaces/CatCoberturasInterface";
import { generarPDFCotizacion } from "./GenerarPDFCotizacion";
import { iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";
import { postCotizacion } from "@/actions/CotizadorActions";
import { iPostCotizacion } from "@/interfaces/CotizacionInterface";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof nuevaCotizacionSchema>;

interface CotizadorProps {
    apiKey: string;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
    years: iGetAnios[];
    usuarioID: number;
    tiposPagos: iGetTipoPagos[];
    tiposSumas: iGetTiposSumasAseguradas[];
    derechoPoliza: string;
    paquetesCobertura: iGetAllPaquetes[];
    coberturas: iGetCoberturas[];
    asociaciones: iGetAsociacionPaqueteCobertura[];
    reglasNegocio: iGetAllReglaNegocio[];
    tiposMoneda: iGetTiposMoneda[] | [];
}

const steps: Step[] = [
    { title: "Origen y uso", icon: "Car" },
    { title: "Datos del vehículo", icon: "Truck" },
    { title: "Datos de cotización", icon: "FileText" },
    { title: "Coberturas", icon: "Shield" },
    { title: "Resumen", icon: "CheckCircle" },
];

export const Cotizador = ({
    apiKey,
    tiposVehiculo,
    usosVehiculo,
    years,
    usuarioID,
    tiposPagos,
    tiposSumas,
    derechoPoliza,
    paquetesCobertura,
    coberturas,
    asociaciones,
    reglasNegocio,
    tiposMoneda,
}: CotizadorProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isStepValid, setIsStepValid] = useState(false);
    const [pasoMaximoAlcanzado, setPasoMaximoAlcanzado] = useState(1);

    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(nuevaCotizacionSchema),
        defaultValues: {
            UsuarioID: usuarioID,
            EstadoCotizacion: "REGISTRO",
            PrimaTotal: 0,
            TipoPagoID: tiposPagos.find(tipo => tipo.Descripcion.toLowerCase() === "anual")?.TipoPagoID || 0,
            PorcentajeDescuento: 0,
            DerechoPoliza: Number(derechoPoliza),
            TipoSumaAseguradaID: 2,
            SumaAsegurada: 0,
            PeriodoGracia: 3,
            UsoVehiculo: 0,
            TipoVehiculo: 0,
            meses: 12,
            vigencia: "Anual",
            NombrePersona: "",
            Correo: "",
            Telefono: "",
            UnidadSalvamento: false,
            VIN: "",
            CP: "",
            Marca: "",
            Submarca: "",
            Modelo: "",
            Version: "",
            inicioVigencia: new Date(),
            finVigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .split("T")[0],
            detalles: [],
            versionNombre: "",
            marcaNombre: "",
            modeloNombre: "",
            Estado: "",
        },
    });

    // Validación de campos por paso
    const stepFields: Record<number, (keyof FormData)[]> = {
        1: ["UsoVehiculo", "TipoVehiculo"],
        2: ["Modelo", "Marca", "Submarca", "Version", "CP"],
        3: [
            "TipoSumaAseguradaID",
            "SumaAsegurada",
            "PeriodoGracia",
            "NombrePersona",
            "inicioVigencia",
        ],
        4: ["PaqueteCoberturaID"],
        5: [],
    };

    // Manejadores de navegación entre pasos
    const handleNext = async () => {
        const fields = stepFields[currentStep];
        const isValid = await form.trigger(fields);

        if (isValid) {
            const siguientePaso = Math.min(currentStep + 1, steps.length);
            setCurrentStep(siguientePaso);
            setPasoMaximoAlcanzado(prev => Math.max(prev, siguientePaso));
            setIsStepValid(false);
        }
    };

    const handlePrevious = async () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        const fields = stepFields[currentStep - 1];
        form.trigger(fields).then(setIsStepValid);
    };

    const handleFinalSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        const datosFormulario = form.getValues();

        try {
            if (!datosFormulario) {
                console.error("No hay datos del formulario");
                return;
            }

            // Crear el objeto que coincida exactamente con iPostCotizacion
            const datosParaEnviar: iPostCotizacion = {
                UsuarioID: datosFormulario.UsuarioID,
                PrimaTotal: datosFormulario.PrimaTotal,
                EstadoCotizacion: datosFormulario.EstadoCotizacion,
                TipoPagoID: datosFormulario.TipoPagoID,
                PorcentajeDescuento: datosFormulario.PorcentajeDescuento,
                DerechoPoliza: datosFormulario.DerechoPoliza,
                TipoSumaAseguradaID: datosFormulario.TipoSumaAseguradaID,
                SumaAsegurada: Number(datosFormulario.SumaAsegurada),
                PeriodoGracia: datosFormulario.PeriodoGracia,
                PaqueteCoberturaID: datosFormulario.PaqueteCoberturaID,
                UsoVehiculo: datosFormulario.UsoVehiculo,
                TipoVehiculo: datosFormulario.TipoVehiculo,
                NombrePersona: datosFormulario.NombrePersona,
                Correo: datosFormulario.Correo,
                Telefono: datosFormulario.Telefono,
                UnidadSalvamento: datosFormulario.UnidadSalvamento,
                VIN: datosFormulario.VIN,
                CP: datosFormulario.CP,
                Marca: datosFormulario.Marca,
                Submarca: datosFormulario.Submarca,
                Modelo: datosFormulario.Modelo,
                Version: datosFormulario.Version,
                detalles: datosFormulario.detalles.map(detalle => ({
                    CoberturaID: detalle.CoberturaID,
                    MontoSumaAsegurada: Number(detalle.MontoSumaAsegurada),
                    DeducibleID: detalle.DeducibleID,
                    MontoDeducible: detalle.MontoDeducible,
                    PrimaCalculada: detalle.PrimaCalculada,
                    PorcentajePrimaAplicado: detalle.PorcentajePrimaAplicado,
                    ValorAseguradoUsado: Number(detalle.ValorAseguradoUsado)
                }))
            };

            const resp = await postCotizacion(datosParaEnviar);
            console.log(resp)
            // Generar PDF solo si el post fue exitoso
            generarPDFCotizacion({
                datos: datosFormulario,
                tiposVehiculo,
                usosVehiculo
            });

            router.push('/cotizaciones/lista')

        } catch (error) {
            console.error("Error al procesar la cotización:", error);
            if (error instanceof Error) {
                console.error("Mensaje de error:", error.message);
                console.error("Stack trace:", error.stack);
            }
        }
    };

    // Renderizado condicional del paso actual
    const renderStep = () => {
        const props = {
            form,
            apiKey,
            tiposVehiculo,
            usosVehiculo,
            years,
            tiposPagos,
            tiposSumas,
            paquetesCobertura,
            coberturas,
            asociaciones,
            reglasNegocio,
            setIsStepValid,
            tiposMoneda,
        };

        switch (currentStep) {
            case 1:
                return <VehicleUseStep {...props} />;
            case 2:
                return <VehicleDataStep {...props} />;
            case 3:
                return <QuoteDataStep {...props} />;
            case 4:
                return <CoverageStep {...props} />;
            case 5:
                return <QuoteSummaryStep {...props} />;
            default:
                return null;
        }
    };

    return (
        <div className="">
            <StepIndicator
                pasos={steps}
                pasoActual={currentStep}
                pasoMaximoAlcanzado={pasoMaximoAlcanzado}
                alCambiarPaso={setCurrentStep}
            />

            <div className="mt-8 bg-white rounded-lg shadow-lg">
                <Form {...form}>
                    <form className="space-y-8 p-6">
                        <div>
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </div>

                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="flex items-center"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Anterior
                            </Button>

                            {currentStep < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!isStepValid}
                                    className="flex items-center"
                                >
                                    Siguiente
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    disabled={!isStepValid}
                                    onClick={handleFinalSubmit}
                                    className="flex items-center"
                                >
                                    Finalizar cotización
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default Cotizador;