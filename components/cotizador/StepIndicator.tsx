"use client";

import { motion } from "framer-motion";
import {
    Car,
    Truck,
    FileText,
    Shield,
    CheckCircle,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    title: string;
    icon: string;
    description?: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

const iconMap: Record<string, LucideIcon> = {
    Car,
    Truck,
    FileText,
    Shield,
    CheckCircle,
};

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
    return (
        <div className="relative mb-8 px-4">
            {/* Contenedor de pasos */}
            <div className="relative flex items-center justify-between">
                {/* Línea de progreso base */}
                <div className="absolute left-5 top-6 right-0 h-0.5 bg-gray-200">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                {steps.map((step, index) => {
                    const isCompleted = index + 1 < currentStep;
                    const isCurrent = index + 1 === currentStep;
                    const isPending = index + 1 > currentStep;

                    const Icon = iconMap[step.icon];

                    return (
                        <div key={index} className="relative flex flex-col items-center">
                            {/* Círculo del paso */}
                            <div className="relative">
                                {isCurrent && (
                                    <div
                                        className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"
                                    />
                                )}
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white transition-colors relative z-10",
                                        isCompleted && "border-primary bg-primary",
                                        isCurrent && "border-primary",
                                        isPending && "border-gray-300"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    ) : (
                                        <Icon
                                            className={cn(
                                                "h-6 w-6",
                                                isCurrent && "text-primary",
                                                isPending && "text-gray-400"
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Título del paso */}
                            <span
                                className={cn(
                                    "mt-2 text-xs text-center transition-colors",
                                    isCompleted && "text-primary font-medium",
                                    isCurrent && "text-primary font-semibold",
                                    isPending && "text-gray-500"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
