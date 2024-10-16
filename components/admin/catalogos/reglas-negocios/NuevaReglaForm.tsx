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
import { iGetAllCobertura } from "@/interfaces/ReglasNegocios"

export const NuevaReglaForm = ({ coberturas = [] }: { coberturas: iGetAllCobertura[] }) => {
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
            ValorAjuste: 0,
            Condicion: '',
            EsGlobal: false,         // Booleanos inicializados en false
            Activa: false,
            CodigoPostal: '',
            cobertura: {
                CoberturaID: 0,     // Inicializando con un objeto vacío con propiedades requeridas
            },
            condiciones: [
                {
                    Campo: '',        // Inicializando con un objeto vacío con propiedades requeridas
                    Operador: '',
                    Valor: '',
                    CodigoPostal: '',
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

        const dataToSend = {
            ...values,
            cobertura: {
                CoberturaID: values.EsGlobal == true ? null : values.cobertura.CoberturaID,
            }
        };
        // return
        startTransition(async () => {
            try {
                const resp = await postReglaNegocio(dataToSend)

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
                                name="Descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción de la Regla</FormLabel>
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
                            {/* Select de TipoAplicacion ('Global','CoberturaEspecifica')  */}
                            <FormField
                                control={form.control}
                                name="TipoAplicacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de aplicación</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Global">Global</SelectItem>
                                                    <SelectItem value="CoberturaEspecifica">Cobertura Específica</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                        <FormLabel>Tipo de Regla</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Prima">Prima</SelectItem>
                                                    <SelectItem value="Cobertura">Cobertura</SelectItem>
                                                    <SelectItem value="Deducible">Deducible</SelectItem>
                                                    <SelectItem value="Descuento">Descuento</SelectItem>
                                                    <SelectItem value="Bonificacion">Bonificación</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                            {/* Si EsGlobal == true, mostrar este campo */}
                            {/* Select de CoberturaID */}
                            {form.watch("EsGlobal") === false ? (
                                <FormField
                                    control={form.control}
                                    name="cobertura"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cobertura</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={(value) => field.onChange({ CoberturaID: Number(value) })}>
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

                                <div key={item.id} className="grid grid-cols-12 gap-5 items-center border-t pt-5">
                                    <div className="col-span-4">
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
                                    <div className="col-span-4">
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
                                                                <SelectItem value="=">Igual Que</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-3">
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
                                    <div className="col-span-4">
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
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() => append({ CodigoPostal: '', Campo: '', Operador: '', Valor: '' })}
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