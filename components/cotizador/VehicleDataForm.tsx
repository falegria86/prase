import { useEffect, useState } from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from "@/components/ui/select";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { iGetAnios, iGetMarcasPorAnio, iGetModelosPorAnioMarca, iGetPrecioVersionPorClave, iGetVersionesPorAnioMarcaModelo } from "@/interfaces/LibroAzul";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import { Feature } from "@/interfaces/GeoApifyInterface";

interface VehicleDataFormProps {
    form: UseFormReturn<z.infer<typeof nuevaCotizacionSchema>>;
    years: iGetAnios[];
    brands: iGetMarcasPorAnio[];
    models: iGetModelosPorAnioMarca[];
    versions: iGetVersionesPorAnioMarcaModelo[];
    price: iGetPrecioVersionPorClave | null;
    isLoading: boolean;
    autocompleteSuggestions: Feature[];
    handleYearSelect: (yearClave: string) => void;
    handleBrandSelect: (brandClave: string) => void;
    handleModelSelect: (modelClave: string) => void;
    handleVersionSelect: (versionClave: string) => void;
    fetchAutocompleteSuggestions: (query: string) => void;
    setAutocompleteSuggestions: React.Dispatch<React.SetStateAction<Feature[]>>;
    formatCurrency: (value: number) => string;
}

export default function VehicleDataForm({
    form,
    years,
    brands,
    models,
    versions,
    price,
    isLoading,
    autocompleteSuggestions,
    handleYearSelect,
    handleBrandSelect,
    handleModelSelect,
    handleVersionSelect,
    fetchAutocompleteSuggestions,
    setAutocompleteSuggestions,
    formatCurrency
}: VehicleDataFormProps) {
    const [isBrandEnabled, setIsBrandEnabled] = useState(false);
    const [isModelEnabled, setIsModelEnabled] = useState(false);
    const [isVersionEnabled, setIsVersionEnabled] = useState(false);

    const selectedYear = form.watch("Modelo");
    const selectedBrand = form.watch("Marca");
    const selectedModel = form.watch("Submarca");

    useEffect(() => {
        setIsBrandEnabled(!!selectedYear);
        setIsModelEnabled(!!selectedBrand);
        setIsVersionEnabled(!!selectedModel);
    }, [selectedYear, selectedBrand, selectedModel]);

    return (
        <div className="grid grid-cols-3 gap-5">
            {/* Año (Modelo en el esquema) */}
            <FormField
                control={form.control}
                name="Modelo"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    handleYearSelect(value);
                                }}
                                defaultValue={field.value ? field.value.toString() : undefined}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona año..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year.Clave} value={year.Clave.toString()}>
                                            {year.Nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        {fieldState.isTouched && <FormMessage />}
                    </FormItem>
                )}
            />

            {/* Marca */}
            <FormField
                control={form.control}
                name="Marca"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    handleBrandSelect(value);
                                }}
                                defaultValue={field.value ? field.value.toString() : ""}
                                disabled={isLoading || !isBrandEnabled}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona marca..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.Clave} value={brand.Clave.toString()}>
                                            {brand.Nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        {fieldState.isTouched && <FormMessage />}
                    </FormItem>
                )}
            />

            {/* Submarca (Modelo en el UI) */}
            <FormField
                control={form.control}
                name="Submarca"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                handleModelSelect(value);
                            }}
                            defaultValue={field.value ? field.value.toString() : ""}
                            disabled={isLoading || !isModelEnabled}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona modelo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model) => (
                                    <SelectItem key={model.Clave} value={model.Clave.toString()}>
                                        {model.Nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldState.isTouched && <FormMessage />}
                    </FormItem>
                )}
            />

            {/* Versión */}
            <FormField
                control={form.control}
                name="Version"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Versión</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                handleVersionSelect(value);
                            }}
                            defaultValue={field.value ? field.value.toString() : ""}
                            disabled={isLoading || !isVersionEnabled}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona versión..." />
                            </SelectTrigger>
                            <SelectContent>
                                {versions.map((version) => (
                                    <SelectItem key={version.Clave} value={version.Clave.toString()}>
                                        {version.Nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldState.isTouched && <FormMessage />}
                        {price && (
                            <div className="mt-4 p-4 bg-green-100 rounded-lg shadow-md">
                                <h2 className="text-lg font-bold">Precio:</h2>
                                <p className="text-xl font-semibold text-green-800">
                                    Venta: {formatCurrency(price.Venta)}
                                </p>
                                <p className="text-xl font-semibold text-green-800">
                                    Compra: {formatCurrency(price.Compra)}
                                </p>
                            </div>
                        )}
                    </FormItem>
                )}
            />

            {/* Campo AMIS */}
            <FormField
                control={form.control}
                name="AMIS"
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

            {/* Unidad de Salvamento */}
            <FormField
                control={form.control}
                name="UnidadSalvamento"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unidad de salvamento</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "si")} defaultValue={field.value ? "si" : "no"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona unidad..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="si">Sí</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Número de Serie (VIN) */}
            <FormField
                control={form.control}
                name="VIN"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Número de serie (VIN)</FormLabel>
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

            {/* Ubicación (CP) con Autocompletado */}
            <FormField
                control={form.control}
                name="CP"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ubicación (CP)</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Código postal"
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    fetchAutocompleteSuggestions(e.target.value);
                                }}
                                value={field.value}
                            />
                        </FormControl>
                        <FormMessage />
                        {autocompleteSuggestions.length > 0 && (
                            <ul className="mt-2 bg-white border border-gray-300 rounded-md">
                                {autocompleteSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            form.setValue("CP", suggestion.properties.formatted);
                                            setAutocompleteSuggestions([]);
                                        }}
                                    >
                                        {suggestion.properties.formatted}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </FormItem>
                )}
            />
        </div>
    );
}
