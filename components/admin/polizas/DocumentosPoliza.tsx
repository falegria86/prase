import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentosPolizaStep } from "./DocumentosPolizaStep";
import { Files, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { postDocumento } from "@/actions/PolizasActions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(protected)/loading";

interface DocumentosPolizaProps {
    polizaId: number;
    tieneDocumentos: boolean;
}

interface ArchivosBase64 {
    ine?: string;
    tarjetaCirculacion?: string;
    cartaFactura?: string;
    comprobanteDomicilio?: string;
    fotoFrontal?: string;
    fotoTrasera?: string;
    fotoLateralIzquierda?: string;
    fotoLateralDerecha?: string;
    fotoVIN?: string;
}

export const DocumentosPoliza = ({ polizaId, tieneDocumentos }: DocumentosPolizaProps) => {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const manejarDocumentos = async (documentos: ArchivosBase64) => {
        setIsLoading(true);
        let hayErrores = false;

        try {
            await Promise.allSettled(
                Object.entries(documentos).map(async ([nombre, base64]) => {
                    if (!base64) return;

                    const documento = {
                        Base64: base64,
                        PolizaID: polizaId,
                        DocumentoID: 1,
                        EstadoDocumento: "Activo"
                    };
console.log(documento)
                    const respuesta = await postDocumento(documento);
                    console.log(respuesta)
                    if (!respuesta || respuesta.statusCode === 413) {
                        hayErrores = true;
                        toast({
                            title: "Error al subir documento",
                            description: `El archivo ${nombre} es demasiado grande`,
                            variant: "destructive"
                        });
                        return;
                    }

                    if (!respuesta) {
                        hayErrores = true;
                        toast({
                            title: "Error al subir documento",
                            description: `No se pudo subir ${nombre}`,
                            variant: "destructive"
                        });
                    }
                })
            );

            if (!hayErrores) {
                toast({
                    title: "Documentos guardados",
                    description: "Los documentos se han guardado exitosamente"
                });
                setModalAbierto(false);
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Error inesperado",
                description: "Ocurrió un error al procesar los documentos",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (tieneDocumentos) {
        return (
            <Badge variant="secondary">
                <Files className="h-4 w-4 mr-2" />
                Documentos cargados
            </Badge>
        );
    }

    return (
        <>
            {isLoading && <Loading />}
            <Button onClick={() => setModalAbierto(true)} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Cargar documentos
            </Button>

            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogContent className="max-w-4xl max-h-[600px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cargar documentos de la póliza</DialogTitle>
                    </DialogHeader>
                    <DocumentosPolizaStep alSubmit={manejarDocumentos} />
                </DialogContent>
            </Dialog>
        </>
    );
};