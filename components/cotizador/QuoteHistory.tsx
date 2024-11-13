"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Download,
    FileText,
    MoreVertical,
    Search,
    Filter,
    Copy,
    Eye,
    Trash,
    FileSpreadsheet,
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { formatCurrency } from '@/lib/format';

interface Quote {
    id: number;
    fecha: string;
    vehiculo: {
        marca: string;
        modelo: string;
        año: string;
        version: string;
    };
    estado: 'REGISTRO' | 'EMITIDA' | 'CANCELADA';
    primaTotal: number;
    paquete: string;
    cliente: string;
    vigencia: {
        inicio: string;
        fin: string;
    };
}

interface QuoteHistoryProps {
    userId: number;
    onQuoteSelect?: (quoteId: number) => void;
}

const estadoVariants = {
    REGISTRO: { color: 'bg-yellow-100 text-yellow-800', label: 'En Proceso' },
    EMITIDA: { color: 'bg-green-100 text-green-800', label: 'Emitida' },
    CANCELADA: { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
};

export const QuoteHistory = ({
    userId,
    onQuoteSelect,
}: QuoteHistoryProps) => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                // Aquí iría la llamada real a tu API
                // const response = await fetch(`/api/quotes?userId=${userId}`);
                // const data = await response.json();

                // Simulación de datos
                const mockQuotes: Quote[] = [
                    {
                        id: 1,
                        fecha: new Date().toISOString(),
                        vehiculo: {
                            marca: 'Toyota',
                            modelo: 'Corolla',
                            año: '2024',
                            version: 'LE',
                        },
                        estado: 'REGISTRO',
                        primaTotal: 15000,
                        paquete: 'Amplia',
                        cliente: 'Juan Pérez',
                        vigencia: {
                            inicio: new Date().toISOString(),
                            fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                        },
                    },
                    // Agrega más cotizaciones de ejemplo aquí
                ];

                setQuotes(mockQuotes);
                setFilteredQuotes(mockQuotes);
            } catch (error) {
                console.error('Error al cargar el historial:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [userId]);

    useEffect(() => {
        const filtered = quotes.filter(quote =>
            quote.vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.cliente.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredQuotes(filtered);
    }, [searchTerm, quotes]);

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            // Aquí iría la lógica de exportación
            console.log(`Exportando en formato ${format}`);
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    const handleQuoteAction = async (action: 'view' | 'duplicate' | 'delete', quote: Quote) => {
        switch (action) {
            case 'view':
                setSelectedQuote(quote);
                onQuoteSelect?.(quote.id);
                break;
            case 'duplicate':
                // Lógica para duplicar
                break;
            case 'delete':
                // Lógica para eliminar
                break;
        }
    };

    if (loading) {
        return <LoadingSpinner text="Cargando historial de cotizaciones..." />;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Historial de Cotizaciones</CardTitle>
                        <CardDescription>
                            Consulta y gestiona tus cotizaciones anteriores
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Exportar como PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('excel')}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Exportar como Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por vehículo o cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Vehículo</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Paquete</TableHead>
                                    <TableHead className="text-right">Prima Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredQuotes.map((quote) => (
                                        <motion.tr
                                            key={quote.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-muted/50 cursor-pointer"
                                            onClick={() => handleQuoteAction('view', quote)}
                                        >
                                            <TableCell>
                                                {format(new Date(quote.fecha), 'PPP', { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {quote.vehiculo.marca} {quote.vehiculo.modelo}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {quote.vehiculo.año} - {quote.vehiculo.version}
                                                </div>
                                            </TableCell>
                                            <TableCell>{quote.cliente}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={estadoVariants[quote.estado].color}
                                                >
                                                    {estadoVariants[quote.estado].label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{quote.paquete}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(quote.primaTotal)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuoteAction('view', quote);
                                                            }}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuoteAction('duplicate', quote);
                                                            }}
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuoteAction('delete', quote);
                                                            }}
                                                            className="text-destructive"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredQuotes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                No se encontraron cotizaciones
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default QuoteHistory;