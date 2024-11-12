"use client";

import { useCallback, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Feature } from "@/interfaces/GeoApifyInterface";
import { z } from "zod";
import { nuevaCotizacionSchema } from "@/schemas/cotizadorSchema";

interface LocationComboboxProps {
    form: UseFormReturn<z.infer<typeof nuevaCotizacionSchema>>;
    fetchAutocompleteSuggestions: (query: string) => void;
    autocompleteSuggestions: Feature[];
    setAutocompleteSuggestions: React.Dispatch<React.SetStateAction<Feature[]>>;
}

const LocationCombobox: React.FC<LocationComboboxProps> = ({
    form,
    fetchAutocompleteSuggestions,
    autocompleteSuggestions,
    setAutocompleteSuggestions
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        fetchAutocompleteSuggestions(value);
    }, [fetchAutocompleteSuggestions]);

    return (
        <FormField
            control={form.control}
            name="CP"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Ubicación (CP)</FormLabel>
                    <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {field.value || "Buscar ubicación..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Buscar código postal..."
                                        value={searchQuery}
                                        onValueChange={handleSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron ubicaciones.</CommandEmpty>
                                        <CommandGroup>
                                            {autocompleteSuggestions.map((suggestion, index) => (
                                                <CommandItem
                                                    key={`${suggestion.properties.formatted}-${index}`}
                                                    value={suggestion.properties.formatted}
                                                    onSelect={(value: string) => {
                                                        form.setValue("CP", value);
                                                        setSearchQuery("");
                                                        setAutocompleteSuggestions([]);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value === suggestion.properties.formatted
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {suggestion.properties.formatted}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default LocationCombobox;