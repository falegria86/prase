"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SaveIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { patchCobertura } from "@/actions/CatCoberturasActions";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { editCoberturaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface EditarCoberturaFormProps {
    cobertura: iGetCoberturas;
    onSave: () => void;
}

export const EditarCoberturaForm = ({ cobertura, onSave }: EditarCoberturaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editCoberturaSchema>>({
        resolver: zodResolver(editCoberturaSchema),
        defaultValues: {
            NombreCobertura: cobertura.NombreCobertura,
            Descripcion: cobertura.Descripcion,
            PrimaBase: cobertura.PrimaBase,
            SumaAseguradaMin: cobertura.SumaAseguradaMin,
            SumaAseguradaMax: cobertura.SumaAseguradaMax,
            DeducibleMin: cobertura.DeducibleMin,
            DeducibleMax: cobertura.DeducibleMax,
            PorcentajePrima: cobertura.PorcentajePrima,
            RangoSeleccion: cobertura.RangoSeleccion,
            EsCoberturaEspecial: cobertura.EsCoberturaEspecial,
            Variable: cobertura.Variable,
            SinValor: cobertura.SinValor,
            AplicaSumaAsegurada: cobertura.AplicaSumaAsegurada,
        },
    });

    const onSubmit = (values: z.infer<typeof editCoberturaSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchCobertura(cobertura.CoberturaID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la cobertura.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cobertura actualizada",
                        description: "La cobertura se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la cobertura.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="NombreCobertura"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la cobertura</FormLabel>
                                <FormControl>
                                    <Input placeholder="Cobertura..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Descripcion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Input placeholder="Descripción de la cobertura..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="PrimaBase"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prima Base</FormLabel>
                                <FormControl>
                                    <Input placeholder="Prima base de la cobertura..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SumaAseguradaMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suma Asegurada Mínima</FormLabel>
                                <FormControl>
                                    <Input placeholder="Suma asegurada mínima..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SumaAseguradaMax"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Suma Asegurada Máxima</FormLabel>
                                <FormControl>
                                    <Input placeholder="Suma asegurada máxima..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="DeducibleMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deducible Mínimo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Deducible mínimo..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="DeducibleMax"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deducible Máximo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Deducible máximo..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="PorcentajePrima"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Porcentaje Prima</FormLabel>
                                <FormControl>
                                    <Input placeholder="Porcentaje de la prima..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="RangoSeleccion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rango de Selección</FormLabel>
                                <FormControl>
                                    <Input placeholder="Rango de selección..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Selects para los campos booleanos */}
                    <FormField
                        control={form.control}
                        name="EsCoberturaEspecial"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Es cobertura especial?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Sí</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Variable"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Es variable?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Sí</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SinValor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Sin valor?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Sí</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="AplicaSumaAsegurada"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>¿Aplica suma asegurada?</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={field.value ? "true" : "false"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Sí</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isPending} size="lg" className="mt-8">
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="w-4 h-4 mr-2" />
                            Guardar
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
};
