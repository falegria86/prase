"use client"
// interfaces
import {
    iGetVehiculo
} from '@/interfaces/VehiculoInterface';

// actions
import {
    deleteVehiculo
} from '@/actions/vehiculoActions';

import Loading from '@/app/(protected)/loading';
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from 'react';
import { EditarVehiculoForm } from './EditarVehiculoModal';

interface Props {
    vehiculos: iGetVehiculo[];
}

export const TableVehiculos = ({ vehiculos }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedVehiculo, setSelectedVehiculo] = useState<iGetVehiculo | null>(null);
    const [editVehiculo, setEditVehiculo] = useState<iGetVehiculo | null>(null);
    const [editVehiculoModalOpen, setEditVehiculoModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectVehiculo = (vehiculo: iGetVehiculo) => {
        setSelectedVehiculo(vehiculo);
    };

    const handleDelete = async () => {
        if (!selectedVehiculo) return;
        startTransition(async () => {
            try {
                const res = await deleteVehiculo(selectedVehiculo.VehiculoID);
                if (!res) {
                    toast({
                        title: "Error",
                        description: "Hubo un problema al eliminar el vehículo.",
                        variant: "destructive",
                    });
                    return;
                } else {
                    toast({
                        title: "Vehículo eliminado",
                        description: "El vehículo se eliminó correctamente.",
                        variant: "default",
                    });
                    router.refresh();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar el vehículo.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <>
            {isPending && <Loading />}
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el vehículo{" "}
                            <strong>{selectedVehiculo?.Marca} {selectedVehiculo?.Modelo} {selectedVehiculo?.AnoFabricacion}</strong> y eliminará todos sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='rounded-md'>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className='rounded-md'
                            variant="destructive"
                            onClick={() => handleDelete()}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Año de Fabricación</TableHead>
                            <TableHead>Tipo de Vehículo</TableHead>
                            <TableHead>Valor Vehículo</TableHead>
                            <TableHead>Valor Factura</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            <TableHead>Uso de Vehículo</TableHead>
                            <TableHead>Zona de Residencia</TableHead>
                            <TableHead>Salvamento</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehiculos.map((vehiculo) => (
                            <TableRow key={vehiculo.VehiculoID}>
                                <TableCell>{vehiculo.Marca}</TableCell>
                                <TableCell>{vehiculo.Modelo}</TableCell>
                                <TableCell>{vehiculo.AnoFabricacion}</TableCell>
                                <TableCell>{vehiculo.TipoVehiculo}</TableCell>
                                <TableCell>{vehiculo.ValorVehiculo}</TableCell>
                                <TableCell>{vehiculo.ValorFactura}</TableCell>
                                <TableCell>
                                    {new Date(vehiculo.FechaRegistro).toLocaleDateString()} {/* Convierte a Date y formatea */}
                                </TableCell>
                                <TableCell>{vehiculo.UsoVehiculo}</TableCell>
                                <TableCell>{vehiculo.ZonaResidencia}</TableCell>
                                <TableCell>{vehiculo.Salvamento}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditVehiculo(vehiculo);
                                                    setEditVehiculoModalOpen(true);
                                                }}
                                            >
                                            </Edit>
                                        </TooltipTrigger>
                                        <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectVehiculo(vehiculo)}
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

            {/*  */}
            <Dialog
                open={editVehiculoModalOpen}
                onOpenChange={() => {
                    setEditVehiculo(null);
                    setEditVehiculoModalOpen(false);
                }}>
                <DialogContent aria-describedby="dialog-description" className="max-w-[80vw] ">
                    <DialogHeader>
                        <DialogTitle>Editar regla de negocio</DialogTitle>
                    </DialogHeader>
                    <p id="dialog-description" className="sr-only">
                        En este formulario puedes editar los detalles de el cliente seleccionado.
                    </p>
                    {editVehiculo && (
                        <EditarVehiculoForm
                            vehiculo={editVehiculo}
                            onSave={() => {
                                setEditVehiculo(null);
                                setEditVehiculoModalOpen(false);
                            }} />
                    )}
                </DialogContent>
            </Dialog >
        </>
    )

}