import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import {
  iGetTiposVehiculo,
  iGetUsosVehiculo,
} from "@/interfaces/CatVehiculosInterface";
import { generarColumnasPDF } from "@/lib/pdf.utils";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";
import { getCoberturas } from "@/actions/CatCoberturasActions";
import { iGetTipoPagos } from "@/interfaces/CatTipoPagos";

interface GenerarPDFProps {
  datos: iGetCotizacion;
  tiposVehiculo: iGetTiposVehiculo[];
  usosVehiculo: iGetUsosVehiculo[];
  tiposPago: iGetTipoPagos[];
  isSave: boolean;
}

export const generarPDFCotizacion = async ({
  datos,
  tiposVehiculo,
  usosVehiculo,
  tiposPago,
  isSave,
}: GenerarPDFProps) => {
  const doc = new jsPDF();
console.log(datos)
  const MARGEN_X = 15;
  const MARGEN_Y = 15;
  const ANCHO_PAGINA = doc.internal.pageSize.width - MARGEN_X * 2;

  const formatearFecha = (fecha: Date | string): string => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatearMoneda = (cantidad: string | number): string => {
    const valor = typeof cantidad === "string" ? parseFloat(cantidad) : cantidad;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const nombreUso = usosVehiculo.find((uso) => uso.UsoID === datos.UsoVehiculo)?.Nombre || "No especificado";
  const nombreTipo = tiposVehiculo.find((tipo) => tipo.TipoID === datos.TipoVehiculo)?.Nombre || "No especificado";
  const tipoPago = tiposPago.find((tipo) => tipo.TipoPagoID === datos.TipoPagoID);

  doc.addImage("/prase-logo.png", "PNG", MARGEN_X, MARGEN_Y, 30, 25);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(47, 84, 149);
  doc.text("COTIZACIÓN PRASE SEGUROS", MARGEN_X + 45, MARGEN_Y + 10);

  let posicionY = MARGEN_Y + 35;
  const mitadAncho = ANCHO_PAGINA * 0.48;
  doc.setTextColor(0);

  autoTable(doc, {
    startY: posicionY,
    head: [["DATOS DE LA UNIDAD"]],
    body: [
      [`Marca: ${datos.Marca}`],
      [`Modelo: ${datos.Submarca}`],
      [`Año de fabricación: ${datos.Modelo}`],
      [`VIN: ${datos.VIN || '---'}`],
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: { 0: { cellWidth: mitadAncho } },
    margin: { left: MARGEN_X },
  });

  autoTable(doc, {
    startY: posicionY,
    head: [["DATOS DEL CLIENTE"]],
    body: [
      [`Nombre: ${datos.NombrePersona || "---"}`],
      [`Código Postal: ${datos.CP || "---"}`],
      [`Uso: ${nombreUso}`],
      [`Servicio: ${nombreTipo}`],
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: { 0: { cellWidth: mitadAncho } },
    margin: { left: MARGEN_X + mitadAncho + 10 },
  });

  posicionY = Math.max(
    (doc as any).lastAutoTable.finalY + 10,
    (doc as any).previousAutoTable.finalY + 10
  );

  const coberturasInfo = await getCoberturas();
  const detallesCompletos = datos.detalles.map((detalle) => {
    const coberturaCompleta = coberturasInfo?.find(
      (c) => c.CoberturaID === detalle.CoberturaID
    );
    return coberturaCompleta ? { ...detalle, ...coberturaCompleta } : detalle;
  });

  const coberturas = generarColumnasPDF(detallesCompletos);

  autoTable(doc, {
    startY: posicionY,
    head: [["COBERTURA AMPLIA", "SUMA ASEGURADA", "DEDUCIBLE", "PRIMA"]],
    body: coberturas,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102] },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.3 },
      1: { cellWidth: ANCHO_PAGINA * 0.3 },
      2: { cellWidth: ANCHO_PAGINA * 0.2 },
      3: { cellWidth: ANCHO_PAGINA * 0.2 },
    },
  });

  posicionY = (doc as any).lastAutoTable.finalY + 10;

  const costos = [
    ["Costo Base:", formatearMoneda(datos.costoBase)],
    ["Tipo de pago:", tipoPago?.Descripcion || "No especificado"],
    ["Ajuste por siniestralidad:", formatearMoneda(datos.ajusteSiniestralidad)],
    ["Subtotal con ajuste siniestralidad:", formatearMoneda(datos.subtotalSiniestralidad)],
    ["Ajuste por tipo de pago:", formatearMoneda(datos.ajusteTipoPago)],
    ["Subtotal con ajuste tipo pago:", formatearMoneda(datos.subtotalTipoPago)],
    [`Bonificación técnica (${datos.PorcentajeDescuento}%):`, formatearMoneda(Number(datos.PorcentajeDescuento) * datos.subtotalTipoPago / 100)],
    ["Costo Neto:", formatearMoneda(datos.costoNeto)],
    ["Derecho de Póliza:", formatearMoneda(Number(datos.DerechoPoliza))],
    ["IVA (16%):", formatearMoneda(datos.iva)],
    ["TOTAL:", formatearMoneda(datos.PrimaTotal)]
  ];

  autoTable(doc, {
    startY: posicionY,
    body: costos,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: ANCHO_PAGINA * 0.7, fontStyle: "bold" },
      1: { cellWidth: ANCHO_PAGINA * 0.3, halign: "right" },
    },
  });

  const textoLegal = [
    "Atención a siniestros en México 800-772-73-10",
    "Atención a clientes y cotizaciones al 800 908-90-08 consultas, modificaciones y otros trámites 311-909-10-00.",
    "Avenida Independencia #361 Colonia los Llanitos, Tepic Nayarit, C.p. 63170.",
    "*Esta póliza pierde cobertura en caso de no tener al corriente sus pagos.",
  ];

  textoLegal.forEach((texto, index) => {
    doc.setFontSize(7);
    doc.text(texto, MARGEN_X, doc.internal.pageSize.height - 25 + index * 4);
  });

  const qrCode = await QRCode.toDataURL('https://prase.mx/terminos-y-condiciones/');
  doc.addImage(
    qrCode,
    'PNG',
    doc.internal.pageSize.width - 35,
    doc.internal.pageSize.height - 35,
    20,
    20
  );

  if (isSave) {
    const nombreArchivo = `cotizacion_${datos.Marca}_${datos.Submarca}_${datos.Modelo}_${formatearFecha(new Date())}.pdf`;
    doc.save(nombreArchivo);
  }

  return doc;
};