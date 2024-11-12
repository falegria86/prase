"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import StepIndicator from '../StepIndicator';
import VehicleUseSelector from './VehicleUseSelector';
import VehicleTypeSelector from './VehicleTypeSelector';
import { Form } from "@/components/ui/form";
import { nuevaCotizacionSchema } from '@/schemas/cotizadorSchema';
import { formatDateLocal } from '@/lib/format-date';
import { getMarcasPorAnio, getModelosPorAnioMarca, getVersionesPorAnioMarcaModelo, getPrecioVersionPorClave } from "@/actions/LibroAzul";
import { getAutocompleteSuggestions } from "@/actions/Geoapify";
import { getMarcasPorAnioSchema, getModelosPorAnioMarcaSchema, getVersionesPorAnioMarcaModeloSchema } from "@/schemas/libroAzulSchema";
import { iGetAnios, iGetMarcasPorAnio, iGetModelosPorAnioMarca, iGetPrecioVersionPorClave, iGetVersionesPorAnioMarcaModelo } from "@/interfaces/LibroAzul";
import { iGetTiposVehiculo, iGetUsosVehiculo } from '@/interfaces/CatVehiculosInterface';
// import { iGetTipoPagos } from '@/interfaces/CatTipoPagos';
import { iGetTiposSumasAseguradas } from '@/interfaces/CatTiposSumasInterface';
import { Feature } from '@/interfaces/GeoApifyInterface';
import { CotizacionDataForm } from './CotizacionDataForm';
import { VehicleDataForm } from './VehicleDataForm';
import { CoberturasForm } from './CoberturasForm';
import { iGetAllPaquetes, iGetAsociacionPaqueteCobertura } from '@/interfaces/CatPaquetesInterface';
import { iGetCoberturas } from '@/interfaces/CatCoberturasInterface';
import { iGetAllReglaNegocio } from '@/interfaces/ReglasNegocios';

export interface Step {
    title: string
    icon: string
}

const steps: Step[] = [
    { title: 'Origen y uso', icon: 'Car' },
    { title: 'Datos del vehículo', icon: 'Truck' },
    { title: 'Datos de cotización', icon: 'Bus' },
    { title: 'Coberturas', icon: 'FileText' },
    { title: 'Resumen', icon: 'FileText' },
];

interface Props {
    apiKey: string;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
    years: iGetAnios[];
    usuarioID: number;
    // tiposPagos: iGetTipoPagos[];
    tiposSumas: iGetTiposSumasAseguradas[];
    derechoPoliza: string;
    paquetesCobertura: iGetAllPaquetes[];
    coberturas: iGetCoberturas[];
    asociaciones: iGetAsociacionPaqueteCobertura[];
    reglasGlobales: iGetAllReglaNegocio[];
}

