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
import { nuevaApplicationSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { postApplication } from "@/actions/SeguridadActions";
import Loading from "@/app/(protected)/loading";

export const NuevaAplicacionForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaApplicationSchema>>({
        resolver: zodResolver(nuevaApplicationSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
        },
    });

    const onSubmit = (values: z.infer<typeof nuevaApplicationSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postApplication(values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la aplicación.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Aplicación creada",
                        description: "La aplicación se ha creado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la aplicación.",
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
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la aplicación</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre de la aplicación..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción de la aplicación</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Descripción de la aplicación..." {...field} />
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
