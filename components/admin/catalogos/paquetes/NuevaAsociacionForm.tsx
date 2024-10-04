"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { postAsociarPaqueteCobertura } from "@/actions/CatPaquetesActions";
import { iGetAllPaquetes, Cobertura } from "@/interfaces/CatPaquetesInterface";
import { nuevaAsociacionSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { Loader2, SaveIcon } from "lucide-react";
import Loading from "@/app/(protected)/loading";

interface NuevaAsociacionFormProps {
    paquetes: iGetAllPaquetes[];
    coberturas: Cobertura[];
}

export const NuevaAsociacionForm = ({ paquetes, coberturas }: NuevaAsociacionFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaAsociacionSchema>>({
        resolver: zodResolver(nuevaAsociacionSchema),
        defaultValues: {
            paqueteId: paquetes[0].PaqueteCoberturaID ?? 0,
            coberturaIds: [],
            obligatoria: false,
        },
    });

    const coberturaIds = form.watch("coberturaIds");

    const handleCoberturaChange = (id: number, checked: boolean) => {
        const updatedCoberturas = checked
            ? [...coberturaIds, id] // Añadir cobertura si se selecciona
            : coberturaIds.filter((coberturaId) => coberturaId !== id); // Quitar cobertura si se deselecciona

        form.setValue("coberturaIds", updatedCoberturas); // Actualizar valor en el formulario
    };

    const onSubmit = (values: z.infer<typeof nuevaAsociacionSchema>) => {
        startTransition(async () => {
            const { paqueteId, coberturaIds, obligatoria } = values;

            try {
                const body = { coberturaIds, obligatoria };
                const response = await postAsociarPaqueteCobertura(paqueteId, body);

                if (!response) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la asociación.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Asociación creada",
                        description: "La asociación se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la asociación.",
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Select para seleccionar paquete */}
                        <FormField
                            control={form.control}
                            name="paqueteId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selecciona un paquete</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un paquete" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paquetes.map((paquete) => (
                                                    <SelectItem key={paquete.PaqueteCoberturaID} value={paquete.PaqueteCoberturaID.toString()}>
                                                        {paquete.NombrePaquete}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Checkboxes para seleccionar coberturas */}
                        <FormField
                            control={form.control}
                            name="coberturaIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Selecciona Coberturas</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {coberturas.map((cobertura) => (
                                                <div key={cobertura.CoberturaID} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={cobertura.CoberturaID.toString()}
                                                        checked={coberturaIds.includes(cobertura.CoberturaID)}
                                                        onCheckedChange={(checked) => handleCoberturaChange(cobertura.CoberturaID, checked as boolean)}
                                                    />
                                                    <label htmlFor={cobertura.CoberturaID.toString()}>{cobertura.NombreCobertura}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Select para campo Obligatoria */}
                        <FormField
                            control={form.control}
                            name="obligatoria"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>¿Es Obligatoria?</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona si es obligatoria" />
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
                    </form>
                </Form>
            </div>
        </>
    );
};
