import { useState } from "react";
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

interface CoberturaProp {
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
    Obligatoria: boolean;
    deducibleSeleccionado?: number;
}

type TipoCalculo = "fixed" | "coverage";

const CoverageStep = ({
    form,
    paquetesCobertura,
    coberturas,
    asociaciones,
    setIsStepValid,
}: StepProps) => {
    const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo | null>(null);
    const [coberturasSeleccionadas, setCoberturasSeleccionadas] = useState<CoberturaProp[]>([]);
    const [montoFijo, setMontoFijo] = useState<string>("");

    const calcularDeducibleUMA = (cobertura: CoberturaProp): number => {
        if (cobertura.tipoDeducible.Nombre === "UMA") {
            const umasDeducible = parseFloat(cobertura.DeducibleMax);
            return umasDeducible * VALOR_UMA;
        }
        return 0;
    };

    const calcularPrimaCobertura = (cobertura: CoberturaProp): number => {
        if (tipoCalculo === "fixed") return 0;

        // Caso 1: Prima base fija
        if (cobertura.PrimaBase && cobertura.PrimaBase !== "1") {
            const primaBase = parseFloat(cobertura.PrimaBase);

            // Si no tiene deducible o está amparada, retornar prima base directamente
            if (cobertura.DeducibleMin === "0" || cobertura.CoberturaAmparada) {
                return primaBase;
            }

            // Si el deducible es en UMAs
            if (cobertura.tipoDeducible.Nombre === "UMA") {
                const deducibleEnPesos = calcularDeducibleUMA(cobertura);
                return Math.max(0, primaBase - deducibleEnPesos);
            }

            // Deducible normal en porcentaje
            const deducible = cobertura.deducibleSeleccionado || parseInt(cobertura.DeducibleMin);
            return primaBase * (1 - deducible / 100);
        }

        // Casos 2 y 3: Cálculo basado en suma asegurada
        let sumaAsegurada = 0;
        if (cobertura.AplicaSumaAsegurada) {
            sumaAsegurada = form.getValues("SumaAsegurada");
        } else {
            sumaAsegurada = parseFloat(cobertura.SumaAseguradaMax);
        }

        const tasaBase = parseFloat(cobertura.PorcentajePrima) / 100;
        const costoInicial = sumaAsegurada * tasaBase;

        // Si está amparada o no tiene deducible
        if (cobertura.CoberturaAmparada || cobertura.DeducibleMin === "0") {
            return costoInicial;
        }

        // Si el deducible es en UMAs
        if (cobertura.tipoDeducible.Nombre === "UMA") {
            const deducibleEnPesos = calcularDeducibleUMA(cobertura);
            return Math.max(0, costoInicial - deducibleEnPesos);
        }

        // Deducible normal en porcentaje
        const deducible = cobertura.deducibleSeleccionado || parseInt(cobertura.DeducibleMin);
        return costoInicial * (1 - deducible / 100);
    };

    const calcularCostoTotal = (coberturas: CoberturaProp[]): {
        costoNeto: number;
        gastosExpedicion: number;
        iva: number;
        total: number;
    } => {
        let costoNeto: number;

        if (tipoCalculo === "fixed") {
            costoNeto = parseFloat(montoFijo) || 0;
        } else {
            costoNeto = coberturas.reduce((sum, cobertura) => {
                const prima = calcularPrimaCobertura(cobertura);
                return sum + prima;
            }, 0);
        }

        const gastosExpedicion = form.getValues("DerechoPoliza");
        const subtotal = costoNeto + gastosExpedicion;
        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        return {
            costoNeto,
            gastosExpedicion,
            iva,
            total
        };
    };

    const generarRangoDeducibles = (cobertura: CoberturaProp): number[] => {
        const min = parseInt(cobertura.DeducibleMin);
        const max = parseInt(cobertura.DeducibleMax);
        const rango = parseInt(cobertura.RangoSeleccion);
        const deducibles: number[] = [];

        for (let i = min; i <= max; i += rango) {
            deducibles.push(i);
        }

        if (deducibles[deducibles.length - 1] !== max) {
            deducibles.push(max);
        }

        return deducibles;
    };

    const handleTipoCalculoChange = (value: string) => {
        setTipoCalculo(value as TipoCalculo);
        form.setValue("PaqueteCoberturaID", 0, { shouldValidate: true });
        setCoberturasSeleccionadas([]);
        setMontoFijo("");
        setIsStepValid?.(false);
    };

    const handlePaqueteSelect = (value: string) => {
        if (value === "none") {
            form.setValue("PaqueteCoberturaID", 0, { shouldValidate: true });
            setCoberturasSeleccionadas([]);
            setMontoFijo("");
            form.setValue("detalles", [], { shouldValidate: true });
            setIsStepValid?.(false);
            return;
        }

        const packageId = parseInt(value);
        form.setValue("PaqueteCoberturaID", packageId, { shouldValidate: true });

        const paqueteSeleccionado = paquetesCobertura?.find(
            p => p.PaqueteCoberturaID === packageId
        );

        const asociacionesPaquete = asociaciones?.filter(
            a => a.PaqueteCoberturaID === packageId
        ) ?? [];

        const coberturasDelPaquete = asociacionesPaquete.map(asociacion => {
            const cobertura = coberturas?.find(c => c.CoberturaID === asociacion.CoberturaID);
            if (!cobertura) return null;

            return {
                ...cobertura,
                Obligatoria: asociacion.Obligatoria,
                deducibleSeleccionado: parseInt(cobertura.DeducibleMin)
            } as CoberturaProp;
        }).filter((c): c is CoberturaProp => c !== null);

        setCoberturasSeleccionadas(coberturasDelPaquete);

        // Guardar detalles en el form
        const detallesCoberturas = coberturasDelPaquete.map(cobertura => {
            let montoSumaAsegurada = 0;
            if (cobertura.AplicaSumaAsegurada) {
                montoSumaAsegurada = form.getValues("SumaAsegurada");
            } else if (cobertura.tipoMoneda.Nombre === "UMA") {
                montoSumaAsegurada = parseFloat(cobertura.SumaAseguradaMax) * Number(process.env.VALOR_UMA || 0);
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
                PrimaCalculada: calcularPrimaCobertura(cobertura),
                PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
                ValorAseguradoUsado: montoSumaAsegurada,
                Obligatoria: cobertura.Obligatoria
            };
        });

        form.setValue("detalles", detallesCoberturas, { shouldValidate: true });

        if (tipoCalculo === "fixed" && paqueteSeleccionado?.PrecioTotalFijo) {
            setMontoFijo(paqueteSeleccionado.PrecioTotalFijo);
            form.setValue("PrimaTotal", parseFloat(paqueteSeleccionado.PrecioTotalFijo));
        } else {
            const costos = calcularCostoTotal(coberturasDelPaquete);
            form.setValue("PrimaTotal", costos.costoNeto);
        }

        setIsStepValid?.(true);
    };

    const handleMontoFijoChange = (valor: string) => {
        const numeroLimpio = valor.replace(/[^0-9.]/g, '');
        setMontoFijo(numeroLimpio);
        form.setValue("PrimaTotal", parseFloat(numeroLimpio) || 0);
    };

    const handleDeducibleChange = (coberturaId: number, valor: string) => {
        if (tipoCalculo === "fixed") return;

        setCoberturasSeleccionadas(prevCoberturas => {
            const nuevasCoberturas = prevCoberturas.map(cobertura => {
                if (cobertura.CoberturaID === coberturaId) {
                    return {
                        ...cobertura,
                        deducibleSeleccionado: parseInt(valor)
                    };
                }
                return cobertura;
            });

            // Actualizar detalles en el form con los nuevos deducibles
            const detallesActualizados = nuevasCoberturas.map(cobertura => {
                let montoSumaAsegurada = 0;
                if (cobertura.AplicaSumaAsegurada) {
                    montoSumaAsegurada = form.getValues("SumaAsegurada");
                } else if (cobertura.tipoMoneda.Nombre === "UMA") {
                    montoSumaAsegurada = parseFloat(cobertura.SumaAseguradaMax) * Number(process.env.VALOR_UMA || 0);
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
                    PrimaCalculada: calcularPrimaCobertura(cobertura),
                    PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
                    ValorAseguradoUsado: montoSumaAsegurada,
                    Obligatoria: cobertura.Obligatoria
                };
            });

            form.setValue("detalles", detallesActualizados, { shouldValidate: true });

            const costos = calcularCostoTotal(nuevasCoberturas);
            form.setValue("PrimaTotal", costos.costoNeto);

            return nuevasCoberturas;
        });
    };

    const handleEliminarCobertura = (coberturaId: number) => {
        setCoberturasSeleccionadas(prevCoberturas => {
            const nuevasCoberturas = prevCoberturas.filter(
                cobertura => cobertura.CoberturaID !== coberturaId
            );

            // Actualizar detalles en el form al eliminar cobertura
            const detallesActualizados = nuevasCoberturas.map(cobertura => ({
                CoberturaID: cobertura.CoberturaID,
                NombreCobertura: cobertura.NombreCobertura,
                Descripcion: cobertura.Descripcion,
                MontoSumaAsegurada: cobertura.AplicaSumaAsegurada ? form.getValues("SumaAsegurada") : parseFloat(cobertura.SumaAseguradaMax),
                DeducibleID: cobertura.tipoDeducible.TipoDeducibleID,
                MontoDeducible: cobertura.deducibleSeleccionado || parseInt(cobertura.DeducibleMin),
                PrimaCalculada: calcularPrimaCobertura(cobertura),
                PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
                ValorAseguradoUsado: cobertura.AplicaSumaAsegurada ? form.getValues("SumaAsegurada") : parseFloat(cobertura.SumaAseguradaMax),
                Obligatoria: cobertura.Obligatoria
            }));

            form.setValue("detalles", detallesActualizados, { shouldValidate: true });

            if (tipoCalculo === "coverage") {
                const costos = calcularCostoTotal(nuevasCoberturas);
                form.setValue("PrimaTotal", costos.costoNeto);
            }

            return nuevasCoberturas;
        });
    };

    const renderValorCobertura = (cobertura: CoberturaProp) => {
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
    };

    const renderDeducibleSelector = (cobertura: CoberturaProp) => {
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
                onValueChange={(valor) => handleDeducibleChange(cobertura.CoberturaID, valor)}
                disabled={tipoCalculo === "fixed"}
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
    };

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
                            onValueChange={handleTipoCalculoChange}
                            value={tipoCalculo || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo de cálculo" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="fixed">
                                    Monto Fijo
                                </SelectItem>
                                <SelectItem value="coverage">
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
                                    onValueChange={handlePaqueteSelect}
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
                                                    {paquete.PrecioTotalFijo && tipoCalculo === "fixed" && (
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
                                    {tipoCalculo === "fixed"
                                        ? "Selecciona un paquete con precio fijo"
                                        : "Selecciona un paquete para calcular el costo por coberturas"
                                    }
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    {tipoCalculo === "fixed" && coberturasSeleccionadas.length > 0 && (
                        <FormItem>
                            <FormLabel>Monto Fijo del Paquete</FormLabel>
                            <Input
                                type="text"
                                value={montoFijo}
                                onChange={(e) => handleMontoFijoChange(e.target.value)}
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
                                    {tipoCalculo === "coverage" && <TableHead>Prima</TableHead>}
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coberturasSeleccionadas.map((cobertura) => (
                                    <TableRow key={cobertura.CoberturaID}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
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
                                        {tipoCalculo === "coverage" && (
                                            <TableCell className="font-medium">
                                                {formatCurrency(calcularPrimaCobertura(cobertura))}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {!cobertura.Obligatoria && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEliminarCobertura(cobertura.CoberturaID)}
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
                                    {tipoCalculo === "fixed"
                                        ? formatCurrency(parseFloat(montoFijo) || 0)
                                        : formatCurrency(calcularCostoTotal(coberturasSeleccionadas).costoNeto)
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