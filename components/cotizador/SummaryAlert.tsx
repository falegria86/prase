import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SummaryAlertProps {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
}

export const SummaryAlert = ({ type, title, description }: SummaryAlertProps) => {
    const icons = {
        success: CheckCircle,
        warning: AlertCircle,
        info: AlertCircle
    };

    const Icon = icons[type];

    return (
        <Alert>
            <Icon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
        </Alert >
    );
};