"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/format"
import { iGetIniciosCaja } from "@/interfaces/MovimientosInterface"
import { deleteInicioCaja } from "@/actions/MovimientosActions"
import { EditarInicioCajaForm } from "./EditarInicioCajaForm"
import { VisualizarFirma } from "./VisualizarFirma"
import { formatearFecha } from "@/lib/format-date"

interface TableIniciosCajaProps {
    iniciosCaja: iGetIniciosCaja[]
}

export const TableIniciosCaja = ({ iniciosCaja }: TableIniciosCajaProps) => {
    const [inicioCajaSeleccionado, setInicioCajaSeleccionado] = useState<iGetIniciosCaja | null>(null)
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
    const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const manejarEliminar = async () => {
        if (!inicioCajaSeleccionado) return

        try {
            const respuesta = await deleteInicioCaja(inicioCajaSeleccionado.InicioCajaID)

            if (respuesta?.error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al eliminar el inicio de caja",
                    variant: "destructive",
                })
                return
            }

            toast({
                title: "Éxito",
                description: "Inicio de caja eliminado correctamente",
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Ocurrió un error al eliminar el inicio de caja",
                variant: "destructive",
            })
        }
    }

    return (
        <>
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el inicio de caja permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={manejarEliminar}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha de Inicio</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Monto Inicial</TableHead>
                            <TableHead>Total Efectivo</TableHead>
                            <TableHead>Total Transferencia</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {iniciosCaja.map((inicio) => (
                            <TableRow key={inicio.InicioCajaID}>
                                <TableCell>{formatearFecha(inicio.FechaInicio)}</TableCell>
                                <TableCell>{inicio.Usuario.NombreUsuario}</TableCell>
                                <TableCell>{formatCurrency(Number(inicio.MontoInicial))}</TableCell>
                                <TableCell>{formatCurrency(Number(inicio.TotalEfectivo))}</TableCell>
                                <TableCell>{formatCurrency(Number(inicio.TotalTransferencia))}</TableCell>
                                <TableCell>{inicio.Estatus}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                className="h-4 w-4 cursor-pointer text-gray-600"
                                                onClick={() => {
                                                    setInicioCajaSeleccionado(inicio)
                                                    setModalEditarAbierto(true)
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Eye
                                                className="h-4 w-4 cursor-pointer text-gray-600"
                                                onClick={() => {
                                                    setInicioCajaSeleccionado(inicio)
                                                    setModalFirmaAbierto(true)
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>Ver firma</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    className="h-4 w-4 cursor-pointer text-gray-600"
                                                    onClick={() => setInicioCajaSeleccionado(inicio)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>Eliminar</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            <Dialog
                open={modalEditarAbierto}
                onOpenChange={() => {
                    setInicioCajaSeleccionado(null)
                    setModalEditarAbierto(false)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Inicio de Caja</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del inicio de caja del {formatearFecha(inicioCajaSeleccionado?.FechaInicio || new Date())}
                        </DialogDescription>
                    </DialogHeader>
                    {inicioCajaSeleccionado && (
                        <EditarInicioCajaForm
                            inicioCaja={inicioCajaSeleccionado}
                            alGuardar={() => {
                                setInicioCajaSeleccionado(null)
                                setModalEditarAbierto(false)
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={modalFirmaAbierto}
                onOpenChange={() => {
                    setInicioCajaSeleccionado(null)
                    setModalFirmaAbierto(false)
                }}
            >
                <DialogContent>
                    {inicioCajaSeleccionado && (
                        <VisualizarFirma
                            firma={inicioCajaSeleccionado.FirmaElectronica}
                            usuario={inicioCajaSeleccionado.Usuario.NombreUsuario}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}