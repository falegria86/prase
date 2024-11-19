// @ts-ignore: Disabling noImplicitAny for this file

import { z } from 'zod';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { nuevaCotizacionSchema } from '@/schemas/cotizadorSchema';
import { iGetTiposVehiculo, iGetUsosVehiculo } from '@/interfaces/CatVehiculosInterface';

type FormData = z.infer<typeof nuevaCotizacionSchema>;

interface PlanesPago {
    plazo: string;
    primerPago: number;
    pagosSiguientes: number;
    totalPlazo: number;
}

interface GenerarPDFProps {
    datos: FormData;
    tiposVehiculo: iGetTiposVehiculo[];
    usosVehiculo: iGetUsosVehiculo[];
}

const generarPlanesPago = (totalAnual: number): PlanesPago[] => {
    const planSemestral = totalAnual * 1.1;
    const planTrimestral = totalAnual * 1.15;

    return [
        {
            plazo: 'Semestral',
            primerPago: planSemestral * 0.55,
            pagosSiguientes: planSemestral * 0.45,
            totalPlazo: planSemestral
        },
        {
            plazo: 'Trimestral',
            primerPago: planTrimestral * 0.35,
            pagosSiguientes: planTrimestral * 0.65 / 3,
            totalPlazo: planTrimestral
        }
    ];
};

export const generarPDFCotizacion = ({ datos, tiposVehiculo, usosVehiculo }: GenerarPDFProps): void => {
    const doc = new jsPDF();

    const MARGEN_X = 15;
    const MARGEN_Y = 15;
    const ANCHO_PAGINA = doc.internal.pageSize.width - (MARGEN_X * 2);

    const formatearFecha = (fecha: Date | string): string => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const formatearMoneda = (cantidad: number): string => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(cantidad);
    };

    const nombreUso = usosVehiculo.find(uso => uso.UsoID === datos.UsoVehiculo)?.Nombre || 'No especificado';
    const nombreTipo = tiposVehiculo.find(tipo => tipo.TipoID === datos.TipoVehiculo)?.Nombre || 'No especificado';

    // 1. Logo y título
    doc.addImage('/prase-logo.png', 'PNG', MARGEN_X, MARGEN_Y, 35, 25);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN PRASE SEGUROS', MARGEN_X + 45, MARGEN_Y + 10);

    let posicionY = MARGEN_Y + 35;

    // 2. Tabla de cotización y datos de pago
    const costoNeto = datos.PrimaTotal;
    const gastosExpedicion = datos.DerechoPoliza;
    const subtotal = costoNeto + gastosExpedicion;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    const planesPago = generarPlanesPago(total);

    const datosCotizacion = [
        [`Fin de vigencia: ${formatearFecha(datos.finVigencia)}`, `Total Anual: ${formatearMoneda(total)}`],
        [`Semestral 1er pago ${formatearMoneda(planesPago[0].primerPago)}`, `2do pago ${formatearMoneda(planesPago[0].pagosSiguientes)}`, `Total Semestral ${formatearMoneda(planesPago[0].totalPlazo)}`],
        [`Trimestral 1er pago ${formatearMoneda(planesPago[1].primerPago)}`, `3 pagos ${formatearMoneda(planesPago[1].pagosSiguientes)}`, `Total Trimestral ${formatearMoneda(planesPago[1].totalPlazo)}`],
        ['Conducto de cobro: DEPOSITO', '', 'Agente: PA001/2024 AMPARO']
    ];

    autoTable(doc, {
        startY: posicionY,
        body: datosCotizacion,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA / 2 },
            1: { cellWidth: ANCHO_PAGINA / 2 },
            2: { cellWidth: ANCHO_PAGINA / 2 }
        }
    });

    posicionY = (doc as any).lastAutoTable.finalY + 10;

    // 3. Datos de la unidad y del cliente en una fila
    const mitadAncho = ANCHO_PAGINA * 0.48; // Un poco menos de la mitad para dejar espacio entre tablas

    // Dividir el espacio en dos columnas
    autoTable(doc, {
        startY: posicionY,
        head: [['DATOS DE LA UNIDAD']],
        body: [
            [`Marca: ${datos.marcaNombre}`],
            [`Submarca: ${datos.modeloNombre}`],
            [`Modelo: ${datos.Modelo}`],
            [`VIN: ${datos.VIN}`],
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: {
            0: { cellWidth: mitadAncho },
        },
        margin: { left: MARGEN_X }
    });

    autoTable(doc, {
        startY: posicionY,
        head: [['DATOS DEL CLIENTE']],
        body: [
            [`Nombre: ${datos.NombrePersona || '---'}`],
            [`Código Postal: ${datos.CP || '---'}`],
            [`Uso: ${nombreUso}`],
            [`Servicio: ${nombreTipo}`],
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: {
            0: { cellWidth: mitadAncho },
        },
        margin: { left: MARGEN_X + mitadAncho + 10 }
    });

    posicionY = Math.max(
        (doc as any).lastAutoTable.finalY + 10,
        (doc as any).previousAutoTable.finalY + 10
    );

    // 5. Coberturas
    const coberturas = datos.detalles.map(detalle => [
        detalle.NombreCobertura,
        detalle.MontoSumaAsegurada === 0 ? 'AMPARADA' : formatearMoneda(detalle.MontoSumaAsegurada),
        detalle.MontoDeducible === 0 ? 'NO APLICA' : `${detalle.MontoDeducible}%`
    ]);

    autoTable(doc, {
        startY: posicionY,
        head: [['COBERTURA AMPLIA', 'SUMA ASEGURADA', 'DEDUCIBLE']],
        body: coberturas,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA * 0.4 },
            1: { cellWidth: ANCHO_PAGINA * 0.4 },
            2: { cellWidth: ANCHO_PAGINA * 0.2 }
        }
    });

    posicionY = (doc as any).lastAutoTable.finalY + 10;

    // 6. Costos finales
    const costos = [
        ['Costo Neto:', formatearMoneda(costoNeto)],
        ['Gast. Exp. Contrato:', formatearMoneda(gastosExpedicion)],
        ['Impuesto (IVA) 16%:', formatearMoneda(iva)],
        ['COSTO TOTAL ANUAL:', formatearMoneda(total)]
    ];

    autoTable(doc, {
        startY: posicionY,
        body: costos,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: ANCHO_PAGINA * 0.7, fontStyle: 'bold' },
            1: { cellWidth: ANCHO_PAGINA * 0.3, halign: 'right' }
        }
    });

    // Pie de página
    doc.setFontSize(7);
    const textoLegal = [
        'Atención a siniestros en México 800-772-73-10',
        'Atención a clientes y cotizaciones al 800 908-90-08 consultas, modificaciones y otros trámites 311-909-10-00.',
        'Avenida Independencia #361 Colonia los Llanitos, Tepic Nayarit, C.p. 63170.',
        '*Esta póliza pierde cobertura en caso de no tener al corriente sus pagos.'
    ];

    textoLegal.forEach((texto, index) => {
        doc.text(texto, MARGEN_X, doc.internal.pageSize.height - 25 + (index * 4));
    });

    // Guardar el PDF
    const nombreArchivo = `cotizacion_${datos.marcaNombre}_${datos.modeloNombre}_${formatearFecha(new Date())}.pdf`;
    doc.save(nombreArchivo);
};