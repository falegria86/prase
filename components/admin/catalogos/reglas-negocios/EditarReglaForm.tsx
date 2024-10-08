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
import { patchReglaNegocio } from "@/actions/ReglasNegocio";
import { iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";
import { editReglaNegocioSchema } from "@/schemas/admin/reglasNegocio/reglasNegocioSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditarReglaFormProps {
    regla: iGetAllReglaNegocio;
    onSave: () => void;
}

export const EditarReglaForm = ({ regla, onSave }: EditarReglaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editReglaNegocioSchema>>({
        resolver: zodResolver(editReglaNegocioSchema),
        defaultValues: {
            NombreRegla: regla.NombreRegla,
            Descripcion: regla.Descripcion,
            TipoAplicacion: regla.TipoAplicacion,
            TipoRegla: regla.TipoRegla,
            ValorAjuste: regla.ValorAjuste,
            Condicion: regla.Condicion,
            EsGlobal: regla.EsGlobal,
            Activa: regla.Activa,
            CodigoPostal: regla.CodigoPostal,
            condiciones: regla.condiciones
        },
    });

    const onSubmit = (values: z.infer<typeof editReglaNegocioSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchReglaNegocio(regla.ReglaID, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la regla de negocio.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Regla de negocio actualizada",
                        description: "La regla de negocio se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la regla de negocio.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="NombreRegla"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la regla</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Regla de negocio..."
                                        {...field}
                                    />
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
                                <FormLabel>Descripción de la regla</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Descripción de la regla..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="TipoAplicacion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de aplicación</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Tipo de aplicación..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="TipoRegla"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de regla</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Tipo de regla..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ValorAjuste"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor de ajuste</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Valor de ajuste..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="Condicion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Condición</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Condición..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="EsGlobal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Es global</FormLabel>
                                <FormControl>
                                    <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
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
                        name="Activa"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Activa</FormLabel>
                                <FormControl>
                                    <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
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
                        name="CodigoPostal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código postal</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Código postal..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Como se manejan las condiciones? */}

                    <Button type="submit" disabled={isPending} size="lg">
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
                </div>
            </form>
        </Form>
    );

}