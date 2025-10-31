import React from 'react';
import { Badge } from '../../../../ui/badge';
import {
  TrendingDown,
  TrendingUp,
  Handshake,
  CornerUpLeft,
  ArrowLeftRight,
  Settings,
  Package,
} from 'lucide-react';
import type { TransactionType } from './transactionTypes';

interface TransactionBadgeProps {
  type: TransactionType;
  className?: string;
}

const transactionConfig: Record<
  TransactionType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  Entry: {
    label: 'Entry',
    icon: TrendingDown,
    bgColor: 'bg-green-100 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  Exit: {
    label: 'Exit',
    icon: TrendingUp,
    bgColor: 'bg-red-100 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  Loan: {
    label: 'Loan',
    icon: Handshake,
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  Return: {
    label: 'Return',
    icon: CornerUpLeft,
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  Relocation: {
    label: 'Relocation',
    icon: ArrowLeftRight,
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  Adjustment: {
    label: 'Adjustment',
    icon: Settings,
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  Kit: {
    label: 'Kit',
    icon: Package,
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    textColor: 'text-indigo-800 dark:text-indigo-200',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  KitCreated: {
    label: 'Kit Created',
    icon: Package,
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  
};

const fallbackConfig = {
    label: 'Unknown',
    icon: Settings, 
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-600 dark:text-gray-400',
    iconColor: 'text-gray-400 dark:text-gray-600',
};

export function TransactionBadge({ type, className = '' }: TransactionBadgeProps) {
    // 1. Obtiene la configuración O usa el fallback si no existe
    const config = transactionConfig[type] || fallbackConfig;
    
    // 2. Extrae el componente de ícono (ahora es seguro, ya que 'config' siempre tiene un valor)
    const Icon = config.icon; //!

    return (
        <Badge
            variant="outline"
            className={`${config.bgColor} ${config.textColor} border-0 font-medium inline-flex items-center gap-1.5 ${className}`}
        >
            <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
            
            {/* Si es un tipo desconocido, mostramos el valor original o el label de fallback */}
            <span>{config === fallbackConfig ? (type || 'Unknown') : config.label}</span>
        </Badge>
    );
}
