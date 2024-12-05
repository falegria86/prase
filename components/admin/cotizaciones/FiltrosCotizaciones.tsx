import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, CalendarRange, X, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { iGetCotizacion } from "@/interfaces/CotizacionInterface";

interface FiltrosCotizacionesProps {
    cotizaciones: iGetCotizacion[];
    onFiltrarCotizaciones: (cotizaciones: iGetCotizacion[]) => void;
}

export const FiltrosCotizaciones = ({
    cotizaciones,
    onFiltrarCotizaciones
}: FiltrosCotizacionesProps) => {
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [rangoFechas, setRangoFechas] = useState<{
        desde: Date | undefined;
        hasta: Date | undefined;
    }>({
        desde: undefined,
        hasta: undefined
    });

    const aplicarFiltros = () => {
        let cotizacionesFiltradas = [...cotizaciones];

        // Filtrar por texto (nombre, teléfono o correo)
        if (textoBusqueda) {
            const busqueda = textoBusqueda.toLowerCase();
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cotizacion =>
                cotizacion.NombrePersona.toLowerCase().includes(busqueda) ||
                (cotizacion.Telefono && cotizacion.Telefono.toLowerCase().includes(busqueda)) ||
                (cotizacion.Correo && cotizacion.Correo.toLowerCase().includes(busqueda))
            );
        }

        // Filtrar por rango de fechas
        if (rangoFechas.desde && rangoFechas.hasta) {
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cotizacion => {
                const fechaCotizacion = new Date(cotizacion.FechaCotizacion);
                return fechaCotizacion >= rangoFechas.desde! &&
                    fechaCotizacion <= rangoFechas.hasta!;
            });
        }

        onFiltrarCotizaciones(cotizacionesFiltradas);
    };

    const limpiarFiltros = () => {
        setTextoBusqueda("");
        setRangoFechas({ desde: undefined, hasta: undefined });
        onFiltrarCotizaciones(cotizaciones);
    };

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="relative bg-white rounded-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, teléfono o correo..."
                            value={textoBusqueda}
                            onChange={(e) => {
                                setTextoBusqueda(e.target.value);
                                if (!e.target.value && !rangoFechas.desde && !rangoFechas.hasta) {
                                    onFiltrarCotizaciones(cotizaciones);
                                }
                            }}
                            className="pl-9"
                        />
                        {textoBusqueda && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                onClick={() => {
                                    setTextoBusqueda("");
                                    if (!rangoFechas.desde && !rangoFechas.hasta) {
                                        onFiltrarCotizaciones(cotizaciones);
                                    }
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <CalendarRange className="h-4 w-4" />
                            Rango de fechas
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            locale={es}
                            selected={{
                                from: rangoFechas.desde,
                                to: rangoFechas.hasta
                            }}
                            onSelect={(rango) => {
                                setRangoFechas({
                                    desde: rango?.from,
                                    hasta: rango?.to
                                });
                            }}
                        />
                    </PopoverContent>
                </Popover>

                <Button onClick={aplicarFiltros}>
                <FilterIcon className="h-4 w-4 mr-2" />
                    Aplicar filtros
                </Button>

                <Button
                    variant="secondary"
                    onClick={limpiarFiltros}
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                </Button>
            </div>

            {/* Mostrar filtros activos */}
            {(textoBusqueda || (rangoFechas.desde && rangoFechas.hasta)) && (
                <div className="flex gap-2">
                    {textoBusqueda && (
                        <Badge variant="secondary" className="gap-1">
                            Búsqueda: {textoBusqueda}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setTextoBusqueda("");
                                    if (!rangoFechas.desde && !rangoFechas.hasta) {
                                        onFiltrarCotizaciones(cotizaciones);
                                    }
                                }}
                            />
                        </Badge>
                    )}
                    {rangoFechas.desde && rangoFechas.hasta && (
                        <Badge variant="secondary" className="gap-1">
                            Fechas: {format(rangoFechas.desde, "dd/MM/yyyy")} - {format(rangoFechas.hasta, "dd/MM/yyyy")}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setRangoFechas({ desde: undefined, hasta: undefined });
                                    if (!textoBusqueda) {
                                        onFiltrarCotizaciones(cotizaciones);
                                    }
                                }}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};