import React from 'react';
import { ScrollArea } from '../../../../ui/scroll-area';
import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Settings,
  Package,
  Info
} from 'lucide-react';
import type { TransactionTypesResponse } from './transactionTypes';

interface HelpTabProps {
  transactionData: TransactionTypesResponse;
}

// Icon and color mapping for transaction types
const typeIconConfig: Record<number, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = {
  0: { // Entry
    icon: TrendingDown,
    bgColor: 'bg-green-100 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  1: { // Exit
    icon: TrendingUp,
    bgColor: 'bg-red-100 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  2: { // Transfer
    icon: ArrowLeftRight,
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  3: { // Adjustment
    icon: Settings,
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  4: { // Kit
    icon: Package,
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    textColor: 'text-indigo-800 dark:text-indigo-200',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

export function HelpTab({ transactionData }: HelpTabProps) {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-8">
        {/* Transaction Types Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Info className="h-3 w-3 text-primary" />
            <h2 className="text-lg font-bold">Transaction Types</h2>
          </div>
          <div className="grid gap-3">
            {transactionData.types.map((type) => {
              const config = typeIconConfig[type.value];
              const Icon = config?.icon || Info;

              return (
                <div
                  key={type.value}
                  className={`${config?.bgColor || 'bg-gray-100'} ${config?.textColor || 'text-gray-800'} rounded-lg p-3 shadow-sm`}
                >
                  <div className="flex flex-col space-y-1">
                    <div className={`${config?.iconColor || 'text-gray-600'} p-3 rounded-full bg-white/50 dark:bg-black/20 self-start`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">{type.name}</h4>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction Sub-Types Section */}
        <div>
          <div className="flex items-center gap-3 mb-5 pb-3 border-b">
            <Info className="h-3 w-3 text-primary" />
            <h2 className="text-lg font-bold">Transaction Sub-Types</h2>
          </div>

          {/* Group by category */}
          {transactionData.types.map((type) => {
            const subTypesForCategory = transactionData.subTypes.filter(
              (subType) => subType.category === type.name
            );

            if (subTypesForCategory.length === 0) return null;

            const config = typeIconConfig[type.value];
            const Icon = config?.icon || Info;

            return (
              <div key={type.name} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`${config?.bgColor || 'bg-gray-100'} ${config?.textColor || 'text-gray-800'} rounded-md px-3 py-1.5 inline-flex items-center gap-2 shadow-sm`}>
                    <Icon className={`h-4 w-4 ${config?.iconColor || 'text-gray-600'}`} />
                    <span className="text-sm font-bold">{type.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {subTypesForCategory.length} sub-type{subTypesForCategory.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-2 ml-7">
                  {subTypesForCategory.map((subType) => (
                    <div
                      key={subType.value}
                      className="border-2 border-border rounded-lg p-3 bg-card hover:bg-accent/50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <h5 className="text-xs font-semibold mb-1.5">
                        {subType.name}
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {subType.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
