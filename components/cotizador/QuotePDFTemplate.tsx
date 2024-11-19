import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CotizacionFormData } from '@/schemas/cotizadorSchema';
import { formatCurrency } from '@/lib/format';

// Interfaz para las props del componente
interface QuotePDFTemplateProps {
    data: CotizacionFormData;
}

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30
    },
    section: {
        marginBottom: 20
    },
    header: {
        marginBottom: 30,
        borderBottom: 1,
        borderBottomColor: '#333',
        paddingBottom: 10
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        color: '#1a365d'
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
        color: '#2c5282'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    label: {
        width: '30%',
        fontSize: 10,
        color: '#4a5568'
    },
    value: {
        width: '70%',
        fontSize: 10
    },
    table: {
        width: 'auto',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        minHeight: 25,
        alignItems: 'center'
    },
    tableHeader: {
        backgroundColor: '#f7fafc'
    },
    tableCell: {
        width: '25%',
        fontSize: 10,
        padding: 5
    },
    totals: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#bfbfbf',
        paddingTop: 10
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 8,
        color: '#666',
        textAlign: 'center'
    }
});

const QuotePDFTemplate: React.FC<QuotePDFTemplateProps> = ({ data }) => {
    const formatDate = (date: Date | string): string => {
        return new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado */}
                <View style={styles.header}>
                    <Text style={styles.title}>Cotización de Seguro PRASE</Text>
                    <Text>Fecha de emisión: {formatDate(new Date())}</Text>
                </View>

                {/* Datos del Vehículo */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Datos del Vehículo</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Marca:</Text>
                        <Text style={styles.value}>{data.marcaNombre}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Modelo:</Text>
                        <Text style={styles.value}>{data.modeloNombre}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Año:</Text>
                        <Text style={styles.value}>{data.Modelo}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Versión:</Text>
                        <Text style={styles.value}>{data.versionNombre}</Text>
                    </View>
                    {data.VIN && (
                        <View style={styles.row}>
                            <Text style={styles.label}>VIN:</Text>
                            <Text style={styles.value}>{data.VIN}</Text>
                        </View>
                    )}
                </View>

                {/* Datos de la Póliza */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Datos de la Póliza</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Suma Asegurada:</Text>
                        <Text style={styles.value}>{formatCurrency(data.SumaAsegurada)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Período de Gracia:</Text>
                        <Text style={styles.value}>{data.PeriodoGracia} días</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Vigencia:</Text>
                        <Text style={styles.value}>
                            Del {formatDate(data.inicioVigencia)} al {formatDate(data.finVigencia)}
                        </Text>
                    </View>
                    {data.NombrePersona && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Asegurado:</Text>
                            <Text style={styles.value}>{data.NombrePersona}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Código Postal:</Text>
                        <Text style={styles.value}>{data.CP}</Text>
                    </View>
                </View>

                {/* Coberturas */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Coberturas Incluidas</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Cobertura</Text>
                            <Text style={styles.tableCell}>Suma Asegurada</Text>
                            <Text style={styles.tableCell}>Deducible</Text>
                            <Text style={styles.tableCell}>Prima</Text>
                        </View>
                        {data.detalles.map((detalle, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{detalle.NombreCobertura}</Text>
                                <Text style={styles.tableCell}>
                                    {formatCurrency(detalle.MontoSumaAsegurada)}
                                </Text>
                                <Text style={styles.tableCell}>{detalle.MontoDeducible}%</Text>
                                <Text style={styles.tableCell}>
                                    {formatCurrency(detalle.PrimaCalculada)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Resumen de Costos */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Resumen de Costos</Text>
                    <View style={styles.totals}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Subtotal:</Text>
                            <Text style={styles.value}>
                                {formatCurrency(data.PrimaTotal / (1 - data.PorcentajeDescuento / 100))}
                            </Text>
                        </View>
                        {data.PorcentajeDescuento > 0 && (
                            <View style={styles.row}>
                                <Text style={styles.label}>
                                    Bonificación ({data.PorcentajeDescuento}%):
                                </Text>
                                <Text style={styles.value}>
                                    -{formatCurrency((data.PrimaTotal / (1 - data.PorcentajeDescuento / 100)) * (data.PorcentajeDescuento / 100))}
                                </Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text style={styles.label}>Derecho de Póliza:</Text>
                            <Text style={styles.value}>{formatCurrency(data.DerechoPoliza)}</Text>
                        </View>
                        <View style={[styles.row, { marginTop: 10 }]}>
                            <Text style={[styles.label, { fontWeight: 'bold' }]}>Prima Total:</Text>
                            <Text style={[styles.value, { fontWeight: 'bold' }]}>
                                {formatCurrency(data.PrimaTotal + data.DerechoPoliza)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Pie de página */}
                <View style={styles.footer}>
                    <Text>Esta cotización es válida por 30 días a partir de su emisión.</Text>
                </View>
            </Page>
        </Document>
    );
};

export default QuotePDFTemplate;