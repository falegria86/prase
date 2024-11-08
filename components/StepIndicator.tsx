import { motion } from 'framer-motion'
import { Car, Truck, Bus, FileText } from 'lucide-react'
import { Step } from './cotizador/Cotizador'

const iconMap: { [key: string]: React.ElementType } = {
  Car, Truck, Bus, FileText
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 relative">
      <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-200 -translate-y-3">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between relative">
        {steps.map((step, index) => {
          const Icon = iconMap[step.icon]
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 ${
                  index + 1 <= currentStep ? 'border-blue-600' : 'border-gray-200'
                }`}
                initial={false}
                animate={{
                  scale: index + 1 === currentStep ? 1.2 : 1,
                  transition: { duration: 0.3 }
                }}
              >
                <Icon className={`h-6 w-6 ${index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'}`} />
              </motion.div>
              <span className={`mt-2 text-xs text-center ${
                index + 1 === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}