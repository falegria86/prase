import { useEffect, useState } from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { iGetTiposSumasAseguradas } from "@/interfaces/CatTiposSumasInterface";
import { formatDateLocal } from "@/lib/format-date";
import { iGetPrecioVersionPorClave } from "@/interfaces/LibroAzul";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";

interface CotizacionDataFormProps {
    form: UseFormReturn<z.infer<typeof nuevaCotizacionSchema>>;
    updateFinVigencia: () => void;
    formatDateLocal: (date: Date) => string;
    tiposSumas: iGetTiposSumasAseguradas[];
    price: iGetPrecioVersionPorClave;
    setIsSumaAseguradaValid: (isValid: boolean) => void;
}

export default function CotizacionDataForm({
    form,
    tiposSumas,
    price,
    updateFinVigencia,
    setIsSumaAseguradaValid
}: CotizacionDataFormProps) {
    const [sumaAsegurada, setSumaAsegurada] = useState({
        min: -1,
        max: -1,
    });

    const [mensajeSuma, setMensajeSuma] = useState<string | null>(null);
    const [isSumaAseguradaDisabled, setIsSumaAseguradaDisabled] = useState<boolean>(true);

    const handleSumaAsegurada = (tipoID: number) => {
        const tipo = tiposSumas.find(tipo => tipo.TipoSumaAseguradaID === tipoID)?.NombreTipo;
        let minimo = 0;
        let maximo = 0;
        let mensaje: string | null = "Valor libre";
        let disableSumaAsegurada = false;

        if (tipo?.toLowerCase().includes("convenido")) {
            minimo = price.Venta * 0.985;
            maximo = price.Venta * 1.015;
            mensaje = `$${minimo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - $${maximo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            disableSumaAsegurada = false;
        } else if (tipo?.toLowerCase().includes("comercial")) {
            form.setValue('SumaAsegurada', price.Compra);
            mensaje = null;
            disableSumaAsegurada = true;
        }

        setSumaAsegurada({ min: minimo, max: maximo });
        setMensajeSuma(mensaje);
        setIsSumaAseguradaDisabled(disableSumaAsegurada);

        if (tipo?.toLowerCase().includes("convenido")) {
            setIsSumaAseguradaValid(false);
        } else {
            setIsSumaAseguradaValid(true);
        }
    };

    useEffect(() => {
        const { SumaAsegurada } = form.getValues();

        if (!isSumaAseguradaDisabled && sumaAsegurada.min >= 0 && sumaAsegurada.max > 0) {
            const isValid = SumaAsegurada >= sumaAsegurada.min && SumaAsegurada <= sumaAsegurada.max;
            setIsSumaAseguradaValid(isValid);
        }
    }, [form.watch("SumaAsegurada"), sumaAsegurada.min, sumaAsegurada.max, isSumaAseguradaDisabled]);


    return (
        <div className="grid grid-cols-2 gap-5">
            {/* Derecho de Póliza */}
            <FormField control={form.control} name="DerechoPoliza" render={({ field }) => (
                <FormItem>
                    <FormLabel>Derecho de póliza</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" placeholder="Derecho de póliza" readOnly />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            {/* Vigencia */}
            <FormField control={form.control} name="vigencia" render={({ field }) => (
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
            )} />

            {form.watch("vigencia") === "Por meses" && (
                <FormField control={form.control} name="meses" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Meses</FormLabel>
                        <FormControl>
                            <Input {...field} type="number" placeholder="Meses" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            )}

            {/* Inicio de Vigencia */}
            <FormField control={form.control} name="inicioVigencia" render={({ field }) => (
                <FormItem>
                    <FormLabel>Inicio de vigencia</FormLabel>
                    <FormControl>
                        <Input {...field} type="date" value={field.value} onChange={(e) => {
                            field.onChange(e.target.value);
                            updateFinVigencia();
                        }} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormItem>
                <FormLabel>Fin de vigencia</FormLabel>
                <FormControl>
                    <Input value={formatDateLocal(new Date(form.watch("finVigencia")))} disabled />
                </FormControl>
            </FormItem>

            {/* Tipo de Suma Asegurada */}
            <FormField control={form.control} name="TipoSumaAseguradaID" render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de suma asegurada</FormLabel>
                    <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleSumaAsegurada(Number(value));
                    }} defaultValue={field.value ? field.value.toString() : undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo de suma..." />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposSumas.map(tipo => (
                                <SelectItem key={tipo.TipoSumaAseguradaID} value={tipo.TipoSumaAseguradaID.toString()}>{tipo.NombreTipo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            {/* Suma Asegurada */}
            <FormField control={form.control} name="SumaAsegurada" render={({ field }) => (
                <FormItem>
                    <FormLabel>Suma asegurada</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" placeholder="Suma asegurada" disabled={isSumaAseguradaDisabled} />
                    </FormControl>
                    {mensajeSuma && <div className="text-sm text-gray-500">{mensajeSuma}</div>}
                    <FormMessage />
                </FormItem>
            )} />

            {/* Período de Gracia */}
            <FormField control={form.control} name="PeriodoGracia" render={({ field }) => (
                <FormItem>
                    <FormLabel>Período de gracia</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value ? field.value.toString() : undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona período" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 3).map(dia => (
                                <SelectItem key={dia} value={dia.toString()}>{dia} días</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            {/* Nombre de la Persona Asegurada */}
            <FormField control={form.control} name="NombrePersona" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre del asegurado (opcional)</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="Nombre del asegurado (opcional)" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    );
}
