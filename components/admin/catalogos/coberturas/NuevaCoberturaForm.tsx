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
import { postCobertura } from "@/actions/CatCoberturasActions";
import Loading from "@/app/(protected)/loading";
import { nuevaCoberturaSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Asegúrate de tener el componente de selección

export const NuevaCoberturaForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaCoberturaSchema>>({
        resolver: zodResolver(nuevaCoberturaSchema),
        defaultValues: {
            NombreCobertura: '',
            Descripcion: '',
            PrimaBase: '',
            SumaAseguradaMin: '',
            SumaAseguradaMax: '',
            DeducibleMin: '',
            DeducibleMax: '',
            PorcentajePrima: '',
            RangoSeleccion: '',
            EsCoberturaEspecial: false,
            Variable: false,
            SinValor: false,
            AplicaSumaAsegurada: false,
        },
    });

    const onSubmit = (values: z.infer<typeof nuevaCoberturaSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postCobertura(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la cobertura.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Cobertura creada",
                        description: "La cobertura se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la cobertura.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
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
                                            <Input
                                                placeholder="Cobertura..."
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
                                        <FormLabel>Descripción de la cobertura</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Describe lo que incluye la cobertura..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Prima base de la cobertura..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Suma asegurada mínima..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Suma asegurada máxima..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Deducible mínimo..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Deducible máximo..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Porcentaje de la prima..."
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder="Rango de selección..."
                                                {...field}
                                            />
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
                                name="Variable"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Es variable?</FormLabel>
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
                                name="SinValor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Sin valor?</FormLabel>
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
                                name="AplicaSumaAsegurada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>¿Aplica suma asegurada?</FormLabel>
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
            </div>
        </>
    );
};
