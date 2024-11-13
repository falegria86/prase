"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

interface PriceDisplayProps {
    amount: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning';
}

export const PriceDisplay = ({
    amount,
    label,
    size = 'md',
    variant = 'default'
}: PriceDisplayProps) => {
    const sizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    const variants = {
        default: 'text-primary',
        success: 'text-green-600',
        warning: 'text-yellow-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right"
        >
            {label && (
                <div className="text-sm text-muted-foreground mb-1">
                    {label}
                </div>
            )}
            <div className={cn(
                "font-bold",
                sizes[size],
                variants[variant]
            )}>
                {formatCurrency(amount)}
            </div>
        </motion.div>
    );
};