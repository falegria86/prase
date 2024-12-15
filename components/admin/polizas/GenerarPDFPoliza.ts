import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { iGetCoberturas } from "@/interfaces/CatCoberturasInterface";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { iPostPolizaResp } from "@/interfaces/CatPolizas";
import { formatCurrency } from "@/lib/format";

interface GenerarPDFPolizaProps {
    respuestaPoliza: iPostPolizaResp;
    cotizacion: iGetCotizacion;
    coberturas: iGetCoberturas[];
}

export const generarPDFPoliza = async ({
    respuestaPoliza,
    cotizacion,
    coberturas
}: GenerarPDFPolizaProps) => {
    const doc = new jsPDF();
    const MARGEN_X = 15;
    const MARGEN_Y = 15;
    const ANCHO_PAGINA = doc.internal.pageSize.width - MARGEN_X * 2;

    const obtenerNombreCobertura = (coberturaId: number): string => {
        const cobertura = coberturas.find(c => c.CoberturaID === coberturaId);
        return cobertura?.NombreCobertura || `Cobertura ${coberturaId}`;
    };

    const formatearFecha = (fecha: string | Date): string => {
        return new Date(fecha).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const obtenerTextoPago = (numeroPagos: number): string => {
        const tipos = {
            1: "Pago Anual",
            2: "Pago Semestral",
            3: "Pago Cuatrimestral",
            4: "Pago Trimestral"
        };
        return tipos[numeroPagos as keyof typeof tipos] || "Pago Total";
    };

    doc.addImage("/prase-logo.png", "PNG", MARGEN_X, MARGEN_Y, 30, 25);
    doc.setFontSize(12);
    doc.setTextColor(47, 84, 149);
    doc.setFont("helvetica", "bold");
    doc.text("PÓLIZA PRASE SEGUROS", MARGEN_X + 45, MARGEN_Y + 10);
    doc.setFontSize(10);
    doc.text(`POLIZA NO. ${respuestaPoliza.NumeroPoliza}`, MARGEN_X + 180, MARGEN_Y + 20, { align: "right" });

    let posicionY = MARGEN_Y + 35;

    autoTable(doc, {
        startY: posicionY,
        head: [["PÓLIZA"]],
        body: [
            [`Inicio de vigencia: ${formatearFecha(respuestaPoliza.FechaInicio)}`],
            [`Fin de vigencia: ${formatearFecha(respuestaPoliza.FechaFin)}`],
            [`${obtenerTextoPago(respuestaPoliza.NumeroPagos)}: ${formatCurrency(respuestaPoliza.PrimaTotal)}`]
        ],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA }
        },
        headStyles: {
            fillColor: [0, 51, 102],
            halign: 'center'
        }
    });

    posicionY = (doc as any).lastAutoTable.finalY + 6;

    doc.setTextColor(0);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const textoLegal = "PRASE Protección Rápida y Segura A.C. protege el vehículo descrito con antelación, de conformidad con las cláusulas de su constancia de inscripción durante la vigencia establecida, contra los riesgos que aparecen en esta constancia y que figuran con límite de responsabilidad máximo.";

    doc.text(textoLegal, MARGEN_X, posicionY, {
        maxWidth: ANCHO_PAGINA,
        align: "justify"
    });

    posicionY += 12;
    const mitadAncho = ANCHO_PAGINA * 0.48;

    autoTable(doc, {
        startY: posicionY,
        head: [["DATOS DE LA UNIDAD"]],
        body: [
            [`Marca: ${respuestaPoliza.vehiculo.Marca}`],
            [`Submarca: ${respuestaPoliza.vehiculo.Modelo}`],
            [`Modelo: ${respuestaPoliza.vehiculo.AnoFabricacion}`],
            [`VIN: ${respuestaPoliza.vehiculo.VIN || "---"}`]
        ],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: { 0: { cellWidth: mitadAncho } },
        margin: { left: MARGEN_X }
    });

    autoTable(doc, {
        startY: posicionY,
        head: [["DATOS DEL CLIENTE"]],
        body: [
            [`Nombre: ${respuestaPoliza.cliente.NombreCompleto}`],
            [`Teléfono: ${respuestaPoliza.cliente.Telefono}`],
            [`Dirección: ${respuestaPoliza.cliente.Direccion}`]
        ],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: { 0: { cellWidth: mitadAncho } },
        margin: { left: MARGEN_X + mitadAncho + 10 }
    });

    posicionY = Math.max(
        (doc as any).lastAutoTable.finalY,
        (doc as any).previousAutoTable.finalY
    ) + 10;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const textoInspeccion = "La Mutual PRASE Protección Rápida y Segura A.C. podrá en cualquier momento inspeccionar o verificar la existencia y estado físico del vehículo adherido, a cualquier hora y día hábil y por medio de personas debidamente autorizadas por la misma; si el contratante o el asegurado impide u obstaculiza la inspección referida; la Moral se reserva el derecho de rescindir el contrato sin responsabilidad para la moral.";

    doc.text(textoInspeccion, MARGEN_X, posicionY, {
        maxWidth: ANCHO_PAGINA,
        align: "justify"
    });

    posicionY += 12;

    autoTable(doc, {
        startY: posicionY,
        body: [],
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
    });

    posicionY += 8;

    const coberturasTabla = cotizacion.detalles.map(detalle => [
        obtenerNombreCobertura(detalle.CoberturaID),
        formatCurrency(Number(detalle.MontoSumaAsegurada)),
        `${detalle.MontoDeducible}%`,
        formatCurrency(Number(detalle.PrimaCalculada))
    ]);

    autoTable(doc, {
        startY: posicionY,
        head: [["COBERTURA AMPLIA", "SUMA ASEGURADA", "DEDUCIBLE", "PRIMA"]],
        body: coberturasTabla,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA * 0.3 },
            1: { cellWidth: ANCHO_PAGINA * 0.3 },
            2: { cellWidth: ANCHO_PAGINA * 0.2 },
            3: { cellWidth: ANCHO_PAGINA * 0.2 }
        }
    });

    posicionY = (doc as any).lastAutoTable.finalY + 8;

    doc.setFontSize(7);
    const textoPrivacidad = "Aviso de privacidad: para conocer sus términos y condiciones favor de leer las condiciones generales del contrato.";
    const textoArticulo = "Artículo 25 de la ley sobre el contrato del seguro: si el contrato celebrado o sus modificaciones no concordaren con la oferta, el asociado podrá pedir la rectificación correspondiente dentro de los treinta días que sigan al día en que reciba el contrato. Transcurrido ese plazo se considerarán aceptadas las estipulaciones del contrato o de sus modificaciones. En testimonio de lo cual la compañía firma el presente contrato.";

    doc.text([textoPrivacidad, textoArticulo], MARGEN_X, posicionY, {
        maxWidth: ANCHO_PAGINA,
        align: "justify"
    });

    posicionY += 12;

    const costos = [
        ["Costo Neto:", formatCurrency(respuestaPoliza.PrimaTotal / 1.16)],
        ["Gast. Exp. Contrato:", formatCurrency(Number(respuestaPoliza.cotizacion.DerechoPoliza))],
        ["Impuesto (IVA) 16%:", formatCurrency((respuestaPoliza.PrimaTotal / 1.16) * 0.16)],
        ["COSTO TOTAL ANUAL:", formatCurrency(respuestaPoliza.PrimaTotal)]
    ];

    autoTable(doc, {
        startY: posicionY,
        body: costos,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA * 0.7, fontStyle: "bold" },
            1: { cellWidth: ANCHO_PAGINA * 0.3, halign: "right" }
        }
    });

    const textoLegalPie = [
        "Atención a siniestros en México 800-772-73-10",
        "Atención a clientes y cotizaciones al 800 908-90-08 consultas, modificaciones y otros trámites 311-909-10-00.",
        "Avenida Independencia #361 Colonia los Llanitos, Tepic Nayarit, C.p. 63170.",
        "*Esta póliza pierde cobertura en caso de no tener al corriente sus pagos."
    ];

    textoLegalPie.forEach((texto, index) => {
        doc.setFontSize(7);
        doc.text(texto, MARGEN_X, doc.internal.pageSize.height - 25 + index * 4);
    });

    const qrDataUrl = await QRCode.toDataURL(respuestaPoliza.NumeroPoliza);
    doc.addImage(qrDataUrl, "PNG", doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 35, 25, 25);

    return doc;
};