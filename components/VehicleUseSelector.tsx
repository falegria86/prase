import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, Bus, Truck, FileText } from 'lucide-react'

interface VehicleUseOption {
    id: string
    label: string
    icon: React.ElementType
}

const vehicleUseOptions: VehicleUseOption[] = [
    { id: 'residentes', label: 'Residentes', icon: MapPin },
    { id: 'publico', label: 'Público', icon: Bus },
    { id: 'equipo-pesado', label: 'Equipo pesado', icon: Truck },
    { id: 'fronterizos', label: 'Fronterizos', icon: FileText },
]

interface VehicleUseSelectorProps {
    selectedUse: string
    setSelectedUse: (use: string) => void
    setSelectedType: (type: string) => void
}

export default function VehicleUseSelector({ selectedUse, setSelectedUse, setSelectedType }: VehicleUseSelectorProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Uso del vehículo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicleUseOptions.map((option) => (
                    <TooltipProvider key={option.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outline"
                                        className={`h-24 w-full ${selectedUse === option.id ? 'border-blue-500 bg-blue-50' : ''}`}
                                        onClick={() => {
                                            setSelectedUse(option.id)
                                            setSelectedType('')
                                        }}
                                    >
                                        <div className="flex flex-col items-center">
                                            <option.icon className={`h-8 w-8 mb-2 ${selectedUse === option.id ? 'text-blue-500' : 'text-gray-500'}`} />
                                            <span className="text-sm">{option.label}</span>
                                        </div>
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Seleccionar {option.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}
