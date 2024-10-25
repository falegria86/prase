"use client"

import { postAsociarPaqueteCobertura } from "@/actions/CatPaquetesActions"
import Loading from "@/app/(protected)/loading"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface"
import { iGetAllPaquetes, iAsociarPaqueteCobertura } from "@/interfaces/CatPaquetesInterface"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, SaveIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

interface NuevaAsociacionFormProps {
    paquetes: iGetAllPaquetes[]
    coberturas: iGetCoberturas[]
}

const nuevaAsociacionSchema = z.object({
    paqueteId: z.number().min(1, "Selecciona un paquete"),
    coberturas: z.array(
        z.object({
            CoberturaID: z.number(),
            obligatoria: z.boolean(),
        })
    ).min(1, "Selecciona al menos una cobertura"),
})

type FormValues = z.infer<typeof nuevaAsociacionSchema>

export const NuevaAsociacionForm = ({ paquetes, coberturas }: NuevaAsociacionFormProps) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(nuevaAsociacionSchema),
        defaultValues: {
            paqueteId: paquetes && paquetes.length > 0 ? paquetes[0].PaqueteCoberturaID : undefined,
            coberturas: [],
        },
    })

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "coberturas",
    })

    const handleCoberturaChange = (id: number, checked: boolean) => {
        if (checked) {
            append({ CoberturaID: id, obligatoria: false })
        } else {
            const index = fields.findIndex((field) => field.CoberturaID === id)
            if (index !== -1) {
                remove(index)
            }
        }
    }

    const handleObligatoriaChange = (id: number, value: boolean) => {
        const index = fields.findIndex((field) => field.CoberturaID === id)
        if (index !== -1) {
            update(index, { ...fields[index], obligatoria: value })
        }
    }

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                const payload: iAsociarPaqueteCobertura = {
                    coberturas: values.coberturas,
                }

                const response = await postAsociarPaqueteCobertura(values.paqueteId, payload)

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
                    })
                    form.reset()
                    router.refresh()
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al crear la asociación.",
                    variant: "destructive",
                })
            }
        })
    }

    if (!paquetes || paquetes.length === 0) {
        return <div>No hay paquetes disponibles.</div>
    }

    return (
        <>
            {isPending && <Loading />}
            <div className="bg-white p-6 shadow-md max-w-7xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="paqueteId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selecciona un paquete</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un paquete" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {paquetes.map((paquete) => (
                                                <SelectItem key={paquete.PaqueteCoberturaID} value={paquete.PaqueteCoberturaID.toString()}>
                                                    {paquete.NombrePaquete}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Selecciona Coberturas</FormLabel>
                            <div className="space-y-4">
                                {coberturas.map((cobertura) => {
                                    const coberturaField = fields.find((field) => field.CoberturaID === cobertura.CoberturaID)
                                    return (
                                        <div key={cobertura.CoberturaID} className="flex items-center gap-4">
                                            <Checkbox
                                                id={`cobertura-${cobertura.CoberturaID}`}
                                                checked={!!coberturaField}
                                                onCheckedChange={(checked) => handleCoberturaChange(cobertura.CoberturaID, checked as boolean)}
                                            />
                                            <label htmlFor={`cobertura-${cobertura.CoberturaID}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {cobertura.NombreCobertura}
                                            </label>
                                            {coberturaField && (
                                                <Select
                                                    onValueChange={(value) => handleObligatoriaChange(cobertura.CoberturaID, value === "true")}
                                                    value={coberturaField.obligatoria ? "true" : "false"}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="¿Es obligatoria?" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Obligatoria</SelectItem>
                                                        <SelectItem value="false">No obligatoria</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <FormMessage />
                        </FormItem>

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
    )
}