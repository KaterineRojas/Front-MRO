import React from 'react';
import { Badge } from '@/components/features/ui/badge';
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
  KitCreated: {
    label: 'Kit Created',
    icon: Package,
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

export function TransactionBadge({ type, className = '' }: TransactionBadgeProps) {
  const config = transactionConfig[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.textColor} border-0 font-medium inline-flex items-center gap-1.5 ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
      <span>{config.label}</span>
    </Badge>
  );
}
