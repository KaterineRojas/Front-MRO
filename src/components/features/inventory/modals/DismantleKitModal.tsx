import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, PackageMinus, X } from 'lucide-react';

interface DismantleKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitName: string;
  maxQuantity: number;
  quantity: number;
  notes: string;
  onQuantityChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DismantleKitModal({
  open,
  onOpenChange,
  kitName,
  maxQuantity,
  quantity,
  notes,
  onQuantityChange,
  onNotesChange,
  onConfirm,
  isSubmitting,
}: DismantleKitModalProps) {

  // Prevenir scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  // Usamos createPortal para "sacar" el modal de la tabla y renderizarlo en el body
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      
      {/* 1. OVERLAY (Fondo Oscuro) */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => !isSubmitting && onOpenChange(false)}
      />

      {/* 2. MODAL CONTAINER */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <PackageMinus className="h-5 w-5 mr-2 text-orange-600" />
              Dismantle Kit
            </h2>
            <button
              onClick={() => !isSubmitting && onOpenChange(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Disassemble <span className="font-medium text-gray-700 dark:text-orange-500">"{kitName}"</span> to return its items back to inventory.
          </p>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 space-y-5">
          
          {/* Quantity Input */}
          <div className="space-y-2">
            <label htmlFor="dismantle-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity to Dismantle <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Available: {maxQuantity})
              </span>
            </label>
            <input
              id="dismantle-quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:!border-orange-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
              placeholder="Enter quantity"
              required
            />
            <p className="text-xs text-gray-500">
              Enter how many kits you want to dismantle (max: {maxQuantity})
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label htmlFor="dismantle-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              id="dismantle-notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:!border-orange-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900 resize-none"
              placeholder="Add any notes about this dismantle operation..."
            />
          </div>

          {/* Warning Box */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-600/30 border border-yellow-200 dark:border-yellow-900/30 rounded-lg flex items-start gap-3">
             <div className="mt-0.5">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
             </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This will disassemble <span className="font-bold">{quantity}</span> kit(s) and return all component items back to inventory.
            </p>
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button" // Cambiado a button para evitar submit accidental de forms padres si los hubiera
            onClick={onConfirm}
            disabled={isSubmitting || quantity < 1 || quantity > maxQuantity}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg shadow-sm hover:bg-orange-700 hover:border-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Dismantling...
              </>
            ) : (
              <>
                <PackageMinus className="h-4 w-4 mr-2" />
                Dismantle {quantity} Kit{quantity > 1 ? 's' : ''}
              </>
            )}
          </button>

        </div>

      </div>
    </div>,
    document.body // Portal Target
  );
}