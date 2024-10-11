"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { SaveIcon, Loader2, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { patchReglaNegocio } from "@/actions/ReglasNegocio";
import { iGetAllReglaNegocio, iGetAllCobertura } from "@/interfaces/ReglasNegocios";
import { editReglaNegocioSchema } from "@/schemas/admin/reglasNegocio/reglasNegocioSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditarReglaFormProps {
    regla: iGetAllReglaNegocio;
    coberturas: iGetAllCobertura[];
    onSave: () => void;
}

export const EditarReglaForm = ({ regla, coberturas, onSave }: EditarReglaFormProps) => {

    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof editReglaNegocioSchema>>({
        resolver: zodResolver(editReglaNegocioSchema),
        defaultValues: {
            NombreRegla: regla?.NombreRegla || '',      // Inicializa con un valor por defecto si regla está indefinida
            ValorAjuste: regla?.ValorAjuste || 0,
            EsGlobal: regla?.EsGlobal || false,         // Booleano inicializado en false
            Activa: regla?.Activa || false,
            cobertura: {
                CoberturaID: regla?.cobertura?.CoberturaID || 0,   // Referencia a la cobertura de la regla
            },
            condiciones: regla?.condiciones?.length
                ? regla.condiciones.map(condicion => ({
                    CondicionID: condicion.CondicionID || 0,     // Si no existe, usa 0
                    Campo: condicion.Campo || '',                // Inicializa los campos con un string vacío si están indefinidos
                    Operador: condicion.Operador || '',
                    Valor: condicion.Valor || '',
                    CodigoPostal: condicion.CodigoPostal || '',
                }))
                : [
                    {
                        CondicionID: 0,
                        Campo: '',        // Inicializando con un objeto vacío con propiedades requeridas
                        Operador: '',
                        Valor: '',
                        CodigoPostal: '',
                    }
                ],
        },
    });

    const onSubmit = (values: z.infer<typeof editReglaNegocioSchema>) => {
        startTransition(async () => {
            try {
                const resp = await patchReglaNegocio(regla.ReglaID, values);
                console.log("🚀 ~ startTransition ~ resp:", resp)

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

    // Configurar useFieldArray para manejar condiciones dinámicamente
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "condiciones",  // El nombre del array de condiciones
    });

    return (
        <div className="max-h-[80vh] overflow-y-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 pr-2">
                    <div className="grid grid-cols-2 gap-5">
                        <FormField
                            control={form.control}
                            name="NombreRegla"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Regla</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Paquete de cobertura..."
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
                                            type="number"
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
                        {form.watch("EsGlobal") === false ? (
                            <FormField
                                control={form.control}
                                name="cobertura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cobertura</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value?.CoberturaID?.toString()}
                                                onValueChange={(value) => field.onChange({ CoberturaID: Number(value) })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {coberturas && coberturas.map((cobertura) => (
                                                        <SelectItem key={cobertura.CoberturaID} value={`${cobertura.CoberturaID}`}>
                                                            {cobertura.NombreCobertura}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div></div>
                        )}
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
                    </div>
                    {/* Campos dinámicos de condiciones */}
                    <h3 className="font-bold text-lg">Condiciones</h3>
                    <div className=" ">
                        {fields.map((item, index) => (
                            <div key={item.id} className="grid sm:grid-cols-3 gap-2 items-center border-y py-5 border-gray-400 pt-5">
                                <div className="">
                                    <FormField
                                        control={form.control}
                                        name={`condiciones.${index}.Campo`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Campo</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Campo..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <FormField
                                        control={form.control}
                                        name={`condiciones.${index}.Operador`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Operador</FormLabel>
                                                <FormControl className="w-full">
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="<=">Menor o Igual Que</SelectItem>
                                                            <SelectItem value=">=">Mayor o Igual Que</SelectItem>
                                                            <SelectItem value="<">Menor Que</SelectItem>
                                                            <SelectItem value=">">Mayor Que</SelectItem>
                                                            <SelectItem value="=">Igual Que</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <FormField
                                        control={form.control}
                                        name={`condiciones.${index}.Valor`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Valor de ajuste</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Valor de ajuste..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="">
                                    <FormField
                                        control={form.control}
                                        name={`condiciones.${index}.CodigoPostal`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código Postal</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Código Postal..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex items-end mt-auto ">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="rounded-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            onClick={() => append({ CodigoPostal: '', Campo: '', Operador: '', Valor: '' })}
                            variant="default"
                            className="rounded-md mt-5"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Condición
                        </Button>
                    </div>
                    {/* Botón para agregar una nueva condición */}
                    <Button type="submit" disabled={isPending} size="lg" className="rounded-md w-full">
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
    );

}