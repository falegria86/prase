import { Button } from "@/components/ui/button"

interface VehicleType {
    id: string
    label: string
}

interface VehicleTypeSelectorProps {
    selectedUse: string
    selectedType: string
    setSelectedType: (type: string) => void
}

export default function VehicleTypeSelector({ selectedUse, selectedType, setSelectedType }: VehicleTypeSelectorProps) {
    const vehicleTypes = getVehicleTypesByUse(selectedUse)

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Tipo de vehículo</h3>
            <div className="grid grid-cols-2 gap-4">
                {vehicleTypes.map((type: VehicleType) => (
                    <Button
                        key={type.id}
                        variant="outline"
                        className={`h-24 w-full ${selectedType === type.id ? 'border-blue-500 bg-blue-50' : ''}`}
                        onClick={() => setSelectedType(type.id)}
                    >
                        {type.label}
                    </Button>
                ))}
            </div>
        </div>
    )
}

function getVehicleTypesByUse(selectedUse: string): VehicleType[] {
    const vehicleTypesByUse: Record<string, VehicleType[]> = {
        residentes: [{ id: 'auto', label: 'Automóvil' }, { id: 'moto', label: 'Motocicleta' }],
        publico: [{ id: 'bus', label: 'Autobús' }, { id: 'taxi', label: 'Taxi' }],
        'equipo-pesado': [{ id: 'camion', label: 'Camión' }, { id: 'tractor', label: 'Tractor' }],
        fronterizos: [{ id: 'pickup', label: 'Pickup' }, { id: 'van', label: 'Van' }],
    }
    return vehicleTypesByUse[selectedUse] || []
}
