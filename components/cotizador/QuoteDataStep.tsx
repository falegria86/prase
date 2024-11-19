import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepProps } from "@/types/cotizador";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Info } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";

export const QuoteDataStep = ({
    form,
    tiposSumas,
    setIsStepValid,
}: StepProps) => {
    const [sumaAsegurada, setSumaAsegurada] = useState({
        min: -1,
        max: -1,
    });
    const [mensajeSuma, setMensajeSuma] = useState<string | null>(null);
    const [isSumaAseguradaDisabled, setIsSumaAseguradaDisabled] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

    const vigencia = form.watch("vigencia");
    const meses = form.watch("meses");
    const inicioVigencia = form.watch("inicioVigencia");

    const getNextMonthDate = (date: Date, monthsToAdd: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + monthsToAdd);
        return newDate;
    };

    const updateFinVigencia = () => {
        const inicioVigencia = form.watch("inicioVigencia");
        const vigencia = form.watch("vigencia");
        const meses = form.watch("meses");

        if (!inicioVigencia) return;

        const monthsToAdd = vigencia === "Anual" ? 12 : (meses || 1);
        const startDate = new Date(inicioVigencia);
        const endDate = getNextMonthDate(startDate, monthsToAdd);

        form.setValue("finVigencia", endDate.toISOString().split('T')[0], {
            shouldValidate: true
        });
    };

    const validateFields = async () => {
        const fieldsToValidate = [
            "inicioVigencia",
            "vigencia",
            "meses",
        ] as const;

        const results = await Promise.all(
            fieldsToValidate.map(async field => {
                const isValid = await form.trigger(field);
                setValidationErrors(prev => ({
                    ...prev,
                    [field]: !isValid
                }));
                return isValid;
            })
        );

        const values = form.getValues();
        const sumaAseguradaValid = !isSumaAseguradaDisabled ?
            (values.SumaAsegurada >= sumaAsegurada.min &&
                values.SumaAsegurada <= sumaAsegurada.max) :
            true;

        const isValid = results.every(Boolean) && sumaAseguradaValid;
        setIsStepValid?.(isValid);

        return isValid;
    };

    useEffect(() => {
        const initialValidation = async () => {
            const fieldsToValidate = [
                "TipoSumaAseguradaID",
                "SumaAsegurada",
                "PeriodoGracia",
                "inicioVigencia",
                "vigencia",
                "meses",
            ] as const;

            const results = await Promise.all(
                fieldsToValidate.map(async field => {
                    const isValid = await form.trigger(field);
                    setValidationErrors(prev => ({
                        ...prev,
                        [field]: !isValid
                    }));
                    return isValid;
                })
            );

            const values = form.getValues();
            const sumaAseguradaValid = !isSumaAseguradaDisabled ?
                (values.SumaAsegurada >= sumaAsegurada.min &&
                    values.SumaAsegurada <= sumaAsegurada.max) :
                true;

            const isValid = results.every(Boolean) && sumaAseguradaValid;
            setIsStepValid?.(isValid);

            const tipoSumaId = form.getValues("TipoSumaAseguradaID");
            if (tipoSumaId) {
                handleSumaAsegurada(tipoSumaId);
            }
        };

        initialValidation();

        if (!inicioVigencia) {
            const today = new Date();
            form.setValue("inicioVigencia", today, { shouldValidate: true });
            form.setValue("vigencia", "Anual", { shouldValidate: true });
            form.setValue("meses", 12, { shouldValidate: true });

            const initialEndDate = getNextMonthDate(today, 12);
            form.setValue("finVigencia", initialEndDate.toISOString().split('T')[0], {
                shouldValidate: true
            });
        }
    }, []);

    useEffect(() => {
        updateFinVigencia();
    }, [inicioVigencia, vigencia, meses]);

    useEffect(() => {
        const subscription = form.watch((_, { name }) => {
            if (name) {
                validateFields();
            }
        });

        return () => subscription.unsubscribe();
    }, [form.watch]);

    const handleSumaAsegurada = (tipoID: number) => {
        const tipo = tiposSumas?.find(
            tipo => tipo.TipoSumaAseguradaID === tipoID
        )?.NombreTipo;

        const maxSumaAsegurada = form.getValues("maxSumaAsegurada");
        const minSumaAsegurada = form.getValues("minSumaAsegurada");
        let mensaje: string | null = null;
        let disableSumaAsegurada = false;

        if (tipo?.toLowerCase().includes("convenido")) {
            setSumaAsegurada({
                min: maxSumaAsegurada * 0.985,
                max: maxSumaAsegurada * 1.015
            });
            mensaje = `Rango permitido ${formatCurrency(maxSumaAsegurada * 0.985)} - ${formatCurrency(maxSumaAsegurada * 1.015)}`;
            disableSumaAsegurada = false;
        } else if (tipo?.toLowerCase().includes("comercial")) {
            setSumaAsegurada({ min: maxSumaAsegurada, max: maxSumaAsegurada });
            disableSumaAsegurada = true;
            form.setValue("SumaAsegurada", maxSumaAsegurada);
        } else {
            // Valor libre
            setSumaAsegurada({ min: minSumaAsegurada, max: maxSumaAsegurada });
            mensaje = "Valor libre";
            disableSumaAsegurada = false;
        }

        setMensajeSuma(mensaje);
        setIsSumaAseguradaDisabled(disableSumaAsegurada);
        validateFields();
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-2 bg-primary/5 rounded-lg p-4"
            >
                <h4 className="font-semibold mb-2">Valor del vehículo</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Valor venta</p>
                        <p className="text-lg font-medium">
                            {formatCurrency(form.getValues("maxSumaAsegurada"))}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Valor compra</p>
                        <p className="text-lg font-medium">
                            {formatCurrency(form.getValues("minSumaAsegurada"))}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Derecho de Póliza */}
                <FormField
                    control={form.control}
                    name="DerechoPoliza"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Derecho de póliza</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    readOnly
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                {/* Vigencia */}
                <FormField
                    control={form.control}
                    name="vigencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vigencia</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    const newMeses = value === "Anual" ? 12 : 1;
                                    form.setValue("meses", newMeses, { shouldValidate: true });
                                    updateFinVigencia();
                                }}
                                value={field.value}
                            >
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

                {/* Meses (condicional) */}
                {vigencia === "Por meses" && (
                    <FormField
                        control={form.control}
                        name="meses"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de meses</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const numValue = Number(value);
                                        field.onChange(numValue);
                                        updateFinVigencia();
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona meses" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                                            <SelectItem key={mes} value={mes.toString()}>
                                                {mes} {mes === 1 ? "mes" : "meses"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {/* Inicio de Vigencia */}
                <FormField
                    control={form.control}
                    name="inicioVigencia"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Inicio de vigencia</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: es })
                                            ) : (
                                                <span>Selecciona una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            updateFinVigencia();
                                        }}
                                        disabled={(date) =>
                                            date < new Date()
                                        }
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Fin de Vigencia */}
                <FormField
                    control={form.control}
                    name="finVigencia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fin de vigencia</FormLabel>
                            <FormControl>
                                <Input {...field} type="date" disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tipo de Suma Asegurada */}
                <FormField
                    control={form.control}
                    name="TipoSumaAseguradaID"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Tipo de suma asegurada</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(Number(value));
                                        handleSumaAsegurada(Number(value));
                                    }}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo de suma" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tiposSumas?.map((tipo) => (
                                            <SelectItem
                                                key={tipo.TipoSumaAseguradaID}
                                                value={tipo.TipoSumaAseguradaID.toString()}
                                            >
                                                {tipo.NombreTipo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

                {/* Suma Asegurada */}
                <FormField
                    control={form.control}
                    name="SumaAsegurada"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Suma asegurada</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={formatCurrency(field.value)}
                                    disabled={isSumaAseguradaDisabled}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                                        const value = parseFloat(rawValue) / 100;
                                        if (!isNaN(value)) {
                                            field.onChange(value);
                                            validateFields();
                                        }
                                    }}
                                />
                            </FormControl>
                            {mensajeSuma && (
                                <div className="text-sm text-muted-foreground">{mensajeSuma}</div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Período de Gracia */}
                <FormField
                    control={form.control}
                    name="PeriodoGracia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Período de gracia</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona período" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Array.from({ length: 28 }, (_, i) => i + 3).map((dia) => (
                                        <SelectItem key={dia} value={dia.toString()}>
                                            {dia} días
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Nombre del Asegurado */}
                <FormField
                    control={form.control}
                    name="NombrePersona"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del asegurado</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Nombre del asegurado (opcional)"
                                    onChange={(e) => {
                                        field.onChange(e);
                                        validateFields();
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </motion.div>

            {/* Validación de suma asegurada */}
            {!isSumaAseguradaDisabled && sumaAsegurada.min >= 0 && sumaAsegurada.max > 0 && (
                <Alert variant={
                    form.getValues("SumaAsegurada") >= sumaAsegurada.min &&
                        form.getValues("SumaAsegurada") <= sumaAsegurada.max
                        ? "default"
                        : "destructive"
                }>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        La suma asegurada debe estar entre {formatCurrency(sumaAsegurada.min)} y {formatCurrency(sumaAsegurada.max)}
                    </AlertDescription>
                </Alert>
            )}

            {/* Mensajes de validación */}
            {Object.keys(validationErrors).map(field =>
                validationErrors[field] && (
                    <Alert key={field} variant="destructive">
                        <AlertDescription>
                            Por favor complete el campo {field} correctamente
                        </AlertDescription>
                    </Alert>
                )
            )}
        </div>
    );
};

export default QuoteDataStep;