export default function Cotizador({
    apiKey,
    tiposVehiculo,
    usosVehiculo,
    years,
    usuarioID,
    // tiposPagos,
    tiposSumas,
    derechoPoliza,
    paquetesCobertura,
    coberturas,
    asociaciones,
    reglasGlobales,
}: Props) {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isStepValid, setIsStepValid] = useState<boolean>(false);
    const [isSumaAseguradaValid, setIsSumaAseguradaValid] = useState<boolean>(true);
    const [brands, setBrands] = useState<iGetMarcasPorAnio[]>([]);
    const [models, setModels] = useState<iGetModelosPorAnioMarca[]>([]);
    const [versions, setVersions] = useState<iGetVersionesPorAnioMarcaModelo[]>([]);
    const [price, setPrice] = useState<iGetPrecioVersionPorClave | null>(null);
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Feature[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const form = useForm<z.infer<typeof nuevaCotizacionSchema>>({
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
            // PaqueteCoberturaID: 0,
            UsoVehiculo: 0,
            TipoVehiculo: 0,
            AMIS: "",
            meses: 12,
            NombrePersona: "",
            UnidadSalvamento: false,
            VIN: "",
            CP: "",
            Marca: "",
            Submarca: "",
            Modelo: "",
            Version: "",
            minSumaAsegurada: -1,
            maxSumaAsegurada: -1,
            vigencia: "Anual",
            inicioVigencia: new Date().toISOString().split("T")[0],
            finVigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
            detalles: [],
            versionNombre: "",
            marcaNombre: "",
            modeloNombre: "",
        }
    });

    const updateFinVigencia = () => {
        const inicioVigencia = form.getValues("inicioVigencia");
        const meses = Number(form.getValues("meses"));
        const fechaInicio = new Date(inicioVigencia);

        if (!isNaN(fechaInicio.getTime())) {
            fechaInicio.setMonth(fechaInicio.getMonth() + meses);
            form.setValue("finVigencia", fechaInicio.toISOString().split("T")[0]);
        }
    };

    useEffect(() => {
        updateFinVigencia();
    }, [form.watch("inicioVigencia"), form.watch("meses")]);

    const fetchAutocompleteSuggestions = (query: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (!query) return;

            try {
                const suggestions = await getAutocompleteSuggestions(query);
                setAutocompleteSuggestions(suggestions || []);
            } catch (error) {
                console.error("Error fetching autocomplete suggestions:", error);
            }
        }, 300);
    };

    const handleYearSelect = async (yearClave: string) => {
        form.setValue("Marca", "");
        setModels([]);
        setVersions([]);
        setPrice(null);

        const year = years.find(y => y.Clave === yearClave);
        if (!year) return;

        form.setValue("Modelo", yearClave);
        setIsLoading(true);
        setError(null);

        try {
            const brandsData = await getMarcasPorAnio(apiKey, year);
            const validatedBrands = getMarcasPorAnioSchema.parse(brandsData);
            setBrands(validatedBrands || []);
        } catch (error) {
            setError('Error al cargar las marcas.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrandSelect = async (brandClave: string) => {
        setModels([]);
        setVersions([]);
        setPrice(null);

        const brand = brands.find(b => b.Clave === brandClave);
        if (!brand) return;

        form.setValue("Marca", brandClave);
        form.setValue("marcaNombre", brand.Nombre);
        setIsLoading(true);
        setError(null);

        try {
            const modelsData = await getModelosPorAnioMarca(apiKey, form.getValues("Modelo"), brand);
            const validatedModels = getModelosPorAnioMarcaSchema.parse(modelsData);
            setModels(validatedModels || []);
        } catch (error) {
            setError('Error al cargar los modelos.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModelSelect = async (modelClave: string) => {
        setVersions([]);
        setPrice(null);

        const model = models.find(m => m.Clave === modelClave);
        if (!model) return;

        form.setValue("Submarca", modelClave);
        form.setValue("modeloNombre", model.Nombre)
        setIsLoading(true);
        setError(null);

        try {
            const versionsData = await getVersionesPorAnioMarcaModelo(apiKey, form.getValues("Modelo"), form.getValues("Marca") as string, model);
            const validatedVersions = getVersionesPorAnioMarcaModeloSchema.parse(versionsData);
            setVersions(validatedVersions || []);
        } catch (error) {
            setError('Error al cargar las versiones.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVersionSelect = async (versionClave: string) => {
        setPrice(null);

        const version = versions.find((v) => v.Clave === versionClave);
        if (!version) return;

        form.setValue("Version", versionClave);
        form.setValue("versionNombre", version.Nombre);
        setIsLoading(true);
        setError(null);

        try {
            const priceData = await getPrecioVersionPorClave(apiKey, version);
            const validatedPrice = priceData ? { Venta: priceData.Venta, Compra: priceData.Compra, Moneda: priceData.Moneda } : null;
            setPrice(validatedPrice);
        } catch (error) {
            setError('Error al obtener el precio.');
        } finally {
            setIsLoading(false);
        }
    };

    const stepFields: Record<number, (keyof z.infer<typeof nuevaCotizacionSchema>)[]> = {
        1: ["UsoVehiculo", "TipoVehiculo"],
        2: ["Modelo", "Marca", "Submarca", "Version", "AMIS", "UnidadSalvamento", "CP"],
        3: ["DerechoPoliza", "TipoSumaAseguradaID", "SumaAsegurada", "PeriodoGracia", "NombrePersona", "inicioVigencia", "finVigencia"]
    };

    useEffect(() => {
        const fields = stepFields[currentStep];

        const validateStep = async () => {
            const isValid = await form.trigger(fields);
            setIsStepValid(isValid);
        };

        validateStep();

        const subscription = form.watch(async () => {
            const isValid = await form.trigger(fields);
            setIsStepValid(isValid);
        });

        return () => subscription.unsubscribe();
    }, [currentStep, form]);


    const nextStep = async () => {
        const fields = stepFields[currentStep];
        const isValid = await form.trigger(fields);

        if (isValid) {
            setIsStepValid(false);
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = async () => {
        const previousStep = Math.max(currentStep - 1, 1);
        const fields = stepFields[previousStep];

        const isValid = await form.trigger(fields);
        setIsStepValid(isValid);

        setCurrentStep(previousStep);
    };


    const onSubmit = async (data: z.infer<typeof nuevaCotizacionSchema>) => {
        console.log(data);
        try {
            console.log("Datos de la cotización a enviar:", data);
        } catch (error) {
            console.error("Error al enviar la cotización:", error);
        }
    };

    return (
        <>
            {error ? (
                <div>Ha ocurrido un error.</div>
            ) : (
                <div className="bg-white p-6 shadow-md max-w-7xl">
                    <StepIndicator steps={steps} currentStep={currentStep} />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <VehicleUseSelector
                                        usosVehiculo={usosVehiculo}
                                        selectedUse={form.watch("UsoVehiculo")}
                                        setSelectedUse={(use) => form.setValue("UsoVehiculo", use)}
                                        setSelectedType={(type) => form.setValue("TipoVehiculo", type)}
                                    />
                                    {form.watch("UsoVehiculo") !== 0 && (
                                        <VehicleTypeSelector
                                            selectedUse={form.watch("UsoVehiculo")}
                                            selectedType={form.watch("TipoVehiculo")}
                                            setSelectedType={(type) => {
                                                console.log(type)
                                                form.setValue("TipoVehiculo", type);
                                            }}
                                            tiposVehiculo={tiposVehiculo}
                                        />
                                    )}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <VehicleDataForm
                                    form={form}
                                    years={years}
                                    brands={brands}
                                    models={models}
                                    versions={versions}
                                    price={price}
                                    isLoading={isLoading}
                                    autocompleteSuggestions={autocompleteSuggestions}
                                    handleYearSelect={handleYearSelect}
                                    handleBrandSelect={handleBrandSelect}
                                    handleModelSelect={handleModelSelect}
                                    handleVersionSelect={handleVersionSelect}
                                    fetchAutocompleteSuggestions={fetchAutocompleteSuggestions}
                                    setAutocompleteSuggestions={setAutocompleteSuggestions}
                                    formatCurrency={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}
                                />
                            )}

                            {currentStep === 3 && price && (
                                <CotizacionDataForm
                                    form={form}
                                    updateFinVigencia={updateFinVigencia}
                                    formatDateLocal={formatDateLocal}
                                    tiposSumas={tiposSumas}
                                    price={price}
                                    setIsSumaAseguradaValid={setIsSumaAseguradaValid}
                                />
                            )}

                            {currentStep === 4 && (
                                <CoberturasForm
                                    form={form}
                                    paquetesCobertura={paquetesCobertura}
                                    coberturas={coberturas}
                                    asociaciones={asociaciones}
                                    reglasGlobales={reglasGlobales}
                                />
                            )}

                            <div className="flex gap-5 mt-8">
                                <Button onClick={prevStep} disabled={currentStep === 1}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Anterior
                                </Button>
                                {currentStep < steps.length ? (
                                    <Button onClick={nextStep} disabled={!isStepValid || !isSumaAseguradaValid}>
                                        Siguiente
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit">
                                        Enviar
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>
            )}
        </>
    );
}
