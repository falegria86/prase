"use client";

import { useState, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Info, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StepProps } from "@/types/cotizador";
import { formatCurrency } from "@/lib/format";

const VALOR_UMA = Number(process.env.VALOR_UMA) || 0;

interface TipoMoneda {
    TipoMonedaID: number;
    Nombre: string;
    Abreviacion: string;
}

interface TipoDeducible {
    TipoDeducibleID: number;
    Nombre: string;
}

interface CoberturaExtendida {
    CoberturaID: number;
    NombreCobertura: string;
    Descripcion: string;
    PrimaBase: string;
    SumaAseguradaMin: string;
    SumaAseguradaMax: string;
    DeducibleMin: string;
    DeducibleMax: string;
    PorcentajePrima: string;
    RangoSeleccion: string;
    EsCoberturaEspecial: boolean;
    Variable: boolean;
    SinValor: boolean;
    AplicaSumaAsegurada: boolean;
    CoberturaAmparada: boolean;
    IndiceSiniestralidad: null;
    sumaAseguradaPorPasajero: boolean;
    tipoDeducible: TipoDeducible;
    tipoMoneda: TipoMoneda;
    Obligatoria?: boolean;
    deducibleSeleccionado?: number;
}

type TipoCalculo = "fijo" | "cobertura";

