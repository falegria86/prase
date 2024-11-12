"use client";

import { useState } from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { CarIcon, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FormField,
    FormItem,
    FormLabel,
    // FormControl,
    // FormMessage,
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format-number";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import { iGetAllPaquetes, iGetAsociacionPaqueteCobertura } from "@/interfaces/CatPaquetesInterface";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";
import { Button } from "../ui/button";

interface Props {
    form: UseFormReturn<z.infer<typeof nuevaCotizacionSchema>>;
    paquetesCobertura: iGetAllPaquetes[];
    coberturas: iGetCoberturas[];
    asociaciones: iGetAsociacionPaqueteCobertura[];
    reglasGlobales: iGetAllReglaNegocio[];
}

export const CoberturasForm = ({ form, paquetesCobertura, coberturas, asociaciones, reglasGlobales }: Props) => {
    const values = form.getValues();
    const [tableData, setTableData] = useState<{
        PaqueteCoberturaID: number;
        coberturas: Array<{
            CoberturaID: number;
            NombreCobertura: string;
            MontoSumaAsegurada: number;
            DeducibleID: number;
            MontoDeducible: number;
            PrimaCalculada: number;
            PorcentajePrimaAplicado: number;
            ValorAseguradoUsado: number;
            Obligatoria: boolean;
            AplicaSumaAsegurada: boolean;
        }>;
    }>({
        PaqueteCoberturaID: 0,
        coberturas: [],
    });
    const [bonificacion, setBonificacion] = useState(0);
    const [primaTotal, setPrimaTotal] = useState(0);

    const calculatePrima = (cobertura: iGetCoberturas, selectedSumaAsegurada: number, selectedDeducible: number) => {
        let prima = 0;
        console.log(reglasGlobales)
        // Si tiene prima base, usar ese valor
        if (cobertura.PrimaBase) {
            prima = parseFloat(cobertura.PrimaBase);

            // Aquí se pueden aplicar las reglas de negocio si es necesario
            // const reglasCobertura = reglasGlobales.filter(regla =>
            //     regla.cobertura?.CoberturaID === cobertura.CoberturaID && regla.Activa
            // );

            // reglasCobertura.forEach(regla => {
            //     if (regla.TipoAplicacion === 'PORCENTAJE') {
            //         prima *= (1 + regla.ValorAjuste / 100);
            //     } else if (regla.TipoAplicacion === 'MONTO') {
            //         prima += regla.ValorAjuste;
            //     }
            // });
        } else {
            // Si no tiene prima base, calcular basado en el porcentaje de la suma asegurada
            const porcentajePrima = parseFloat(cobertura.PorcentajePrima) / 100;
            prima = selectedSumaAsegurada * porcentajePrima;
        }

        // Aplicar ajuste por deducible al final
        prima *= (1 - (selectedDeducible / 100));

        return prima;
    };

    const handlePaqueteChange = (idPaquete: string) => {
        const asociacionesPaquete = asociaciones.filter(a => a.PaqueteCoberturaID.toString() === idPaquete);

        const coberturasData = asociacionesPaquete.map(asociacion => {
            const cobertura = coberturas.find(c => c.CoberturaID === asociacion.CoberturaID);
            if (!cobertura) return null;

            const sumaAsegurada = cobertura.AplicaSumaAsegurada
                ? form.getValues('SumaAsegurada')
                : parseFloat(cobertura.SumaAseguradaMin);

            const deducible = parseInt(cobertura.DeducibleMin);
            const prima = calculatePrima(cobertura, sumaAsegurada, deducible);

            return {
                CoberturaID: cobertura.CoberturaID,
                NombreCobertura: cobertura.NombreCobertura,
                MontoSumaAsegurada: sumaAsegurada,
                DeducibleID: 1,
                MontoDeducible: deducible,
                PrimaCalculada: prima,
                PorcentajePrimaAplicado: parseFloat(cobertura.PorcentajePrima),
                ValorAseguradoUsado: sumaAsegurada,
                Obligatoria: asociacion.Obligatoria,
                AplicaSumaAsegurada: cobertura.AplicaSumaAsegurada
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        setTableData({
            PaqueteCoberturaID: parseInt(idPaquete),
            coberturas: coberturasData
        });

        form.setValue('detalles', coberturasData);

        const total = coberturasData.reduce((sum, item) => sum + item.PrimaCalculada, 0);
        const totalWithBonificacion = total * (1 - (bonificacion / 100));
        setPrimaTotal(totalWithBonificacion);
        form.setValue('PrimaTotal', totalWithBonificacion);
    };

    const handleSumaAseguradaChange = (coberturaId: number, value: string) => {
        const newTableData = {
            ...tableData,
            coberturas: tableData.coberturas.map(cobertura => {
                if (cobertura.CoberturaID === coberturaId) {
                    const newSumaAsegurada = parseFloat(value);
                    const nuevaPrima = calculatePrima(
                        coberturas.find(c => c.CoberturaID === coberturaId)!,
                        newSumaAsegurada,
                        cobertura.MontoDeducible
                    );
                    return {
                        ...cobertura,
                        MontoSumaAsegurada: newSumaAsegurada,
                        ValorAseguradoUsado: newSumaAsegurada,
                        PrimaCalculada: nuevaPrima
                    };
                }
                return cobertura;
            })
        };
        setTableData(newTableData);
        form.setValue('detalles', newTableData.coberturas);
        updatePrimaTotal(newTableData.coberturas);
    };

    const handleDeducibleChange = (coberturaId: number, value: string) => {
        const newTableData = {
            ...tableData,
            coberturas: tableData.coberturas.map(cobertura => {
                if (cobertura.CoberturaID === coberturaId) {
                    const newDeducible = parseInt(value);
                    const nuevaPrima = calculatePrima(
                        coberturas.find(c => c.CoberturaID === coberturaId)!,
                        cobertura.MontoSumaAsegurada,
                        newDeducible
                    );
                    return {
                        ...cobertura,
                        MontoDeducible: newDeducible,
                        PrimaCalculada: nuevaPrima
                    };
                }
                return cobertura;
            })
        };
        setTableData(newTableData);
        form.setValue('detalles', newTableData.coberturas);
        updatePrimaTotal(newTableData.coberturas);
    };

    const handleBonificacionChange = (value: string) => {
        const newBonificacion = parseFloat(value) || 0;
        setBonificacion(newBonificacion);
        updatePrimaTotal(tableData.coberturas, newBonificacion);
    };

    const updatePrimaTotal = (coberturas: typeof tableData.coberturas, newBonificacion?: number) => {
        const total = coberturas.reduce((sum, item) => sum + item.PrimaCalculada, 0);
        const totalWithBonificacion = total * (1 - ((newBonificacion ?? bonificacion) / 100));
        setPrimaTotal(totalWithBonificacion);
        form.setValue('PrimaTotal', totalWithBonificacion);
    };

    const handleDeleteCobertura = (coberturaId: number) => {
        const newCoberturas = tableData.coberturas.filter(
            cobertura => cobertura.CoberturaID !== coberturaId
        );

        setTableData({
            ...tableData,
            coberturas: newCoberturas
        });

        form.setValue('detalles', newCoberturas);

        updatePrimaTotal(newCoberturas);
    };

    return (
        <div className="space-y-6">
            <div className="border border-gray-300 w-fit px-6 py-4 rounded-lg bg-sky-100 flex gap-4 items-center">
                <CarIcon size={40} className="text-blue-700" />
                <div>
                    <h4 className="text-base uppercase font-bold">Cotizando</h4>
                    <div className="mt-1 text-sky-700 font-bold italic">
                        {values.marcaNombre} {values.modeloNombre} {values.Modelo} {values.versionNombre}
                    </div>
                </div>
            </div>

            <FormField
                control={form.control}
                name="PaqueteCoberturaID"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Paquete de cobertura</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(parseInt(value));
                                handlePaqueteChange(value);
                            }}
                            defaultValue={field.value?.toString()}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona paquete..." />
                            </SelectTrigger>
                            <SelectContent>
                                {paquetesCobertura.map((paquete) => (
                                    <SelectItem
                                        key={paquete.PaqueteCoberturaID}
                                        value={paquete.PaqueteCoberturaID.toString()}
                                    >
                                        {paquete.NombrePaquete}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
            {tableData.coberturas.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cobertura</TableHead>
                            <TableHead>Suma asegurada</TableHead>
                            <TableHead>Deducible</TableHead>
                            <TableHead>Prima</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.coberturas.map((item) => {
                            const cobertura = coberturas.find(c => c.CoberturaID === item.CoberturaID)!;
                            const sumaAseguradaOptions = item.AplicaSumaAsegurada ?
                                [form.getValues('SumaAsegurada')] :
                                Array.from(
                                    { length: Math.floor((parseFloat(cobertura.SumaAseguradaMax) - parseFloat(cobertura.SumaAseguradaMin)) / 1000) + 1 },
                                    (_, i) => parseFloat(cobertura.SumaAseguradaMin) + i * 1000
                                );

                            const deducibleOptions = Array.from(
                                {
                                    length: Math.floor((parseInt(cobertura.DeducibleMax) - parseInt(cobertura.DeducibleMin)) /
                                        (parseInt(cobertura.RangoSeleccion) || 5)) + 1
                                },
                                (_, i) => parseInt(cobertura.DeducibleMin) + i * (parseInt(cobertura.RangoSeleccion) || 5)
                            );

                            return (
                                <TableRow key={item.CoberturaID}>
                                    <TableCell>{item.NombreCobertura}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={item.MontoSumaAsegurada.toString()}
                                            onValueChange={(value) => handleSumaAseguradaChange(item.CoberturaID, value)}
                                            disabled={item.AplicaSumaAsegurada}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sumaAseguradaOptions.map((value) => (
                                                    <SelectItem key={value} value={value.toString()}>
                                                        ${formatNumber(value)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={item.MontoDeducible.toString()}
                                            onValueChange={(value) => handleDeducibleChange(item.CoberturaID, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {deducibleOptions.map((value) => (
                                                    <SelectItem key={value} value={value.toString()}>
                                                        {value}%
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>${formatNumber(item.PrimaCalculada)}</TableCell>
                                    <TableCell>
                                        {!item.Obligatoria && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteCobertura(item.CoberturaID)}
                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2
                                                    size={16}
                                                />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            <div className="flex gap-4 items-end">
                <FormItem className="flex-1">
                    <FormLabel>Bonificación técnica</FormLabel>
                    <Input
                        type="number"
                        min="0"
                        max="35"
                        value={bonificacion}
                        onChange={(e) => handleBonificacionChange(e.target.value)}
                        className="w-full"
                    />
                    <div className="text-sm text-gray-500">Min. 0% - Max. 35%</div>
                </FormItem>
                <div className="text-right flex-1">
                    <div className="text-sm text-gray-600">Prima total contado:</div>
                    <div className="text-2xl font-bold text-blue-600">
                        ${formatNumber(primaTotal)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoberturasForm;