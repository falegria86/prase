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

const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 70;
    const endYear = currentYear + 2;
    const years = [];

    for (let year = endYear; year >= startYear; year--) {
        years.push(year);
    }

    return years;
};

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
    const [currentStep, setCurrentStep] = useState<number>(1);

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
            inicioVigencia: new Date().toISOString().split("T")[0], // Formato 'yyyy-MM-dd'
            finVigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
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
            form.setValue("finVigencia", fechaInicio.toISOString().split("T")[0]);
        } else {
            console.error("Error al parsear la fecha de inicio.");
        }
    };



    useEffect(() => {
        // Actualizar la fecha de fin cada vez que se cambia el inicio o los meses
        updateFinVigencia();
    }, [form.watch("inicioVigencia"), form.watch("meses")]);

    const onSubmit = (data: z.infer<typeof nuevaCotizacionSchema>) => {
        console.log(data);
    };

    const years = generateYears();

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
                                            onValueChange={field.onChange}
                                            defaultValue={field.value ? field.value.toString() : undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona año..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
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
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Marca"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Tipo"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="version"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Versión</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Versión"
                                            />
                                        </FormControl>
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
