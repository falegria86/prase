'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from 'lucide-react'
import StepIndicator from './StepIndicator'
import VehicleUseSelector from './VehicleUseSelector'
import VehicleTypeSelector from './VehicleTypeSelector'

export interface Step {
    title: string
    icon: string
}

const steps: Step[] = [
    { title: 'Origen y uso', icon: 'Car' },
    { title: 'Datos del vehículo', icon: 'Truck' },
    { title: 'Datos de cotización', icon: 'Bus' },
    { title: 'Coberturas', icon: 'FileText' },
    { title: 'Resumen', icon: 'FileText' },
]

export default function Cotizador() {
    const [currentStep, setCurrentStep] = useState<number>(1)
    const [selectedUse, setSelectedUse] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <StepIndicator steps={steps} currentStep={currentStep} />

            {currentStep === 1 && (
                <div className="space-y-6">
                    <VehicleUseSelector
                        selectedUse={selectedUse}
                        setSelectedUse={setSelectedUse}
                        setSelectedType={setSelectedType}
                    />
                    {selectedUse && (
                        <VehicleTypeSelector
                            selectedUse={selectedUse}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                        />
                    )}
                </div>
            )}

            <div className="flex gap-5 mt-8">
                <Button onClick={prevStep} disabled={currentStep === 1}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={currentStep === steps.length || (currentStep === 1 && (!selectedUse || !selectedType))}
                >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
