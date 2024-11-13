"use client";

import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Cobertura } from '@/types/cotizador';

interface CoverageFilterProps {
    coberturas: Cobertura[];
    onFilterChange: (filtered: Cobertura[]) => void;
}

export const CoverageFilter = ({
    coberturas,
    onFilterChange,
}: CoverageFilterProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [type, setType] = useState<'all' | 'basic' | 'special'>('all');

    const applyFilters = () => {
        let filtered = coberturas;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(cob =>
                cob.NombreCobertura.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cob.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por rango de precio
        if (priceRange !== 'all') {
            filtered = filtered.filter(cob => {
                const prima = parseFloat(cob.PrimaBase);
                switch (priceRange) {
                    case 'low': return prima <= 1000;
                    case 'medium': return prima > 1000 && prima <= 5000;
                    case 'high': return prima > 5000;
                    default: return true;
                }
            });
        }

        // Filtrar por tipo
        if (type !== 'all') {
            filtered = filtered.filter(cob => {
                switch (type) {
                    case 'basic': return !cob.EsCoberturaEspecial;
                    case 'special': return cob.EsCoberturaEspecial;
                    default: return true;
                }
            });
        }

        onFilterChange(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setPriceRange('all');
        setType('all');
        onFilterChange(coberturas);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Buscar coberturas..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                applyFilters();
                            }}
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                onClick={() => {
                                    setSearchTerm('');
                                    applyFilters();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <Select
                    value={priceRange}
                    onValueChange={(value: typeof priceRange) => {
                        setPriceRange(value);
                        applyFilters();
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Rango de precio" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los precios</SelectItem>
                        <SelectItem value="low">Económico (≤ $1,000)</SelectItem>
                        <SelectItem value="medium">Intermedio ($1,001 - $5,000)</SelectItem>
                        <SelectItem value="high">Premium (&gt; $5,000)</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={type}
                    onValueChange={(value: typeof type) => {
                        setType(value);
                        applyFilters();
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="basic">Básicas</SelectItem>
                        <SelectItem value="special">Especiales</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Limpiar
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                    {searchTerm && (
                        <Badge variant="secondary" className="gap-1">
                            Búsqueda: {searchTerm}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setSearchTerm('');
                                    applyFilters();
                                }}
                            />
                        </Badge>
                    )}
                    {priceRange !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            Precio: {priceRange === 'low' ? 'Económico' : priceRange === 'medium' ? 'Intermedio' : 'Premium'}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setPriceRange('all');
                                    applyFilters();
                                }}
                            />
                        </Badge>
                    )}
                    {type !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            Tipo: {type === 'basic' ? 'Básicas' : 'Especiales'}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                    setType('all');
                                    applyFilters();
                                }}
                            />
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
};