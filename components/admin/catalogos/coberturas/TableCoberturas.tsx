"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

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
import { useToast } from "@/hooks/use-toast";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { deletePaqueteCobertura } from "@/actions/CatCoberturasActions";
import Loading from "@/app/(protected)/loading";
import { EditarCoberturaForm } from "./EditarCoberturaForm";

interface Props {
    coberturas: iGetCoberturas[];
}

export const TableCoberturas = ({ coberturas }: Props) => {
    const [isPending, startTransition] = useTransition();
    const [selectedCobertura, setSelectedCobertura] = useState<iGetCoberturas | null>(null);
    const [editCobertura, setEditCobertura] = useState<iGetCoberturas | null>(null);
    const [editCoberturaModalOpen, setEditCoberturaModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSelectCobertura = (cobertura: iGetCoberturas) => {
        setSelectedCobertura(cobertura);
    };

    const handleDelete = async () => {
        if (!selectedCobertura) return;

        startTransition(async () => {
            try {
                await deletePaqueteCobertura(selectedCobertura.CoberturaID);

                toast({
                    title: "Cobertura eliminada",
                    description: `La cobertura ${selectedCobertura.NombreCobertura} se ha eliminado exitosamente.`,
                    variant: "default",
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Hubo un problema al eliminar la cobertura.",
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la cobertura{" "}
                            <strong>{selectedCobertura?.NombreCobertura}</strong> y eliminará todos sus datos.
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
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Cobertura</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Prima Base</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coberturas.map((cobertura) => (
                            <TableRow key={cobertura.CoberturaID}>
                                <TableCell className="font-medium">{cobertura.CoberturaID}</TableCell>
                                <TableCell>{cobertura.NombreCobertura}</TableCell>
                                <TableCell>{cobertura.Descripcion}</TableCell>
                                <TableCell>{cobertura.PrimaBase}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Edit
                                                size={16}
                                                className="text-gray-600 cursor-pointer"
                                                onClick={() => {
                                                    setEditCobertura(cobertura);
                                                    setEditCoberturaModalOpen(true);
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Editar cobertura
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertDialogTrigger asChild>
                                                <Trash2
                                                    size={16}
                                                    className="text-gray-600 cursor-pointer"
                                                    onClick={() => handleSelectCobertura(cobertura)}
                                                />
                                            </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Eliminar cobertura
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AlertDialog>

            {/* Modal para editar cobertura */}
            <Dialog open={editCoberturaModalOpen} onOpenChange={() => {
                setEditCobertura(null);
                setEditCoberturaModalOpen(false);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cobertura</DialogTitle>
                    </DialogHeader>
                    {editCobertura && (
                        <EditarCoberturaForm cobertura={editCobertura} onSave={() => {
                            setEditCobertura(null);
                            setEditCoberturaModalOpen(false);
                        }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
