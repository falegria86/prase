import { useCallback, useState } from "react";
import { motion } from "framer-motion";
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
import { PlanPago } from "./PlanPago";

const VALOR_UMA = Number(process.env.VALOR_UMA) || 0;

type TipoCalculo = "fijo" | "cobertura";

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
    sumaAseguradaPorPasajero: boolean;
    tipoDeducible: {
        TipoDeducibleID: number;
        Nombre: string;
    };
    tipoMoneda: {
        TipoMonedaID: number;
        Nombre: string;
        Abreviacion: string;
    };
    Obligatoria?: boolean;
    deducibleSeleccionado?: number;
    sumaAseguradaPersonalizada?: number;
}

export const CoverageStep = ({
    form,
    paquetesCobertura,
    coberturas,
    asociaciones,
    tiposPagos,
    setIsStepValid,
}: StepProps) => {
    const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo | null>(null);
    const [coberturasSeleccionadas, setCoberturasSeleccionadas] = useState<CoberturaExtendida[]>([]);
    const [montoFijo, setMontoFijo] = useState("");

    const obtenerSumaAsegurada = useCallback((cobertura: CoberturaExtendida): number => {
        if (cobertura.CoberturaAmparada) return 0;

        if (cobertura.AplicaSumaAsegurada) {
            return cobertura.sumaAseguradaPersonalizada || form.getValues("SumaAsegurada");
        }

        if (cobertura.tipoMoneda.Abreviacion === "UMA") {
            return parseFloat(cobertura.SumaAseguradaMax) * VALOR_UMA;
        }

        return parseFloat(cobertura.SumaAseguradaMax);
    }, [form]);

    const obtenerDeducible = useCallback((cobertura: CoberturaExtendida): number => {
        if (cobertura.CoberturaAmparada) return 0;

        if (cobertura.tipoDeducible.Nombre === "UMA") {
            return parseFloat(cobertura.DeducibleMax) * VALOR_UMA;
        }

        return cobertura.deducibleSeleccionado || parseFloat(cobertura.DeducibleMin);
    }, []);

    const calcularPrima = useCallback((cobertura: CoberturaExtendida, tipo: TipoCalculo): number => {
        if (tipo === "fijo" || cobertura.SinValor || cobertura.CoberturaAmparada) return 0;

        const sumaAsegurada = obtenerSumaAsegurada(cobertura);
        const deducible = obtenerDeducible(cobertura);

        // Prima base fija sin deducible
        if (cobertura.PrimaBase && cobertura.DeducibleMin === "0") {
            return parseFloat(cobertura.PrimaBase);
        }

        const primaPorcentaje = parseFloat(cobertura.PorcentajePrima) / 100;
        const primaBase = sumaAsegurada * primaPorcentaje;

        // Sin deducible o cobertura amparada
        if (cobertura.DeducibleMin === "0" || cobertura.CoberturaAmparada) {
            return primaBase;
        }

        // Deducible en UMAs
        if (cobertura.tipoDeducible.Nombre === "UMA") {
            const deduciblePesos = deducible * VALOR_UMA;
            return Math.max(0, primaBase - deduciblePesos);
        }

        // Deducible en porcentaje
        return primaBase * (1 - deducible / 100);
    }, [obtenerSumaAsegurada, obtenerDeducible]);

    const actualizarDetalles = useCallback((coberturas: CoberturaExtendida[]) => {
        const detalles = coberturas.map(cobertura => ({
            CoberturaID: cobertura.CoberturaID,
            NombreCobertura: cobertura.NombreCobertura,
            Descripcion: cobertura.Descripcion,
            MontoSumaAsegurada: obtenerSumaAsegurada(cobertura),
            DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
            MontoDeducible: obtenerDeducible(cobertura),
            PrimaCalculada: calcularPrima(cobertura, tipoCalculo || "cobertura"),
            PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
            ValorAseguradoUsado: obtenerSumaAsegurada(cobertura),
            Obligatoria: cobertura.Obligatoria || false,
            DisplaySumaAsegurada: cobertura.CoberturaAmparada ? "AMPARADA" :
                cobertura.tipoMoneda.Abreviacion === "UMA" ?
                    `${cobertura.SumaAseguradaMax} UMAS` : undefined,
            DisplayDeducible: cobertura.CoberturaAmparada ? "NO APLICA" :
                cobertura.tipoDeducible.Nombre === "UMA" ?
                    `${cobertura.DeducibleMax} UMAS` : undefined,
            TipoMoneda: cobertura.tipoMoneda.Abreviacion,
            EsAmparada: cobertura.CoberturaAmparada,
            SumaAseguradaPorPasajero: cobertura.sumaAseguradaPorPasajero,
        }));

        form.setValue("detalles", detalles, { shouldValidate: true });
    }, [form, obtenerSumaAsegurada, obtenerDeducible, calcularPrima, tipoCalculo]);

    const manejarCambioTipoCalculo = useCallback((valor: string) => {
        setTipoCalculo(valor as TipoCalculo);
        form.setValue("PaqueteCoberturaID", 0);
        setCoberturasSeleccionadas([]);
        setMontoFijo("");
        setIsStepValid?.(false);
    }, [form, setIsStepValid]);

    const manejarSeleccionPaquete = useCallback((valor: string) => {
        if (valor === "none") {
            form.setValue("PaqueteCoberturaID", 0);
            form.setValue("detalles", []);
            form.setValue("PrimaTotal", 0);
            setCoberturasSeleccionadas([]);
            setMontoFijo("");
            setIsStepValid?.(false);
            return;
        }

        const paqueteId = parseInt(valor);
        form.setValue("PaqueteCoberturaID", paqueteId);

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
        actualizarDetalles(coberturasDelPaquete);

        if (tipoCalculo === "fijo" && paqueteSeleccionado?.PrecioTotalFijo) {
            setMontoFijo(paqueteSeleccionado.PrecioTotalFijo);
            form.setValue("PrimaTotal", parseFloat(paqueteSeleccionado.PrecioTotalFijo));
        } else {
            const primaTotal = coberturasDelPaquete.reduce((total, cobertura) =>
                total + calcularPrima(cobertura, tipoCalculo || "cobertura"), 0);
            form.setValue("PrimaTotal", primaTotal);
        }

        setIsStepValid?.(true);
    }, [form, paquetesCobertura, asociaciones, coberturas, tipoCalculo, actualizarDetalles, calcularPrima, setIsStepValid]);

    const manejarCambioMontoFijo = useCallback((valor: string) => {
        const numeroLimpio = valor.replace(/[^0-9.]/g, '');
        setMontoFijo(numeroLimpio);
        form.setValue("PrimaTotal", parseFloat(numeroLimpio) || 0);
    }, [form]);

    const manejarCambioDeducible = useCallback((coberturaId: number, valor: string) => {
        const nuevasCoberturas = coberturasSeleccionadas.map(cobertura =>
            cobertura.CoberturaID === coberturaId
                ? { ...cobertura, deducibleSeleccionado: parseInt(valor) }
                : cobertura
        );

        setCoberturasSeleccionadas(nuevasCoberturas);
        actualizarDetalles(nuevasCoberturas);

        const primaTotal = nuevasCoberturas.reduce((total, cobertura) =>
            total + calcularPrima(cobertura, tipoCalculo || "cobertura"), 0);
        form.setValue("PrimaTotal", primaTotal);
    }, [tipoCalculo, coberturasSeleccionadas, actualizarDetalles, calcularPrima, form]);

    const manejarEliminarCobertura = useCallback((coberturaId: number) => {
        const nuevasCoberturas = coberturasSeleccionadas.filter(
            cobertura => cobertura.CoberturaID !== coberturaId
        );

        setCoberturasSeleccionadas(nuevasCoberturas);
        actualizarDetalles(nuevasCoberturas);

        if (tipoCalculo === "cobertura") {
            const primaTotal = nuevasCoberturas.reduce((total, cobertura) =>
                total + calcularPrima(cobertura, tipoCalculo), 0);
            form.setValue("PrimaTotal", primaTotal);
        }
    }, [coberturasSeleccionadas, actualizarDetalles, tipoCalculo, calcularPrima, form]);

    const manejarCambioSumaAsegurada = useCallback((coberturaId: number, nuevoValor: string) => {
        const valorNumerico = parseFloat(nuevoValor);

        const nuevasCoberturas = coberturasSeleccionadas.map(cobertura => {
            if (cobertura.CoberturaID === coberturaId) {
                const coberturaActualizada = {
                    ...cobertura,
                    sumaAseguradaPersonalizada: valorNumerico
                };

                return coberturaActualizada;
            }
            return cobertura;
        });

        setCoberturasSeleccionadas(nuevasCoberturas);

        // Actualizar detalles con las nuevas primas calculadas
        const detallesActualizados = nuevasCoberturas.map(cobertura => ({
            CoberturaID: cobertura.CoberturaID,
            NombreCobertura: cobertura.NombreCobertura,
            Descripcion: cobertura.Descripcion,
            MontoSumaAsegurada: obtenerSumaAsegurada(cobertura),
            DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
            MontoDeducible: obtenerDeducible(cobertura),
            PrimaCalculada: calcularPrima(cobertura, "cobertura"),
            PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
            ValorAseguradoUsado: obtenerSumaAsegurada(cobertura),
            Obligatoria: cobertura.Obligatoria || false
        }));

        form.setValue("detalles", detallesActualizados);

        // Actualizar prima total
        const nuevaPrimaTotal = detallesActualizados.reduce(
            (total, detalle) => total + detalle.PrimaCalculada,
            0
        );
        form.setValue("PrimaTotal", nuevaPrimaTotal);

    }, [coberturasSeleccionadas, obtenerSumaAsegurada, obtenerDeducible, calcularPrima, form]);

    const generarRangosSumaAsegurada = useCallback((sumaBase: number): number[] => {
        const rangos: number[] = [];
        const esMayorA500k = sumaBase > 500000;
        const incremento = esMayorA500k ? 100000 : 10000;
        const limiteInferior = Math.floor(sumaBase * 0.5);
        const limiteSuperior = sumaBase;

        for (let valor = limiteInferior; valor <= limiteSuperior; valor += incremento) {
            rangos.push(valor);
        }

        if (!rangos.includes(sumaBase)) {
            rangos.push(sumaBase);
            rangos.sort((a, b) => a - b);
        }

        return rangos;
    }, []);

    const renderizarValorCobertura = useCallback((cobertura: CoberturaExtendida): React.ReactNode => {
        const sumaAseguradaAnterior = form.getValues('SumaAsegurada');

        // Si la cobertura aplica suma asegurada, mostrar el select
        if (cobertura.AplicaSumaAsegurada) {
            const rangos = generarRangosSumaAsegurada(sumaAseguradaAnterior);
            const valorActual = cobertura.sumaAseguradaPersonalizada || sumaAseguradaAnterior;

            return (
                <Select
                    value={valorActual.toString()}
                    onValueChange={(valor) => manejarCambioSumaAsegurada(cobertura.CoberturaID, valor)}
                    disabled
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue>
                            {formatCurrency(parseFloat(valorActual.toString()))}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {rangos.map((valor) => (
                            <SelectItem key={valor} value={valor.toString()}>
                                {formatCurrency(valor)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        // Si es cobertura amparada
        if (cobertura.CoberturaAmparada) {
            return "AMPARADA";
        }

        // Si es por pasajero
        if (cobertura.sumaAseguradaPorPasajero) {
            let montoTexto;
            if (cobertura.tipoMoneda.Abreviacion === "UMA") {
                montoTexto = `${cobertura.SumaAseguradaMax} UMAS`;
            } else if (Number(cobertura.SumaAseguradaMin) <= 1 && Number(cobertura.SumaAseguradaMax) <= 1) {
                montoTexto = formatCurrency(sumaAseguradaAnterior);
            } else {
                montoTexto = formatCurrency(Number(cobertura.SumaAseguradaMax));
            }

            return (
                <div className="flex flex-col gap-1">
                    <span>{montoTexto}</span>
                    <span className="text-sm text-muted-foreground">POR CADA PASAJERO</span>
                </div>
            );
        }

        // Para montos en UMA
        if (cobertura.tipoMoneda.Abreviacion === "UMA") {
            return `${cobertura.SumaAseguradaMax} UMAS`;
        }

        // Para montos en pesos
        return formatCurrency(parseFloat(cobertura.SumaAseguradaMax));
    }, [form, generarRangosSumaAsegurada, manejarCambioSumaAsegurada]);

    const generarRangoDeducibles = useCallback((cobertura: CoberturaExtendida): number[] => {
        const min = parseInt(cobertura.DeducibleMin) || 0;
        const max = parseInt(cobertura.DeducibleMax) || 0;
        const rango = parseInt(cobertura.RangoSeleccion) || 1;

        if (rango === 0 || min === max || min > max) {
            return [min, max].filter((val, index, arr) =>
                arr.indexOf(val) === index && val !== 0
            );
        }

        const deducibles: number[] = [];
        const iteraciones = Math.floor((max - min) / rango) + 1;

        for (let i = 0; i < Math.min(iteraciones, 100); i++) {
            const valor = min + (i * rango);
            if (valor <= max) deducibles.push(valor);
        }

        if (deducibles[deducibles.length - 1] !== max) {
            deducibles.push(max);
        }

        return deducibles;
    }, []);

    const renderizarSelectorDeducible = useCallback((cobertura: CoberturaExtendida) => {
        if (cobertura.CoberturaAmparada) return "NO APLICA";
        if (cobertura.tipoDeducible.Nombre === "UMA") return `${cobertura.DeducibleMax} UMAS`;

        const deducibles = generarRangoDeducibles(cobertura);

        return (
            <>
                {deducibles.length > 0 ? (
                    <Select
                        value={cobertura.deducibleSeleccionado?.toString() || cobertura.DeducibleMin}
                        onValueChange={(valor) => manejarCambioDeducible(cobertura.CoberturaID, valor)}
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
                ) : (
                    <div>
                        NO APLICA
                    </div>
                )}
            </>
        );
    }, [tipoCalculo, generarRangoDeducibles, manejarCambioDeducible]);

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
                            onValueChange={manejarCambioTipoCalculo}
                            value={tipoCalculo || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo de cálculo" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="fijo">Monto Fijo</SelectItem>
                                <SelectItem value="cobertura">Cálculo por Coberturas</SelectItem>
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
                                    onValueChange={manejarSeleccionPaquete}
                                    value={field.value ? field.value.toString() : "none"}
                                    disabled={!tipoCalculo}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un paquete" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Ninguno</SelectItem>
                                        {paquetesCobertura?.map((paquete) => (
                                            <SelectItem
                                                key={paquete.PaqueteCoberturaID}
                                                value={paquete.PaqueteCoberturaID.toString()}
                                            >
                                                {paquete.NombrePaquete}
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
                                onChange={(e) => manejarCambioMontoFijo(e.target.value)}
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
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
                                                                <div className="flex items-center gap-2 cursor-help">
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
                                                {renderizarValorCobertura(cobertura)}
                                            </TableCell>
                                            <TableCell>
                                                {renderizarSelectorDeducible(cobertura)}
                                            </TableCell>
                                            {tipoCalculo === "cobertura" && (
                                                <TableCell className="font-medium">
                                                    {formatCurrency(calcularPrima(cobertura, "cobertura"))}
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
                            {/*  <div className="mt-6">
                                <div className="flex justify-end gap-4 items-center font-medium">
                                    <span>Costo Neto:</span>
                                    <span className="text-lg text-primary">
                                        {tipoCalculo === "fijo"
                                            ? formatCurrency(parseFloat(montoFijo) || 0)
                                            : formatCurrency(
                                                coberturasSeleccionadas.reduce(
                                                    (total, cobertura) => total + calcularPrima(cobertura, "cobertura"),
                                                    0
                                                )
                                            )}
                                    </span>
                                </div>
                            </div> */}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {(coberturasSeleccionadas.length > 0 && tiposPagos && tiposPagos.length > 0) && (
                <PlanPago
                    form={form}
                    tiposPagos={tiposPagos}
                    costoBase={
                        tipoCalculo === "fijo"
                            ? parseFloat(montoFijo) || 0
                            : coberturasSeleccionadas.reduce(
                                (total, cobertura) => total + calcularPrima(cobertura, "cobertura"),
                                0
                            )
                    }
                />
            )}
        </div>
    );
};

export default CoverageStep;