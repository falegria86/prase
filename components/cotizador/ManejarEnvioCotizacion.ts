import { jsPDF } from "jspdf";
import { z } from "zod";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";
import {
  iGetTiposVehiculo,
  iGetUsosVehiculo,
} from "@/interfaces/CatVehiculosInterface";
import {
  iSendMail,
} from "@/interfaces/CotizacionInterface";
import { generarPDFCotizacion } from "./GenerarPDFCotizacion";
import { postCotizacion, sendMail } from "@/actions/CotizadorActions";

type FormData = z.infer<typeof nuevaCotizacionSchema>;

interface ManejarEnvioCotizacionProps {
  datosFormulario: FormData;
  tiposVehiculo: iGetTiposVehiculo[];
  usosVehiculo: iGetUsosVehiculo[];
}

export const manejarEnvioCotizacion = async ({
  datosFormulario,
  tiposVehiculo,
  usosVehiculo,
}: ManejarEnvioCotizacionProps) => {
  const obtenerPDFBase64 = (doc: jsPDF): string => {
    const pdfBase64 = doc.output("datauristring");
    return pdfBase64.split(",")[1];
  };

  const mapearDetallesParaAPI = (detalles: any[]): any => {
    return detalles.map((detalle) => ({
      CoberturaID: detalle.CoberturaID,
      MontoSumaAsegurada: detalle.MontoSumaAsegurada,
      MontoDeducible: detalle.MontoDeducible,
      PrimaCalculada: detalle.PrimaCalculada,
      PorcentajePrimaAplicado: detalle.PorcentajePrimaAplicado,
      ValorAseguradoUsado: detalle.ValorAseguradoUsado,
      DeducibleID: 4,
      NombreCobertura: "",
      Descripcion: "",
      Obligatoria: false,
      DisplayDeducible: "",
      TipoMoneda: "MXN",
      EsAmparada: false,
      SumaAseguradaPorPasajero: false,
      TipoDeducible: "",
    }));
  };

  const datosPDF: any = {
    ...datosFormulario,
    CotizacionID: 0,
    FechaCotizacion: new Date(),
    FechaUltimaActualizacion: null,
    AMIS: "",
    detalles: datosFormulario.detalles as any,
  };

  try {
    const cotizacionParaAPI: any = {
      ...datosFormulario,
      detalles: mapearDetallesParaAPI(datosFormulario.detalles),
      UsuarioID: datosFormulario.UsuarioID,
      PrimaTotal: datosFormulario.PrimaTotal,
      EstadoCotizacion: datosFormulario.EstadoCotizacion,
      TipoPagoID: datosFormulario.TipoPagoID,
      PorcentajeDescuento: datosFormulario.PorcentajeDescuento,
      DerechoPoliza: datosFormulario.DerechoPoliza,
      TipoSumaAseguradaID: datosFormulario.TipoSumaAseguradaID,
      SumaAsegurada: datosFormulario.SumaAsegurada.toString(),
      PeriodoGracia: datosFormulario.PeriodoGracia,
      PaqueteCoberturaID: datosFormulario.PaqueteCoberturaID,
      UsoVehiculo: datosFormulario.UsoVehiculo,
      TipoVehiculo: datosFormulario.TipoVehiculo,
      NombrePersona: datosFormulario.NombrePersona,
      UnidadSalvamento: datosFormulario.UnidadSalvamento,
      VIN: datosFormulario.VIN,
      CP: datosFormulario.CP,
      Marca: datosFormulario.Marca,
      Submarca: datosFormulario.Submarca,
      Modelo: datosFormulario.Modelo,
      Version: datosFormulario.Version,
      Correo: datosFormulario.Correo,
      Telefono: datosFormulario.Telefono,
    };

    const respuestaCotizacion = await postCotizacion(cotizacionParaAPI);
    // if (!respuestaCotizacion) {
    //   throw new Error("Error al crear la cotización");
    // }

    const doc = await generarPDFCotizacion({
      datos: datosPDF,
      tiposVehiculo,
      usosVehiculo,
      isSave: false,
    });

    const pdfBase64 = obtenerPDFBase64(doc);

    const datosCorreo: iSendMail = {
      to: datosFormulario.Correo || "",
      subject: "Cotización PRASE Seguros",
      attachmentBase64: pdfBase64,
      filename: `cotizacion_${datosFormulario.Marca}_${datosFormulario.Submarca}.pdf`,
    };

    const respuestaCorreo = await sendMail(datosCorreo);

    return {
      success: true,
      cotizacion: respuestaCotizacion,
      correoEnviado: !!respuestaCorreo,
    };
  } catch (error) {
    console.error("Error en el proceso:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};
