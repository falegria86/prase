import { postGuardarCorteCaja } from "@/actions/CortesCajaActions";
import { getInicioActivo } from "@/actions/MovimientosActions";
import { getUsuarios } from "@/actions/SeguridadActions";
import { NuevoCorteDelDiaForm } from "@/components/admin/movimientos/BtnNuevoCorteDelDiaForm";
import { NuevoInicioCajaForm } from "@/components/admin/movimientos/BtnNuevoInicioCajaForm";
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
import { corteCajaSchema } from "@/schemas/admin/movimientos/movimientosSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, CalendarClock, Clock, CreditCard, DollarSign, SaveIcon } from "lucide-react";
import { useEffect, useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
interface ModalCorteCajaProps {
    abierto: boolean;
    alCerrar: () => void;
    usuarioId: number;
}

export function ModalCorteCaja({ abierto, alCerrar, usuarioId }: ModalCorteCajaProps) {
    // Agregar referencias
    const inicioCajaFormRef = useRef<any>(null);
    const corteDiaFormRef = useRef<any>(null);


    const [isPending, startTransition] = useTransition();
    const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
    const [datosCorteCaja, setDatosCorteCaja] = useState<any>(null);
    const [inicioCajaActivo, setInicioCajaActivo] = useState<any>(null);
    const [statusCaja, setStatusCaja] = useState<string | null>(null);
    const [montoInicial, setMontoInicial] = useState<any>(null);
    const [usuarios, setUsuarios] = useState<any>([]);
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
        };

        fetchData();
    }, [usuarioId, alCerrar]);


    const nuevoInicioCajaSchema = z.object({
        TotalEfectivo: z.number().min(1, { message: "El total de efectivo es requerido" }),
        TotalTransferencia: z.number().min(1, { message: "El total de transferencia es requerido" }),
        UsuarioID: z.number().min(1, { message: "El usuario es requerido" }),
        UsuarioAutorizoID: z.number(),
    })


    const form = useForm<z.infer<typeof corteCajaSchema>>({
        resolver: zodResolver(corteCajaSchema),
        defaultValues: {
            SaldoReal: 0,
            TotalEfectivoCapturado: 0,
            TotalTarjetaCapturado: 0,
            TotalTransferenciaCapturado: 0,
            Observaciones: "",
        },
    });

    // const manejarConfirmacion = () => {
    //     startTransition(async () => {
    //         try {
    //             const respuesta = await getCorteUsuario(usuarioId);
    //             if (respuesta) {
    //                 setDatosCorteCaja(respuesta);
    //                 setConfirmacionAbierta(false);
    //                 form.setValue("SaldoReal", respuesta.SaldoReal);
    //                 form.setValue("TotalEfectivoCapturado", respuesta.TotalEfectivoCapturado);
    //                 form.setValue("TotalTarjetaCapturado", respuesta.TotalTarjetaCapturado);
    //                 form.setValue("TotalTransferenciaCapturado", respuesta.TotalTransferenciaCapturado);
    //             } else {
    //                 toast({
    //                     title: "Error",
    //                     description: "No se pudo obtener la información del corte",
    //                     variant: "destructive",
    //                 });
    //                 alCerrar();
    //             }
    //         } catch (error) {
    //             toast({
    //                 title: "Error",
    //                 description: "Ocurrió un error al procesar la solicitud",
    //                 variant: "destructive",
    //             });
    //             alCerrar();
    //         }
    //     });
    // };

    const onSubmit = async (valores: z.infer<typeof corteCajaSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await postGuardarCorteCaja({
                    ...valores,
                    usuarioID: usuarioId,
                });

                if (respuesta) {
                    toast({
                        title: "Corte guardado",
                        description: "El corte de caja se ha guardado exitosamente",
                    });
                    alCerrar();
                    window.location.reload();
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudo guardar el corte de caja",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al guardar el corte",
                    variant: "destructive",
                });
            }
        });
    };

    if (!abierto) return null;

    // if (confirmacionAbierta) {
    //     return (
    //         <Dialog open={confirmacionAbierta} onOpenChange={() => setConfirmacionAbierta(false)}>
    //             <DialogContent>
    //                 <DialogHeader>
    //                     <DialogTitle>Confirmar Corte de Caja</DialogTitle>
    //                     <DialogDescription>
    //                         ¿Estás seguro de que deseas realizar el corte de caja? Esta acción no se puede deshacer.
    //                     </DialogDescription>
    //                 </DialogHeader>
    //                 <div className="flex justify-end gap-4 mt-4">
    //                     <Button variant="outline" onClick={() => setConfirmacionAbierta(false)}>
    //                         Cancelar
    //                     </Button>
    //                     <Button onClick={manejarConfirmacion} disabled={isPending}>
    //                         Confirmar
    //                     </Button>
    //                 </div>
    //             </DialogContent>
    //         </Dialog>
    //     );
    // }

    // if (!datosCorteCaja) {
    //     setConfirmacionAbierta(true);
    //     return null;
    // }

    // Función para manejar el guardado
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

        // // Formatear fechas
        // const fechaInicioFormateada = format(new Date(inicioCajaActivo?.FechaInicio), "dd/MM/yyyy HH:mm", { locale: es })
        // const fechaActualizacionFormateada = format(new Date(inicioCajaActivo?.FechaActualizacion), "dd/MM/yyyy HH:mm", { locale: es })

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
                            {/* <div className="flex items-center space-x-3">
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
                            </div> */}
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
                    <InicioCajaForm param={statusCaja} />
                </div>
                <div>
                    <NuevoCorteDelDiaForm montoInicial={montoInicial} usuarioId={usuarioId} ref={corteDiaFormRef}  />
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