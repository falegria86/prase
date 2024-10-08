"use client";

import { useToast } from '@/hooks/use-toast';
import {
    iGetAllReglaNegocio
} from '@/interfaces/ReglasNegocios';
import { useRouter } from "next/navigation";
import { useState, useTransition } from 'react';
import { Edit, Trash2 } from "lucide-react";
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
import { deleteReglaNegocio } from '@/actions/ReglasNegocio';
import Loading from '@/app/(protected)/loading';
import { EditarReglaForm } from './EditarReglaForm';

interface Props {
    reglas: iGetAllReglaNegocio[];
}

export const TableReglasNegocio = ({ reglas }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedRegla, setSelectedRegla] = useState<iGetAllReglaNegocio | null>(null);
    const [editRegla, setEditRegla] = useState<iGetAllReglaNegocio | null>(null);
    const [editReglaModalOpen, setEditReglaModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectRegla = (regla: iGetAllReglaNegocio) => {
        setSelectedRegla(regla);
    };

    const handleDelete = async () => {
        if (!selectedRegla) return;

        startTransition(async () => {
            try {
                await deleteReglaNegocio(selectedRegla.ReglaID);

                toast({
                    title: "Regla eliminada",
                    description: "La regla se eliminó correctamente.",
                    variant: "default",
                });
                router.refresh();

            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar la regla.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            {isPending && <Loading />}
            <AlertDialog>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la regla de negocio{" "}
                            <strong>{selectedRegla?.NombreRegla}</strong> y eliminará todos sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => handleDelete()}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Tipo de Regla</TableHead>
                            <TableHead>Cobertura Asociada </TableHead>
                            <TableHead>Es Global</TableHead>
                            <TableHead>Estado </TableHead>
                            <TableHead>Acciones </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reglas.map((regla) => (
                            <TableRow key={regla.ReglaID}>
                                <TableCell>{regla.NombreRegla}</TableCell>
                                <TableCell>{regla.Descripcion}</TableCell>
                                <TableCell>{regla.TipoRegla}</TableCell>
                                <TableCell>{regla.TipoRegla}</TableCell>
                                {/* <TableCell>{regla.CoberturaAsociada}</TableCell> */}
                                <TableCell>{regla.EsGlobal ? 'Si' : 'No'}</TableCell>
                                <TableCell>{regla.Activa ? 'Activa' : 'Inactiva'}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditRegla(regla);
                                                    setEditReglaModalOpen(true);
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
                                                    onClick={() => handleSelectRegla(regla)}
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

            {/* Modal para editar la regla */}
            <Dialog open={editReglaModalOpen} onOpenChange={() => {
                setEditRegla(null);
                setEditReglaModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar regla de negocio</DialogTitle>
                    </DialogHeader>
                    {editRegla && (
                        <EditarReglaForm regla={editRegla} onSave={() => {
                            setEditRegla(null);
                            setEditReglaModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}