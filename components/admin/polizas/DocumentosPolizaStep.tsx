import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { File, Upload, X, Eye } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

const TIPOS_ARCHIVO_PERMITIDOS = ["image/jpeg", "image/png", "application/pdf"];
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5MB

const documentosSchema = z.object({
    ine: z
        .custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La INE es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos JPG, PNG o PDF"
        ),
    licencia: z
        .custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "La licencia es requerida")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos JPG, PNG o PDF"
        ),
    comprobanteDomicilio: z
        .custom<FileList>()
        .refine((archivos) => archivos?.length === 1, "El comprobante es requerido")
        .refine(
            (archivos) => archivos?.[0]?.size <= TAMANO_MAXIMO,
            "El archivo no debe superar 5MB"
        )
        .refine(
            (archivos) => TIPOS_ARCHIVO_PERMITIDOS.includes(archivos?.[0]?.type),
            "Solo se permiten archivos JPG, PNG o PDF"
        ),
});

type DocumentosFormData = z.infer<typeof documentosSchema>;

interface DocumentosPolizaStepProps {
    alSubmit: (documentos: FormData) => void;
}

interface PrevisualizacionArchivoProps {
    archivo: File;
    onEliminar: () => void;
}

const PrevisualizacionArchivo = ({ archivo, onEliminar }: PrevisualizacionArchivoProps) => {
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
    const esImagen = archivo.type.startsWith('image/');
    const esPDF = archivo.type === 'application/pdf';

    useEffect(() => {
        if (esImagen) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVistaPrevia(reader.result as string);
            };
            reader.readAsDataURL(archivo);
        } else if (esPDF) {
            setVistaPrevia(URL.createObjectURL(archivo));
        }

        return () => {
            if (vistaPrevia && esPDF) {
                URL.revokeObjectURL(vistaPrevia);
            }
        };
    }, [archivo, esImagen, esPDF]);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <File className="h-4 w-4" />
                <span className="text-sm truncate flex-1">{archivo.name}</span>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        {esImagen && vistaPrevia && (
                            <img
                                src={vistaPrevia}
                                alt="Vista previa"
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        )}
                        {esPDF && vistaPrevia && (
                            <iframe
                                src={vistaPrevia}
                                className="w-full h-[80vh]"
                                title="Vista previa PDF"
                            />
                        )}
                    </DialogContent>
                </Dialog>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onEliminar}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            {vistaPrevia && esImagen && (
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                    <img
                        src={vistaPrevia}
                        alt="Vista previa"
                        className="w-full h-full object-contain"
                    />
                </div>
            )}
            {vistaPrevia && esPDF && (
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <File className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>
            )}
        </div>
    );
};

export const DocumentosPolizaStep = ({ alSubmit }: DocumentosPolizaStepProps) => {
    const form = useForm<DocumentosFormData>({
        resolver: zodResolver(documentosSchema),
    });

    const manejarSubmit = (datos: DocumentosFormData) => {
        const formData = new FormData();
        if (datos.ine[0]) formData.append("ine", datos.ine[0]);
        if (datos.licencia[0]) formData.append("licencia", datos.licencia[0]);
        if (datos.comprobanteDomicilio[0]) formData.append("comprobanteDomicilio", datos.comprobanteDomicilio[0]);
        alSubmit(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Documentación</CardTitle>
                <CardDescription>
                    Sube los documentos requeridos para activar la póliza
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(manejarSubmit)} className="space-y-6">
                        <div className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="ine"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>INE / IFE</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <Input
                                                    type="file"
                                                    accept={TIPOS_ARCHIVO_PERMITIDOS.join(",")}
                                                    onChange={(e) => onChange(e.target.files)}
                                                    {...field}
                                                />
                                                {value?.[0] && (
                                                    <PrevisualizacionArchivo
                                                        archivo={value[0]}
                                                        onEliminar={() => onChange(new DataTransfer().files)}
                                                    />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="licencia"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Licencia de Conducir</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <Input
                                                    type="file"
                                                    accept={TIPOS_ARCHIVO_PERMITIDOS.join(",")}
                                                    onChange={(e) => onChange(e.target.files)}
                                                    {...field}
                                                />
                                                {value?.[0] && (
                                                    <PrevisualizacionArchivo
                                                        archivo={value[0]}
                                                        onEliminar={() => onChange(new DataTransfer().files)}
                                                    />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="comprobanteDomicilio"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Comprobante de Domicilio</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <Input
                                                    type="file"
                                                    accept={TIPOS_ARCHIVO_PERMITIDOS.join(",")}
                                                    onChange={(e) => onChange(e.target.files)}
                                                    {...field}
                                                />
                                                {value?.[0] && (
                                                    <PrevisualizacionArchivo
                                                        archivo={value[0]}
                                                        onEliminar={() => onChange(new DataTransfer().files)}
                                                    />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Subir Documentos
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default DocumentosPolizaStep;