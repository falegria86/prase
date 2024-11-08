import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { iGetTiposVehiculo } from "@/interfaces/CatVehiculosInterface";

interface VehicleTypeSelectorProps {
    selectedUse: number;
    selectedType: number;
    setSelectedType: (type: number) => void;
    tiposVehiculo: iGetTiposVehiculo[];
}

export default function VehicleTypeSelector({ selectedUse, selectedType, setSelectedType, tiposVehiculo }: VehicleTypeSelectorProps) {
const filteredVehiculos = tiposVehiculo.filter(tipo => tipo.uso.UsoID === selectedUse);

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Tipo de vehículo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredVehiculos.map((tipo) => {
                    return (
                        <Card
                            key={tipo.TipoID}
                            className={cn(
                                "cursor-pointer transition-all duration-300 hover:shadow-md",
                                selectedType === tipo.TipoID ? "border-primary ring-2 ring-primary" : ""
                            )}
                            onClick={() => setSelectedType(tipo.TipoID)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                                <span className="text-center font-medium">{tipo.Nombre}</span>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}