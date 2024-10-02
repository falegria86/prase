import { Card, CardContent } from "@/components/ui/card"
import { FaCar, FaTruck, FaMapMarkerAlt, FaBus, FaTaxi, FaShuttleVan, FaTruckPickup } from "react-icons/fa"
import { MdLocalShipping, MdDirectionsCar } from "react-icons/md"
import { PiVanFill } from "react-icons/pi";

import { cn } from "@/lib/utils"

interface VehicleType {
    id: string
    label: string
    icon: React.ElementType
}

interface VehicleTypeSelectorProps {
    selectedUse: string
    selectedType: string
    setSelectedType: (type: string) => void
}

function getVehicleTypesByUse(selectedUse: string): VehicleType[] {
    const vehicleTypesByUse: Record<string, VehicleType[]> = {
        residentes: [
            { id: 'auto', label: 'Autos', icon: FaCar },
            { id: 'comercial', label: 'Comercial', icon: FaShuttleVan },
            { id: 'app', label: 'Chofer App', icon: FaTaxi },
            { id: 'app-plus', label: 'Chofer App Plus', icon: FaTaxi },
            { id: 'pickups-personales', label: 'Pickups Personales', icon: FaTruckPickup },
            { id: 'carga', label: 'Carga', icon: MdLocalShipping },
        ],
        publico: [
            { id: 'taxi', label: 'Taxi', icon: FaTaxi },
            { id: 'taxi-van-turismo', label: 'Taxi/Van Turismo', icon: PiVanFill },
            { id: 'taxi-local', label: 'Taxi Local', icon: FaMapMarkerAlt },
            { id: 'col-urb-fora', label: 'Col.urb/fora', icon: FaBus },
        ],
        equipoPesado: [
            { id: 'carga', label: 'Carga', icon: FaTruck },
        ],
        fronterizos: [
            { id: 'pickup', label: 'Autos', icon: MdDirectionsCar },
            { id: 'pickups-personales', label: 'Pickups Personales', icon: FaTruckPickup },
            { id: 'carga', label: 'Carga', icon: FaTruck },
        ],
    }
    return vehicleTypesByUse[selectedUse] || []
}

export default function VehicleTypeSelector({ selectedUse, selectedType, setSelectedType }: VehicleTypeSelectorProps) {
    const vehicleTypes = getVehicleTypesByUse(selectedUse)

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Tipo de vehículo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vehicleTypes.map((type: VehicleType) => {
                    const Icon = type.icon
                    return (
                        <Card
                            key={type.id}
                            className={cn(
                                "cursor-pointer transition-all duration-300 hover:shadow-md",
                                selectedType === type.id ? "border-primary ring-2 ring-primary" : ""
                            )}
                            onClick={() => setSelectedType(type.id)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                                <Icon className="w-12 h-12 mb-4 text-primary" />
                                <span className="text-center font-medium">{type.label}</span>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}