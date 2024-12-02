"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SaveIcon, Loader2 } from "lucide-react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { useState } from "react";
import { editarCotizacionSchema } from "@/schemas/cotizadorSchema";
import { patchCotizacion } from "@/actions/CotizadorActions";

interface Props {
    cotizacion: iGetCotizacion;
    onGuardar: () => void;
}

export const EditarCotizacionForm = ({ cotizacion, onGuardar }: Props) => {
    const [cargando, setCargando] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(editarCotizacionSchema),
        defaultValues: {
            NombrePersona: cotizacion.NombrePersona,
            EstadoCotizacion: cotizacion.EstadoCotizacion,
        },
    });

    const onSubmit = async (valores: any) => {
        setCargando(true);
        try {
            const respuesta = await patchCotizacion(cotizacion.CotizacionID, valores);

            if (!respuesta) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la cotización.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Cotización actualizada",
                description: "La cotización se ha actualizado exitosamente.",
                variant: "default",
            });

            onGuardar();
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un problema al actualizar la cotización.",
                variant: "destructive",
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="NombrePersona"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Cliente</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <Button type="submit" disabled={cargando}>
                    {cargando ? (
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