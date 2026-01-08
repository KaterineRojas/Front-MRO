import React from 'react';
import { Button } from '../../../../../ui/button';
import { ArrowLeft, WifiOff } from 'lucide-react';

interface FormHeaderProps {
  onBack: (() => void) | null;
  cartItemsCount: number;
}

/**
 * Form header with back button and title
 */
export function FormHeader({ onBack, cartItemsCount }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" onClick={onBack ?? undefined}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Borrow Form</h1>
        <p className="text-sm text-muted-foreground">
          {cartItemsCount > 0
            ? 'Complete the details of your borrow request'
            : 'Create a new borrow request'}
        </p>
      </div>
    </div>
  );
}

interface OfflineIndicatorProps {
  offlineMode: boolean;
}

/**
 * Offline mode indicator banner
 */
export function OfflineIndicator({ offlineMode }: OfflineIndicatorProps) {
  if (!offlineMode) return null;

  return (
    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
      <WifiOff className="h-5 w-5 text-orange-600" />
      <span className="text-sm text-orange-800">
        You are currently offline. Some features may be limited.
      </span>
    </div>
  );
}

interface FormActionsProps {
  onBack: (() => void) | null;
  offlineMode: boolean;
  hasIncompleteItems: boolean;
}

/**
 * Form action buttons (cancel and submit)
 */
export function FormActions({
  onBack,
  offlineMode,
  hasIncompleteItems,
}: FormActionsProps) {
  return (
    <div className="flex gap-4">
      <Button type="button" variant="outline" onClick={onBack ?? undefined}>
        Cancel
      </Button>
      <Button
        type="submit"
        className="flex-1"
        disabled={offlineMode || hasIncompleteItems}
      >
        {offlineMode ? (
          <>
            <WifiOff className="mr-2 h-4 w-4" />
            Cannot Submit (Offline)
          </>
        ) : (
          'Submit Borrow Request'
        )}
      </Button>
    </div>
  );
}
