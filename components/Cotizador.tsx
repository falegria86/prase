'use client'

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import StepIndicator from './StepIndicator';
import VehicleUseSelector from './VehicleUseSelector';
import VehicleTypeSelector from './VehicleTypeSelector';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from "@/components/ui/select";
import { nuevaCotizacionSchema } from '@/schemas/cotizadorSchema';
import { formatDateLocal } from '@/lib/format-date';
import {
    getAnios,
    getMarcasPorAnio,
    getModelosPorAnioMarca,
    getVersionesPorAnioMarcaModelo,
    getPrecioVersionPorClave,
    loginAuto
} from "@/actions/LibroAzul";
import { getAniosSchema, getMarcasPorAnioSchema, getModelosPorAnioMarcaSchema, getPrecioVersionPorClaveSchema, getVersionesPorAnioMarcaModeloSchema } from "@/schemas/libroAzulSchema"
import {
    iGetAnios,
    iGetMarcasPorAnio,
    iGetModelosPorAnioMarca,
    iGetPrecioVersionPorClave,
    iGetVersionesPorAnioMarcaModelo
} from "@/interfaces/LibroAzul";



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
]

export default function Cotizador() {
    useEffect(() => {
        if (apiKey) return;
        handleLogin();
    }, []);

    const handleLogin = async () => {
        try {
            const key = await loginAuto();

            console.log('Llave obtenida: ', key);

            if (key) {
                setApiKey(key);
                await loadYears(key);
            } else {
                setError('No se pudo obtener la llave');
            }

        } catch (error) {
            console.log('Error al obtener la llave: ', error);
        }
    }

    const [ currentStep, setCurrentStep ] = useState<number>(1);
    const [ apiKey, setApiKey ] = useState<string | null>(null);
    const [ years, setYears ] = useState<iGetAnios[]>([])
    const [ brands, setBrands ] = useState<iGetMarcasPorAnio[]>([])
    const [ models, setModels ] = useState<iGetModelosPorAnioMarca[]>([])
    const [ versions, setVersions ] = useState<iGetVersionesPorAnioMarcaModelo[]>([])
    const [ selectedYear, setSelectedYear ] = useState<iGetAnios | null>(null)
    const [ selectedBrand, setSelectedBrand ] = useState<iGetMarcasPorAnio | null>(null)
    const [ selectedModel, setSelectedModel ] = useState<iGetModelosPorAnioMarca | null>(null)
    const [ selectedVersion, setSelectedVersion ] = useState<iGetVersionesPorAnioMarcaModelo | null>(null)
    const [ price, setPrice ] = useState<iGetPrecioVersionPorClave | null>(null)

    const [ error, setError ] = useState<string | null>(null);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);

    console.log("🚀 ~ render ~ error", error)

    const form = useForm<z.infer<typeof nuevaCotizacionSchema>>({
        resolver: zodResolver(nuevaCotizacionSchema),
        defaultValues: {
            anio: 0,
            marca: "",
            uso: "",
            tipoVehiculo: "",
            tipo: "",
            version: "",
            amis: 0,
            unidadSalvamento: "",
            serie: "",
            ubicacion: "",
            derechoPoliza: "$600",
            vigencia: "Anual",
            meses: 12,
            inicioVigencia: new Date().toISOString().split("T")[ 0 ], // Formato 'yyyy-MM-dd'
            finVigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[ 0 ],
            tipoSumaAsegurada: "Valor convenido",
            sumaAsegurada: 89000,
            periodoGracia: "14 días",
            moneda: "Pesos",
            nombreAsegurado: ""
        }
    });

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const updateFinVigencia = () => {
        const inicioVigencia = form.getValues("inicioVigencia");
        const meses = Number(form.getValues("meses"));

        const fechaInicio = new Date(inicioVigencia);

        if (!isNaN(fechaInicio.getTime())) {
            // Sumar los meses a la fecha de inicio
            fechaInicio.setMonth(fechaInicio.getMonth() + meses);

            // Formatear la fecha de fin nuevamente a 'yyyy-MM-dd'
            form.setValue("finVigencia", fechaInicio.toISOString().split("T")[ 0 ]);
        } else {
            console.error("Error al parsear la fecha de inicio.");
        }
    };



    useEffect(() => {
        // Actualizar la fecha de fin cada vez que se cambia el inicio o los meses
        updateFinVigencia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ form.watch("inicioVigencia"), form.watch("meses") ]);

    const onSubmit = (data: z.infer<typeof nuevaCotizacionSchema>) => {
        console.log(data);
    };

    // const years = generateYears();

    const loadYears = async (key: string) => {
        setIsLoading(true)
        setError(null)

        console.log("🚀 ~ loadYears ~ key", key)

        try {
            const yearsData = await getAnios(key)

            if (yearsData) {
                const validatedYears = getAniosSchema.parse(yearsData)
                setYears(validatedYears)

                console.log("🚀 ~ loadYears ~ validatedYears", validatedYears)
            } else {
                setError('No se pudieron cargar los años')
            }
        } catch (error) {
            setError('Error al cargar los años')
            setApiKey(null)
        } finally {
            setIsLoading(false)
        }
    }

    const handleYearSelect = async (yearClave: string) => {

        console.log("🚀 ~ handleYearSelect ~ yearClave", yearClave)

        //limpiar los datos de los pasos siguientes
        setBrands([])
        setModels([])
        setVersions([])
        setSelectedBrand(null)
        setSelectedModel(null)
        setSelectedVersion(null)
        setPrice(null)


        if (!apiKey) return
        const year = years.find(y => y.Clave === yearClave)

        if (!year) return
        setSelectedYear(year)
        setIsLoading(true)
        setError(null)

        //let apiKeyFake = "MTc4IzI4MTEwOC8zMTc2"

        try {
            const brandsData = await getMarcasPorAnio(apiKey, year)
            console.log("🚀 ~ handleYearSelect ~ brandsData:", brandsData)



            if (brandsData) {
                const validatedBrands = getMarcasPorAnioSchema.parse(brandsData)
                setBrands(validatedBrands)
            } else {

                setError('No se pudieron cargar las marcas :(')
            }
        } catch (error) {
            setError('Error al cargar las marcas')
        } finally {
            setIsLoading(false)
        }
    }


    const handleBrandSelect = async (brandClave: string) => {
        console.log("🚀 ~ handleBrandSelect ~ brandClave", brandClave)

        //limpiar los datos de los pasos siguientes
        setModels([])
        setVersions([])
        setSelectedModel(null)
        setSelectedVersion(null)
        setPrice(null)


        if (!apiKey || !selectedYear) return
        const brand = brands.find(b => b.Clave === brandClave)
        if (!brand) return
        setSelectedBrand(brand)
        setIsLoading(true)
        setError(null)
        try {
            const modelsData = await getModelosPorAnioMarca(apiKey, selectedYear, brand)
            console.log("🚀 ~ handleBrandSelect ~ modelsData", modelsData)

            if (modelsData) {
                const validatedModels = getModelosPorAnioMarcaSchema.parse(modelsData)
                setModels(validatedModels)

            } else {
                setError('No se pudieron cargar los modelos')
            }
        } catch (error) {
            setError('Error al cargar los modelos')
        } finally {
            setIsLoading(false)
        }
    }

    const handleModelSelect = async (modelClave: string) => {

        //limpiar los datos de los pasos siguientes
        setVersions([])
        setSelectedVersion(null)
        setPrice(null)


        if (!apiKey || !selectedYear || !selectedBrand) return
        const model = models.find(m => m.Clave === modelClave)
        if (!model) return
        setSelectedModel(model)
        setIsLoading(true)
        setError(null)
        try {
            const versionsData = await getVersionesPorAnioMarcaModelo(apiKey, selectedYear, selectedBrand, model)
            if (versionsData) {
                const validatedVersions = getVersionesPorAnioMarcaModeloSchema.parse(versionsData)
                setVersions(validatedVersions)
            } else {
                setError('No se pudieron cargar las versiones')
            }
        } catch (error) {
            setError('Error al cargar las versiones')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVersionSelect = async (versionClave: string) => {
        //limpiar los datos de los pasos siguientes
        setPrice(null)

        if (!apiKey) return
        const version = versions.find(v => v.Clave === versionClave)
        if (!version) return
        setSelectedVersion(version)
        setIsLoading(true)
        setError(null)
        try {
            const priceData = await getPrecioVersionPorClave(apiKey, version)
            console.log("🚀 ~ handleVersionSelect ~ priceData", priceData)
            if (priceData) {
                const validatedPrice = getPrecioVersionPorClaveSchema.parse(priceData)
                setPrice(validatedPrice)

                console.log(price)

            } else {
                setError('No se pudo obtener el precio')
            }
        } catch (error) {
            setError('Error al obtener el precio')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 shadow-md">
            <StepIndicator steps={steps} currentStep={currentStep} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <VehicleUseSelector
                                selectedUse={form.watch("uso")}
                                setSelectedUse={(use) => form.setValue("uso", use)}
                                setSelectedType={(type) => form.setValue("tipoVehiculo", type)}
                            />
                            {form.watch("uso") && (
                                <VehicleTypeSelector
                                    selectedUse={form.watch("uso")}
                                    selectedType={form.watch("tipoVehiculo")}
                                    setSelectedType={(type) => form.setValue("tipoVehiculo", type)}
                                />
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid grid-cols-3 gap-5">
                            <FormField
                                control={form.control}
                                name="anio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año</FormLabel>
                                        <Select
                                            /* onValueChange={field.onChange} */
                                            onValueChange={handleYearSelect}
                                            defaultValue={selectedYear ? selectedYear.Clave.toString() : undefined}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                {/* Asegúrate de que haya un único hijo en cada nivel */}
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona año..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year.Clave} value={year.Clave.toString()}>
                                                        {year.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <Select
                                            onValueChange={handleBrandSelect}
                                            defaultValue={selectedBrand ? selectedBrand.Clave.toString() : ""}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona marca..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.Clave} value={brand.Clave.toString()}>
                                                        {brand.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <Select
                                            onValueChange={handleModelSelect}
                                            defaultValue={selectedModel ? selectedModel.Clave.toString() : undefined}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona modelo..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {models.map((brand) => (
                                                    <SelectItem key={brand.Clave} value={brand.Clave.toString()}>
                                                        {brand.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="version"
                                render={({  }) => (
                                    <FormItem>
                                        <FormLabel>Versión</FormLabel>
                                        <Select
                                            onValueChange={handleVersionSelect}
                                            defaultValue={selectedVersion ? selectedVersion.Clave.toString() : undefined}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona versión..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {versions.map((brand) => (
                                                    <SelectItem key={brand.Clave} value={brand.Clave.toString()}>
                                                        {brand.Nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amis"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>AMIS</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="AMIS"

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unidadSalvamento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidad de salvamento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona unidad..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="si">Sí</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="serie"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de serie</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Número de serie (opcional)"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ubicacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ubicación</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Ubicación"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <FormItem>
                                    <FormLabel>Derecho de póliza</FormLabel>
                                    <FormControl>
                                        <Input value={form.watch("derechoPoliza")} disabled />
                                    </FormControl>
                                </FormItem>
                            </div>
                            <FormField
                                control={form.control}
                                name="vigencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vigencia</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona vigencia" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Anual">Anual</SelectItem>
                                                <SelectItem value="Por meses">Por meses</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch("vigencia") === "Por meses" && (
                                <FormField
                                    control={form.control}
                                    name="meses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meses</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" placeholder="Meses" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="inicioVigencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inicio de vigencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="date"
                                                value={field.value}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value); // Almacena el valor en formato 'yyyy-MM-dd'
                                                    updateFinVigencia(); // Actualiza el fin de vigencia cuando cambia el inicio
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Fin de vigencia</FormLabel>
                                <FormControl>
                                    <Input value={formatDateLocal(new Date(form.watch("finVigencia")))} disabled />
                                </FormControl>
                            </FormItem>
                            <FormField
                                control={form.control}
                                name="tipoSumaAsegurada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de suma asegurada</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona tipo de suma" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Valor convenido">Valor convenido</SelectItem>
                                                <SelectItem value="Valor comercial">Valor comercial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sumaAsegurada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Suma asegurada</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Suma asegurada" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="periodoGracia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período de gracia</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona período" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="14 días">14 días</SelectItem>
                                                <SelectItem value="30 días">30 días</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Moneda</FormLabel>
                                <FormControl>
                                    <Input value="Pesos" disabled />
                                </FormControl>
                            </FormItem>
                            <FormField
                                control={form.control}
                                name="nombreAsegurado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del asegurado (opcional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nombre del asegurado (opcional)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    <div className="flex gap-5 mt-8">
                        <Button onClick={prevStep} disabled={currentStep === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Anterior
                        </Button>
                        {currentStep < steps.length ? (
                            <Button
                                onClick={nextStep}
                                disabled={currentStep === 1 && (!form.watch("uso") || !form.watch("tipoVehiculo"))}
                            >
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
    )
}
