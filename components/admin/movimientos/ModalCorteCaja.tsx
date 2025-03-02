import { getInicioActivo } from "@/actions/MovimientosActions";
import { getUsuarios } from "@/actions/SeguridadActions";
import { NuevoCorteDelDiaForm } from "@/components/admin/movimientos/BtnNuevoCorteDelDiaForm";
import { NuevoInicioCajaForm } from "@/components/admin/movimientos/BtnNuevoInicioCajaForm";
import { LoaderModales } from "@/components/LoaderModales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, CalendarClock, Clock, CreditCard, DollarSign, SaveIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
interface ModalCorteCajaProps {
    abierto: boolean;
    alCerrar: () => void;
    usuarioId: number;
}

export function ModalCorteCaja({ abierto, alCerrar, usuarioId }: ModalCorteCajaProps) {
    // Agregar referencias
    const inicioCajaFormRef = useRef<any>(null);
    const corteDiaFormRef = useRef<any>(null);


    const [isPending] = useTransition();
    const [inicioCajaActivo, setInicioCajaActivo] = useState<any>(null);
    const [statusCaja, setStatusCaja] = useState<string | null>(null);
    const [montoInicial, setMontoInicial] = useState<any>(null);
    const [usuarios, setUsuarios] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const usuarios = await getUsuarios();
            if (!usuarios || usuarios.length === 0) {
                toast({
                    title: "Error",
                    description: "Error al obtener información de empleados, intente nuevamente.",
                    variant: "destructive",
                });
                alCerrar();
                return;
            } else {
                setUsuarios(usuarios);
            }
            setIsLoading(true)
            const respuesta = await getInicioActivo(usuarioId);
            if (respuesta) {
                setInicioCajaActivo(respuesta);
                setStatusCaja(respuesta.Estatus)
                setMontoInicial(respuesta.MontoInicial)
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo obtener la información del inicio de caja",
                    variant: "destructive",
                });
                alCerrar();
            }
            setIsLoading(false)
        };

        fetchData();
    }, [usuarioId, alCerrar]);


    if (!abierto) return null;

    const handleGuardarTodo = async () => {
        try {
            // Si hay un inicio de caja activo, solo guardar el corte
            if (statusCaja === "Activo") {
                await corteDiaFormRef.current?.submitForm();
            }
            // Si no hay inicio activo, guardar ambos formularios
            else {
                await inicioCajaFormRef.current?.submitForm();
                await corteDiaFormRef.current?.submitForm();
            }

            toast({
                title: "Éxito",
                description: "Operación realizada correctamente",
            });
            alCerrar();
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: "Ocurrió un error al guardar",
                variant: "destructive",
            });
        }
    };

    const InicioCajaForm: React.FC<{ param: string | null }> = ({ param }) => {
        const formatearMoneda = (monto: string) => {
            return new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
            }).format(Number.parseFloat(monto))
        }

        // Formatear fechas
        const fechaInicioFormateada = inicioCajaActivo?.FechaInicio
            ? format(new Date(inicioCajaActivo.FechaInicio), "dd/MM/yyyy HH:mm", { locale: es })
            : "Fecha no disponible";

        const fechaActualizacionFormateada = inicioCajaActivo?.FechaActualizacion
            ? format(new Date(inicioCajaActivo.FechaActualizacion), "dd/MM/yyyy HH:mm", { locale: es })
            : "Fecha no disponible";

        if (param == "Activo") {
            return (
                <Card className="w-full mx-auto rounded-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold">Inicio de Caja #{inicioCajaActivo?.InicioCajaID}</CardTitle>
                        <Badge
                            variant={inicioCajaActivo.Estatus === "Activo" ? "default" : "secondary"}
                            className={inicioCajaActivo.Estatus === "Activo" ? "bg-green-500" : ""}
                        >
                            {inicioCajaActivo.Estatus}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center space-x-3">
                                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Fecha de inicio</p>
                                    <p className="text-sm text-muted-foreground">{fechaInicioFormateada}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Última actualización</p>
                                    <p className="text-sm text-muted-foreground">{fechaActualizacionFormateada}</p>
                                </div>
                            </div>
                            {/* 
                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Monto inicial</p>
                                    <p className="text-sm text-muted-foreground">{formatearMoneda(inicioCajaActivo.MontoInicial)}</p>
                                </div>
                            </div> */}

                            <div className="flex items-center space-x-3">
                                <Banknote className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Total efectivo</p>
                                    <p className="text-sm text-muted-foreground">{formatearMoneda(inicioCajaActivo.TotalEfectivo)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Total transferencia</p>
                                    <p className="text-sm text-muted-foreground">{formatearMoneda(inicioCajaActivo.TotalTransferencia)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Total</p>
                                    <p className="text-sm font-bold">
                                        {formatearMoneda((Number.parseFloat(inicioCajaActivo.TotalEfectivo) + Number.parseFloat(inicioCajaActivo.TotalTransferencia)).toString())}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        } else {
            return (
                <>
                    <NuevoInicioCajaForm
                        ref={inicioCajaFormRef}
                        usuarioAutorizoId={usuarioId}
                        usuarios={usuarios}
                    />
                </>
            )
        }
    }

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Corte del dia</DialogTitle>
                </DialogHeader>
                <div>
                    {isLoading ? (
                        <LoaderModales texto="Cargando inicio de caja" />
                    ) : (
                        <InicioCajaForm param={statusCaja} />
                    )}
                </div>
                <div>
                    <NuevoCorteDelDiaForm montoInicial={montoInicial} usuarioId={usuarioId} ref={corteDiaFormRef} />
                </div>
                {/* Agregar botón único en el footer */}
                <div className="flex justify-end gap-4 mt-4">
                    <Button variant="outline" onClick={alCerrar}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGuardarTodo} disabled={isPending}>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Guardar Todo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}