"use client";

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    minMonths?: number;
    maxMonths?: number;
}

export const DateRangePicker = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    minMonths = 1,
    maxMonths = 12,
}: DateRangePickerProps) => {
    const handleStartDateChange = (date: Date) => {
        onStartDateChange(date);
        // Actualizar fecha fin basado en la duración seleccionada
        const newEndDate = addMonths(date, minMonths);
        onEndDateChange(newEndDate);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block">
                        Inicio de vigencia
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? (
                                    format(startDate, "PPP", { locale: es })
                                ) : (
                                    <span>Selecciona fecha</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => date && handleStartDateChange(date)}
                                disabled={(date) =>
                                    date < new Date() || date > addMonths(new Date(), maxMonths)
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <label className="text-sm font-medium mb-1.5 block">
                        Fin de vigencia
                    </label>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                            format(endDate, "PPP", { locale: es })
                        ) : (
                            <span>Fecha fin</span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};