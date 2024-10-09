"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { nuevaReglaNegocioSchema } from "@/schemas/admin/reglasNegocio/reglasNegocioSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SaveIcon, Loader2, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { postReglaNegocio } from "@/actions/ReglasNegocio"
import Loading from "@/app/(protected)/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const NuevaReglaForm = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof nuevaReglaNegocioSchema>>({
        resolver: zodResolver(nuevaReglaNegocioSchema),
        defaultValues: {
            NombreRegla: '',         // Cadenas vacías para valores string
            Descripcion: '',
            TipoAplicacion: '',
            TipoRegla: '',
            ValorAjuste: '',
            Condicion: '',
            EsGlobal: false,         // Booleanos inicializados en false
            Activa: false,
            CodigoPostal: '',
            condiciones: [
                {
                    Campo: '',        // Inicializando con un objeto vacío con propiedades requeridas
                    Operador: '',
                    Valor: '',
                }
            ]
        },
    })

    // Configurar useFieldArray para manejar condiciones dinámicamente
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "condiciones",  // El nombre del array de condiciones
    });

    const onSubmit = (values: z.infer<typeof nuevaReglaNegocioSchema>) => {
        startTransition(async () => {
            try {
                const resp = await postReglaNegocio(values)

                if (!resp) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al crear la regla de negocio.",
                        variant: "destructive",
                    })
                } else {
                    toast({
                        title: "Regla de negocio creada",
                        description: "La regla de negocio se ha creado exitosamente.",
                        variant: "default",
                    })
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la regla de negocio.",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8">
                        <div className="grid grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="NombreRegla"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del paquete</FormLabel>
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
                                name="Descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción del paquete</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Descripción del paquete..."
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
                                                type="number"
                                                placeholder="Código postal..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        {/* Campos dinámicos de condiciones */}
                        <h3 className="font-bold text-lg">Condiciones</h3>
                        <div className="space-y-5">
                            {fields.map((item, index) => (
                                <div key={item.id} className="flex gap-5 items-center">
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
                                    <FormField
                                        control={form.control}
                                        name={`condiciones.${index}.Operador`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Operador</FormLabel>
                                                <FormControl className="w-full">
                                                    <Select onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="<=">Menor o Igual Que</SelectItem>
                                                            <SelectItem value=">=">Mayor o Igual Que</SelectItem>
                                                            <SelectItem value="<">Menor Que</SelectItem>
                                                            <SelectItem value=">">Mayor Que</SelectItem>
                                                            <SelectItem value="==">Igual Que</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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

                                    {/* Botón para eliminar condición */}
                                    <div className="flex items-end justify-end  mt-auto">
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
                                onClick={() => append({ Campo: '', Operador: '', Valor: '' })}
                                variant="default"
                                className="rounded-md"
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
        </>
    )
}