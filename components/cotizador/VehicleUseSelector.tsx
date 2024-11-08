import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { MapPin, Bus, Truck, FileText } from 'lucide-react'
import { iGetUsosVehiculo } from '@/interfaces/CatVehiculosInterface'

interface VehicleUseSelectorProps {
    selectedUse: number;
    setSelectedUse: (use: number) => void
    setSelectedType: (type: number) => void
    usosVehiculo: iGetUsosVehiculo[];
}

export default function VehicleUseSelector({ usosVehiculo, selectedUse, setSelectedUse, setSelectedType }: VehicleUseSelectorProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Uso del vehículo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {usosVehiculo.map((option) => (
                    <TooltipProvider key={option.UsoID}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outline"
                                        className={`h-24 w-full ${selectedUse === option.UsoID ? 'border-blue-500 bg-blue-50' : ''}`}
                                        onClick={() => {
                                            setSelectedUse(option.UsoID)
                                            setSelectedType(0)
                                        }}
                                    >
                                        {option.Nombre}
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div>Seleccionar {option.Nombre}</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}
