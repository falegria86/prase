import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';

interface QuoteProgressProps {
    currentStep: number;
    totalSteps: number;
    onStepClick?: (step: number) => void;
}

export const QuoteProgress = ({
    currentStep,
    totalSteps,
    onStepClick,
}: QuoteProgressProps) => {
    return (
        <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <div className="relative flex justify-between">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <motion.button
                        key={index}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            "transition-colors relative",
                            index + 1 <= currentStep ? "bg-primary" : "bg-gray-200",
                            onStepClick && "cursor-pointer hover:ring-2 hover:ring-primary/50"
                        )}
                        onClick={() => onStepClick?.(index + 1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Circle className={cn(
                            "h-4 w-4",
                            index + 1 <= currentStep ? "text-white" : "text-gray-400"
                        )} />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};