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
import { iGetApplications } from "@/interfaces/SeguridadInterface";
import { editApplicationSchema } from "@/schemas/admin/catalogos/catalogosSchemas";
import { patchApplication } from "@/actions/SeguridadActions";

interface EditarApplicationFormProps {
    application: iGetApplications;
    onSave: () => void;
}

export const EditarApplicationForm = ({ application, onSave }: EditarApplicationFormProps) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editApplicationSchema>>({
        resolver: zodResolver(editApplicationSchema),
        defaultValues: {
            nombre: application.nombre,
            descripcion: application.descripcion,
        },
    });

    const onSubmit = (values: z.infer<typeof editApplicationSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchApplication(application.id, values);

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al actualizar la aplicación.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Aplicación actualizada",
                        description: "La aplicación se ha actualizado exitosamente.",
                        variant: "default",
                    });
                    form.reset();
                    onSave();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al actualizar la aplicación.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
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
                            <FormLabel>Descripción</FormLabel>
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
    );
};
