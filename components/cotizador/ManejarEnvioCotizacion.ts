import { jsPDF } from 'jspdf';
import { z } from 'zod';
import { nuevaCotizacionSchema } from '@/schemas/cotizadorSchema';
import { iGetTiposVehiculo, iGetUsosVehiculo } from '@/interfaces/CatVehiculosInterface';
import { iPostCotizacion, Detalle, iSendMail } from '@/interfaces/CotizacionInterface';
import { generarPDFCotizacion } from './GenerarPDFCotizacion';
import { postCotizacion, sendMail } from '@/actions/CotizadorActions';

type FormData = z.infer<typeof nuevaCotizacionSchema>;

interface ManejarEnvioCotizacionProps {
    datosFormulario: FormData;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
}

export const manejarEnvioCotizacion = async ({
    datosFormulario,
    tiposVehiculo,
    usosVehiculo
}: ManejarEnvioCotizacionProps) => {
        const obtenerPDFBase64 = (doc: jsPDF): string => {
        const pdfBase64 = doc.output('datauristring');
        return pdfBase64.split(',')[1];
    };

    // Mapear detalles para la API
    const mapearDetallesParaAPI = (detalles: any[]): Detalle[] => {
        return detalles.map(detalle => ({
            CoberturaID: detalle.CoberturaID,
            NombreCobertura: detalle.NombreCobertura,
            Descripcion: detalle.Descripcion,
            MontoSumaAsegurada: detalle.MontoSumaAsegurada,
            DeducibleID: detalle.DeducibleID,
            MontoDeducible: detalle.MontoDeducible,
            PrimaCalculada: detalle.PrimaCalculada,
            PorcentajePrimaAplicado: detalle.PorcentajePrimaAplicado,
            ValorAseguradoUsado: detalle.ValorAseguradoUsado,
            Obligatoria: detalle.Obligatoria,
            DisplayDeducible: detalle.DisplayDeducible,
            TipoMoneda: detalle.TipoMoneda,
            EsAmparada: detalle.EsAmparada,
            SumaAseguradaPorPasajero: detalle.SumaAseguradaPorPasajero,
            TipoDeducible: detalle.TipoDeducible,
            DisplaySumaAsegurada: detalle.DisplaySumaAsegurada
        }));
    };

    try {
        const cotizacionParaAPI: iPostCotizacion = {
            ...datosFormulario,
            inicioVigencia: new Date(datosFormulario.inicioVigencia),
            finVigencia: new Date(datosFormulario.finVigencia),
            detalles: mapearDetallesParaAPI(datosFormulario.detalles),
            SumaAsegurada: datosFormulario.SumaAsegurada.toString(),
            minSumaAsegurada: datosFormulario.minSumaAsegurada?.toString() || "0",
            maxSumaAsegurada: datosFormulario.maxSumaAsegurada?.toString() || "0",
        };

        const respuestaCotizacion = await postCotizacion(cotizacionParaAPI);
        if (!respuestaCotizacion) {
            throw new Error('Error al crear la cotización');
        }

        const doc = generarPDFCotizacion({
            datos: datosFormulario,
            tiposVehiculo,
            usosVehiculo
        });

        const pdfBase64 = obtenerPDFBase64(doc as any);

        const datosCorreo: iSendMail = {
            to: datosFormulario.Correo,
            subject: 'Cotización PRASE Seguros',
            attachmentBase64: pdfBase64,
            filename: `cotizacion_${datosFormulario.marcaNombre}_${datosFormulario.modeloNombre}.pdf`
        };

        const respuestaCorreo = await sendMail(datosCorreo);

        return {
            success: true,
            cotizacion: respuestaCotizacion,
            correoEnviado: !!respuestaCorreo
        };

    } catch (error) {
        console.error('Error en el proceso:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};