const CoverageStep = ({
    form,
    paquetesCobertura,
    coberturas,
    asociaciones,
    setIsStepValid,
}: StepProps) => {
    const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo | null>(null);
    const [coberturasSeleccionadas, setCoberturasSeleccionadas] = useState<CoberturaExtendida[]>([]);
    const [montoFijo, setMontoFijo] = useState<string>("");

    const calcularPrimaCobertura = useCallback((cobertura: CoberturaExtendida, tipoCalc: TipoCalculo): number => {
        if (tipoCalc === "fijo" || cobertura.SinValor) return 0;

        // Caso 1: Prima base fija (sin deducible)
        if (cobertura.PrimaBase && cobertura.PrimaBase !== "1" && cobertura.DeducibleMin === "0") {
            return parseFloat(cobertura.PrimaBase);
        }

        // Obtener suma asegurada base para cálculos
        let sumaAsegurada = cobertura.AplicaSumaAsegurada ?
            form.getValues("SumaAsegurada") :
            parseFloat(cobertura.SumaAseguradaMax);

        const tasaBase = parseFloat(cobertura.PorcentajePrima) / 100;
        const costoInicial = sumaAsegurada * tasaBase;

        // Caso 4: Sin deducible ni prima base
        if (cobertura.DeducibleMin === "0" || cobertura.CoberturaAmparada) {
            return costoInicial;
        }

        // Caso 3: Deducible en UMAs
        if (cobertura.tipoDeducible.Nombre === "UMA") {
            const umasDeducible = parseFloat(cobertura.DeducibleMax);
            const deducibleEnPesos = umasDeducible * VALOR_UMA;
            return Math.max(0, costoInicial - deducibleEnPesos);
        }

        // Caso 2: Deducible en porcentaje
        const deducible = cobertura.deducibleSeleccionado || parseInt(cobertura.DeducibleMin);
        return costoInicial * (1 - deducible / 100);

    }, [form, VALOR_UMA]);

    const generarRangoDeducibles = useCallback((cobertura: CoberturaExtendida): number[] => {
        const min = parseInt(cobertura.DeducibleMin) || 0;
        const max = parseInt(cobertura.DeducibleMax) || 0;
        const rango = parseInt(cobertura.RangoSeleccion) || 1;

        // Si el rango es 0 o los valores son inválidos, retornar solo min y max
        if (rango === 0 || min === max || min > max) {
            return [min, max].filter((val, index, arr) =>
                arr.indexOf(val) === index && val !== 0
            );
        }

        const deducibles: number[] = [];
        const iteraciones = Math.floor((max - min) / rango) + 1;

        // Limitar número máximo de iteraciones para evitar arrays muy grandes
        for (let i = 0; i < Math.min(iteraciones, 100); i++) {
            const valor = min + (i * rango);
            if (valor <= max) {
                deducibles.push(valor);
            }
        }

        // Asegurar que el valor máximo esté incluido
        if (deducibles[deducibles.length - 1] !== max) {
            deducibles.push(max);
        }

        return deducibles;
    }, []);

    const actualizarDetallesForm = useCallback((coberturas: CoberturaExtendida[]) => {
        const detalles = coberturas.map(cobertura => {
            let montoSumaAsegurada = 0;
            if (cobertura.AplicaSumaAsegurada) {
                montoSumaAsegurada = form.getValues("SumaAsegurada");
            } else if (cobertura.tipoMoneda.Nombre === "UMA") {
                montoSumaAsegurada = parseFloat(cobertura.SumaAseguradaMax) * VALOR_UMA;
            } else {
                montoSumaAsegurada = parseFloat(cobertura.SumaAseguradaMax);
            }

            return {
                CoberturaID: cobertura.CoberturaID,
                NombreCobertura: cobertura.NombreCobertura,
                Descripcion: cobertura.Descripcion,
                MontoSumaAsegurada: montoSumaAsegurada,
                DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
                MontoDeducible: cobertura.deducibleSeleccionado || parseInt(cobertura.DeducibleMin),
                PrimaCalculada: calcularPrimaCobertura(cobertura, tipoCalculo || "cobertura"),
                PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
                ValorAseguradoUsado: montoSumaAsegurada,
                Obligatoria: cobertura.Obligatoria || false
            };
        });

        form.setValue("detalles", detalles, { shouldValidate: true });
    }, [form, calcularPrimaCobertura, tipoCalculo]);

    const manejarTipoCalculoChange = useCallback((valor: string) => {
        setTipoCalculo(valor as TipoCalculo);
        form.setValue("PaqueteCoberturaID", 0, { shouldValidate: true });
        setCoberturasSeleccionadas([]);
        setMontoFijo("");
        setIsStepValid?.(false);
    }, [form, setIsStepValid]);

    const manejarPaqueteSelect = useCallback((valor: string) => {
        if (valor === "none") {
            form.setValue("PaqueteCoberturaID", 0, { shouldValidate: true });
            form.setValue("detalles", [], { shouldValidate: true });
            form.setValue("PrimaTotal", 0);
            setCoberturasSeleccionadas([]);
            setMontoFijo("");
            setIsStepValid?.(false);
            return;
        }

        const paqueteId = parseInt(valor);
        form.setValue("PaqueteCoberturaID", paqueteId, { shouldValidate: true });

        const paqueteSeleccionado = paquetesCobertura?.find(
            p => p.PaqueteCoberturaID === paqueteId
        );

        const asociacionesPaquete = asociaciones?.filter(
            a => a.PaqueteCoberturaID === paqueteId
        ) ?? [];

        const coberturasDelPaquete = asociacionesPaquete.map(asociacion => {
            const cobertura = coberturas?.find(c => c.CoberturaID === asociacion.CoberturaID);
            if (!cobertura) return null;

            return {
                ...cobertura,
                Obligatoria: asociacion.Obligatoria,
                deducibleSeleccionado: parseInt(cobertura.DeducibleMin)
            } as CoberturaExtendida;
        }).filter((c): c is CoberturaExtendida => c !== null);

        setCoberturasSeleccionadas(coberturasDelPaquete);
        actualizarDetallesForm(coberturasDelPaquete);

        if (tipoCalculo === "fijo" && paqueteSeleccionado?.PrecioTotalFijo) {
            setMontoFijo(paqueteSeleccionado.PrecioTotalFijo);
            form.setValue("PrimaTotal", parseFloat(paqueteSeleccionado.PrecioTotalFijo));
        } else {
            const primaTotal = coberturasDelPaquete.reduce((total, cobertura) =>
                total + calcularPrimaCobertura(cobertura, tipoCalculo || "cobertura"), 0);
            form.setValue("PrimaTotal", primaTotal);
        }

        setIsStepValid?.(true);
    }, [form, paquetesCobertura, asociaciones, coberturas, tipoCalculo, actualizarDetallesForm, calcularPrimaCobertura, setIsStepValid]);

    const manejarMontoFijoChange = useCallback((valor: string) => {
        const numeroLimpio = valor.replace(/[^0-9.]/g, '');
        setMontoFijo(numeroLimpio);
        form.setValue("PrimaTotal", parseFloat(numeroLimpio) || 0);
    }, [form]);

    const manejarDeducibleChange = useCallback((coberturaId: number, valor: string) => {
        if (tipoCalculo === "fijo") return;

        const nuevasCoberturas = coberturasSeleccionadas.map(cobertura =>
            cobertura.CoberturaID === coberturaId ?
                { ...cobertura, deducibleSeleccionado: parseInt(valor) } :
                cobertura
        );

        setCoberturasSeleccionadas(nuevasCoberturas);
        actualizarDetallesForm(nuevasCoberturas);

        const primaTotal = nuevasCoberturas.reduce((total, cobertura) =>
            total + calcularPrimaCobertura(cobertura, tipoCalculo || "cobertura"), 0);
        form.setValue("PrimaTotal", primaTotal);
    }, [tipoCalculo, coberturasSeleccionadas, actualizarDetallesForm, calcularPrimaCobertura, form]);

    const manejarEliminarCobertura = useCallback((coberturaId: number) => {
        const nuevasCoberturas = coberturasSeleccionadas.filter(
            cobertura => cobertura.CoberturaID !== coberturaId
        );

        setCoberturasSeleccionadas(nuevasCoberturas);
        actualizarDetallesForm(nuevasCoberturas);

        if (tipoCalculo === "cobertura") {
            const primaTotal = nuevasCoberturas.reduce((total, cobertura) =>
                total + calcularPrimaCobertura(cobertura, tipoCalculo), 0);
            form.setValue("PrimaTotal", primaTotal);
        }
    }, [coberturasSeleccionadas, actualizarDetallesForm, tipoCalculo, calcularPrimaCobertura, form]);

    const renderValorCobertura = useCallback((cobertura: CoberturaExtendida) => {
        if (cobertura.CoberturaAmparada) {
            return "AMPARADA";
        }
        if (cobertura.AplicaSumaAsegurada) {
            return "VALOR COMERCIAL";
        }
        if (cobertura.tipoMoneda.Nombre === "UMA") {
            return `${cobertura.SumaAseguradaMax} UMAS`;
        }
        return formatCurrency(parseFloat(cobertura.SumaAseguradaMax));
    }, []);

    const renderDeducibleSelector = useCallback((cobertura: CoberturaExtendida) => {
        if (cobertura.CoberturaAmparada) {
            return "NO APLICA";
        }

        if (cobertura.tipoDeducible.Nombre === "UMA") {
            return `${cobertura.DeducibleMax} UMAS`;
        }

        const deducibles = generarRangoDeducibles(cobertura);

        return (
            <Select
                value={cobertura.deducibleSeleccionado?.toString() || cobertura.DeducibleMin}
                onValueChange={(valor) => manejarDeducibleChange(cobertura.CoberturaID, valor)}
                disabled={tipoCalculo === "fijo"}
            >
                <SelectTrigger className="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {deducibles.map((deducible) => (
                        <SelectItem key={deducible} value={deducible.toString()}>
                            {deducible}%
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }, [tipoCalculo, generarRangoDeducibles, manejarDeducibleChange]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Selección de Coberturas
                    </CardTitle>
                    <CardDescription>
                        Elige cómo quieres calcular las coberturas de tu seguro
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormItem>
                        <FormLabel>Tipo de Cálculo</FormLabel>
                        <Select
                            onValueChange={manejarTipoCalculoChange}
                            value={tipoCalculo || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo de cálculo" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="fijo">
                                    Monto Fijo
                                </SelectItem>
                                <SelectItem value="cobertura">
                                    Cálculo por Coberturas
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Elige cómo quieres que se calcule el costo de tu seguro
                        </FormDescription>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="PaqueteCoberturaID"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Paquete de Coberturas</FormLabel>
                                <Select
                                    onValueChange={manejarPaqueteSelect}
                                    value={field.value ? field.value.toString() : "none"}
                                    disabled={!tipoCalculo}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un paquete" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Ninguno
                                        </SelectItem>
                                        {paquetesCobertura?.map((paquete) => (
                                            <SelectItem
                                                key={paquete.PaqueteCoberturaID}
                                                value={paquete.PaqueteCoberturaID.toString()}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{paquete.NombrePaquete}</span>
                                                    {paquete.PrecioTotalFijo && tipoCalculo === "fijo" && (
                                                        <Badge variant="secondary">
                                                            Precio fijo: ${paquete.PrecioTotalFijo}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {tipoCalculo === "fijo"
                                        ? "Selecciona un paquete con precio fijo"
                                        : "Selecciona un paquete para calcular el costo por coberturas"
                                    }
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    {tipoCalculo === "fijo" && coberturasSeleccionadas.length > 0 && (
                        <FormItem>
                            <FormLabel>Monto Fijo del Paquete</FormLabel>
                            <Input
                                type="text"
                                value={montoFijo}
                                onChange={(e) => manejarMontoFijoChange(e.target.value)}
                                placeholder="Ingrese el monto fijo"
                            />
                            <FormDescription>
                                Este es el monto fijo para el paquete seleccionado
                            </FormDescription>
                        </FormItem>
                    )}
                </CardContent>
            </Card>

            {/* Tabla de Coberturas */}
            {coberturasSeleccionadas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detalle de Coberturas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cobertura</TableHead>
                                    <TableHead>Suma Asegurada</TableHead>
                                    <TableHead>Deducible</TableHead>
                                    {tipoCalculo === "cobertura" && <TableHead>Prima</TableHead>}
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coberturasSeleccionadas.map((cobertura) => (
                                    <TableRow key={cobertura.CoberturaID}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-2 cursor-help" onClick={(e) => e.preventDefault()}>
                                                                <span>{cobertura.NombreCobertura}</span>
                                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">{cobertura.Descripcion}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                {cobertura.Obligatoria && (
                                                    <Badge variant="outline">Obligatoria</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {renderValorCobertura(cobertura)}
                                        </TableCell>
                                        <TableCell>
                                            {renderDeducibleSelector(cobertura)}
                                        </TableCell>
                                        {tipoCalculo === "cobertura" && (
                                            <TableCell className="font-medium">
                                                {cobertura.SinValor ?
                                                    formatCurrency(0) :
                                                    formatCurrency(calcularPrimaCobertura(cobertura, "cobertura"))}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {!cobertura.Obligatoria && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => manejarEliminarCobertura(cobertura.CoberturaID)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Resumen de costos */}
                        <div className="mt-6">
                            <div className="flex justify-end gap-4 items-center font-medium">
                                <span>Costo Neto:</span>
                                <span className="text-lg text-primary">
                                    {tipoCalculo === "fijo"
                                        ? formatCurrency(parseFloat(montoFijo) || 0)
                                        : formatCurrency(coberturasSeleccionadas.reduce(
                                            (total, cobertura) => total + calcularPrimaCobertura(cobertura, "cobertura"),
                                            0
                                        ))
                                    }
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CoverageStep;