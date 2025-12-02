/**
 * Modal reutilizable para confirmaciones y mensajes de error
 * Diseño consistente para toda la aplicación
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export type ModalType = 'confirm' | 'error' | 'warning' | 'success' | 'info' | 'network' | 'loading';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  loading?: boolean;
  retryable?: boolean;
}

const iconConfig = {
  confirm: { icon: AlertCircle, className: 'text-blue-500' },
  error: { icon: XCircle, className: 'text-red-500' },
  warning: { icon: AlertTriangle, className: 'text-yellow-500' },
  success: { icon: CheckCircle, className: 'text-green-500' },
  info: { icon: AlertCircle, className: 'text-blue-500' },
  network: { icon: WifiOff, className: 'text-orange-500' },
  loading: { icon: RefreshCw, className: 'text-blue-500 animate-spin' }
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  loading = false,
  retryable = false
}: ConfirmModalProps) {
  const config = iconConfig[type] || iconConfig.confirm;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (onConfirm && !loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 ${config.className}`}>
              <Icon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="flex-1">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel onClick={handleCancel} disabled={loading}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={
              type === 'error' || type === 'warning'
                ? 'bg-red-500 hover:bg-red-600'
                : ''
            }
          >
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {retryable && !loading && <RefreshCw className="mr-2 h-4 w-4" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook para usar modales de confirmación fácilmente
 */
export const useConfirmModal = () => {
  const [modalState, setModalState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    type: ModalType;
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    showCancel: boolean;
    retryable: boolean;
  }>({
    open: false,
    title: '',
    description: '',
    type: 'confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showCancel: true,
    retryable: false
  });

  const showConfirm = (options: {
    title: string;
    description: string;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    retryable?: boolean;
  }) => {
    setModalState({
      open: true,
      title: options.title,
      description: options.description,
      type: options.type || 'confirm',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm,
      showCancel: options.showCancel !== false,
      retryable: options.retryable || false
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, open: false }));
  };

  return {
    modalState,
    showConfirm,
    hideModal,
    setModalOpen: (open: boolean) => setModalState(prev => ({ ...prev, open }))
  };
};
