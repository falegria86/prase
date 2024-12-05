"use client";

import { useState, useTransition } from "react";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import {
  iGetTiposVehiculo,
  iGetUsosVehiculo,
} from "@/interfaces/CatVehiculosInterface";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Phone, Mail, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditarCotizacionForm } from "./EditarCotizacionForm";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { deleteCotizacion } from "@/actions/CotizadorActions";
import Loading from "@/app/(protected)/loading";
import { FiltrosCotizaciones } from "./FiltrosCotizaciones";
import { generarPDFCotizacion } from "@/components/cotizador/GenerarPDFCotizacion";

interface Props {
  cotizaciones: iGetCotizacion[];
  tiposVehiculo: iGetTiposVehiculo[];
  usosVehiculo: iGetUsosVehiculo[];
}

export const TableCotizaciones = ({
  cotizaciones,
  tiposVehiculo,
  usosVehiculo,
}: Props) => {
  const [cotizacionSeleccionada, setCotizacionSeleccionada] =
    useState<iGetCotizacion | null>(null);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [cotizacionesFiltradas, setCotizacionesFiltradas] =
    useState<iGetCotizacion[]>(cotizaciones);
  const { toast } = useToast();
  const router = useRouter();

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const obtenerNombreTipoVehiculo = (tipoId: number) => {
    return (
      tiposVehiculo.find((tipo) => tipo.TipoID === tipoId)?.Nombre ||
      "No especificado"
    );
  };

  const obtenerNombreUsoVehiculo = (usoId: number) => {
    return (
      usosVehiculo.find((uso) => uso.UsoID === usoId)?.Nombre ||
      "No especificado"
    );
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "REGISTRO":
        return "default";
      case "EMITIDA":
        return "success";
      case "RECHAZADA":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleEliminar = async () => {
    if (!cotizacionSeleccionada) return;

    startTransition(async () => {
      try {
        const respuesta = await deleteCotizacion(
          cotizacionSeleccionada.CotizacionID
        );

        if (!respuesta) {
          toast({
            title: "Error",
            description: "Hubo un problema al eliminar la cotización.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Cotización eliminada",
          description: "La cotización se eliminó correctamente.",
          variant: "default",
        });

        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar la cotización.",
          variant: "destructive",
        });
      }
    });
  };

  const manejarDescargaPDF = (cotizacion: iGetCotizacion) => {
    // Preparar los datos necesarios para generar el PDF
    const datosCotizacion = {
      UsuarioID: cotizacion.UsuarioID,
      EstadoCotizacion: cotizacion.EstadoCotizacion,
      PrimaTotal: Number(cotizacion.PrimaTotal),
      TipoPagoID: cotizacion.TipoPagoID,
      PorcentajeDescuento: Number(cotizacion.PorcentajeDescuento),
      DerechoPoliza: Number(cotizacion.DerechoPoliza),
      TipoSumaAseguradaID: cotizacion.TipoSumaAseguradaID,
      SumaAsegurada: Number(cotizacion.SumaAsegurada),
      PeriodoGracia: cotizacion.PeriodoGracia,
      UsoVehiculo: cotizacion.UsoVehiculo,
      TipoVehiculo: cotizacion.TipoVehiculo,
      meses: 12, // Valor por defecto
      vigencia: "Anual", // Valor por defecto
      NombrePersona: cotizacion.NombrePersona,
      Correo: cotizacion.Correo || "",
      Telefono: cotizacion.Telefono || "",
      UnidadSalvamento: Boolean(cotizacion.UnidadSalvamento),
      VIN: cotizacion.VIN,
      CP: cotizacion.CP,
      Marca: cotizacion.Marca,
      Submarca: cotizacion.Submarca,
      Modelo: cotizacion.Modelo,
      Version: cotizacion.Version,
      inicioVigencia: new Date(),
      finVigencia: cotizacion.FechaCotizacion.toString(),
      detalles: cotizacion.detalles,
      versionNombre: cotizacion.Version,
      marcaNombre: cotizacion.Marca,
      modeloNombre: cotizacion.Submarca,
      Estado: "",
      minSumaAsegurada: 0,
      maxSumaAsegurada: 0,
      PaqueteCoberturaID: cotizacion.PaqueteCoberturaID,
    };

    try {
      generarPDFCotizacion({
        datos: datosCotizacion,
        tiposVehiculo,
        usosVehiculo,
      });

      toast({
        title: "PDF generado",
        description: "El PDF se ha descargado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl">
      {isPending && <Loading />}

      <FiltrosCotizaciones
        cotizaciones={cotizaciones}
        onFiltrarCotizaciones={setCotizacionesFiltradas}
      />

      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la cotización
              {cotizacionSeleccionada && (
                <>
                  {" "}
                  del cliente{" "}
                  <strong>{cotizacionSeleccionada.NombrePersona}</strong>
                </>
              )}{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md"
              variant="destructive"
              onClick={handleEliminar}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Información del Cliente</TableHead>
              <TableHead>Uso del Vehículo</TableHead>
              <TableHead>Prima Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cotizacionesFiltradas.map((cotizacion) => (
              <TableRow key={cotizacion.CotizacionID}>
                <TableCell>
                  {formatearFecha(cotizacion.FechaCotizacion)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{cotizacion.NombrePersona}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cotizacion.Telefono || "No especificado"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cotizacion.Correo || "No especificado"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p>
                      Tipo: {obtenerNombreTipoVehiculo(cotizacion.TipoVehiculo)}
                    </p>
                    <p>
                      Uso: {obtenerNombreUsoVehiculo(cotizacion.UsoVehiculo)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(cotizacion.PrimaTotal))}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={obtenerColorEstado(cotizacion.EstadoCotizacion)}
                  >
                    {cotizacion.EstadoCotizacion}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger>
                      <Download
                        size={16}
                        className="text-gray-600 cursor-pointer"
                        onClick={() => manejarDescargaPDF(cotizacion)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Descargar PDF</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Edit
                        size={16}
                        className="text-gray-600 cursor-pointer"
                        onClick={() => {
                          setCotizacionSeleccionada(cotizacion);
                          setModalEdicionAbierto(true);
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <AlertDialogTrigger asChild>
                        <Trash2
                          size={16}
                          className="text-gray-600 cursor-pointer"
                          onClick={() => setCotizacionSeleccionada(cotizacion)}
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
        open={modalEdicionAbierto}
        onOpenChange={() => {
          setCotizacionSeleccionada(null);
          setModalEdicionAbierto(false);
        }}
      >
        <DialogContent className="max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>Editar Cotización</DialogTitle>
          </DialogHeader>
          {cotizacionSeleccionada && (
            <EditarCotizacionForm
              cotizacion={cotizacionSeleccionada}
              onGuardar={() => {
                setCotizacionSeleccionada(null);
                setModalEdicionAbierto(false);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
