"use client";

import type { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
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
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";

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
    reglasGlobales: iGetAllReglaNegocio[];
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
    reglasGlobales,
}: CotizadorProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isStepValid, setIsStepValid] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(nuevaCotizacionSchema),
        defaultValues: {
            UsuarioID: usuarioID,
            EstadoCotizacion: "REGISTRO",
            PrimaTotal: 0,
            TipoPagoID: 0,
            PorcentajeDescuento: 0,
            DerechoPoliza: Number(derechoPoliza),
            TipoSumaAseguradaID: 0,
            SumaAsegurada: 0,
            PeriodoGracia: 0,
            UsoVehiculo: 0,
            TipoVehiculo: 0,
            AMIS: "",
            meses: 12,
            vigencia: "Anual",
            NombrePersona: "",
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
        },
    });

    // Validación de campos por paso
    const stepFields: Record<number, (keyof FormData)[]> = {
        1: ["UsoVehiculo", "TipoVehiculo"],
        2: ["Modelo", "Marca", "Submarca", "Version", "AMIS", "CP"],
        3: [
            "TipoSumaAseguradaID",
            "SumaAsegurada",
            "PeriodoGracia",
            "NombrePersona",
            "inicioVigencia",
        ],
        4: ["PaqueteCoberturaID", "detalles"],
        5: [], // Paso de resumen no requiere validación adicional
    };

    // Manejadores de navegación entre pasos
    const handleNext = async () => {
        const fields = stepFields[currentStep];
        const isValid = await form.trigger(fields);

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
            setIsStepValid(false);
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        const fields = stepFields[currentStep - 1];
        form.trigger(fields).then(setIsStepValid);
    };

    // Manejador de envío del formulario
    const onSubmit = async (data: FormData) => {
        try {
            console.log("Enviando cotización:", data);
            // Aquí implementarías la lógica de envío a tu API
        } catch (error) {
            console.error("Error al enviar la cotización:", error);
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
            reglasGlobales,
            setIsStepValid,
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
            <StepIndicator steps={steps} currentStep={currentStep} />

            <div className="mt-8 bg-white rounded-lg shadow-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>

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
                                <Button type="submit" className="flex items-center">
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