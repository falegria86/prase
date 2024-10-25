"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Trash } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteAsociacionPaqueteCobertura, deleteAllAsociacionesPaqueteCobertura } from "@/actions/CatPaquetesActions"
import Loading from "@/app/(protected)/loading"
import { useToast } from "@/hooks/use-toast"
import { iGetAsociacionPaqueteCobertura } from "@/interfaces/CatPaquetesInterface"

interface AsociacionProps {
  asociaciones: iGetAsociacionPaqueteCobertura[]
}

export const TableAsociaciones = ({ asociaciones }: AsociacionProps) => {
  const [isPending, startTransition] = useTransition()
  const [selectedCobertura, setSelectedCobertura] = useState<{ paqueteId: number; coberturaId: number } | null>(null)
  const [selectedPaquete, setSelectedPaquete] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const asociacionesAgrupadas = asociaciones.reduce((acc, asociacion) => {
    if (!acc[asociacion.PaqueteCoberturaID]) {
      acc[asociacion.PaqueteCoberturaID] = []
    }
    acc[asociacion.PaqueteCoberturaID].push(asociacion)
    return acc
  }, {} as Record<number, typeof asociaciones>)

  const handleDeleteAll = async () => {
    if (!selectedPaquete) return

    startTransition(async () => {
      try {
        await deleteAllAsociacionesPaqueteCobertura(selectedPaquete)
        toast({
          title: "Asociaciones eliminadas",
          description: "Todas las asociaciones del paquete se han eliminado exitosamente.",
          variant: "default",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar las asociaciones.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDeleteCobertura = async () => {
    if (!selectedCobertura) return

    const body = {
      coberturaIds: [selectedCobertura.coberturaId],
      usuario: "admin",
    }

    startTransition(async () => {
      try {
        await deleteAsociacionPaqueteCobertura(selectedCobertura.paqueteId, body)
        toast({
          title: "Cobertura eliminada",
          description: "La cobertura ha sido eliminada exitosamente del paquete.",
          variant: "default",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar la cobertura.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      {isPending && <Loading />}

      <AlertDialog open={!!selectedCobertura} onOpenChange={() => setSelectedCobertura(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cobertura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Deseas eliminar la cobertura seleccionada del paquete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteCobertura}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!selectedPaquete} onOpenChange={() => setSelectedPaquete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todas las coberturas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente todas las coberturas asociadas a este paquete. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteAll}>
              Eliminar todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paquete ID</TableHead>
            <TableHead>Cobertura ID</TableHead>
            <TableHead>Fecha de Asociación</TableHead>
            <TableHead>Obligatoria</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(asociacionesAgrupadas).map(([paqueteId, asociacionesPaquete]) => (
            asociacionesPaquete.map((asociacion, index) => (
              <TableRow key={`${asociacion.PaqueteCoberturaID}-${asociacion.CoberturaID}-${paqueteId}`}>
                {index === 0 && (
                  <TableCell rowSpan={asociacionesPaquete.length}>
                    {asociacion.PaqueteCoberturaID}
                    <Tooltip>
                      <TooltipTrigger>
                        <Trash
                          size={16}
                          className="text-red-600 cursor-pointer ml-2"
                          onClick={() => setSelectedPaquete(asociacion.PaqueteCoberturaID)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Eliminar todas las coberturas</TooltipContent>
                    </Tooltip>
                  </TableCell>
                )}
                <TableCell>{asociacion.CoberturaID}</TableCell>
                <TableCell>{new Date(asociacion.FechaAsociacion).toLocaleDateString()}</TableCell>
                <TableCell>{asociacion.Obligatoria ? "Sí" : "No"}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <Trash2
                        size={16}
                        className="text-gray-600 cursor-pointer"
                        onClick={() =>
                          setSelectedCobertura({
                            paqueteId: asociacion.PaqueteCoberturaID,
                            coberturaId: asociacion.CoberturaID,
                          })
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>Eliminar cobertura</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </>
  )
}