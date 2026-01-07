import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    message?: string;
    onRetry?: () => void;
}

export const TableErrorState: React.FC<Props> = ({
    message = "We couldn't load the purchase requests.",
    onRetry
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-red-100 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
};