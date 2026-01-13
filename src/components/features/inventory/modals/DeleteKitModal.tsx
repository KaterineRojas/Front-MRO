import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface DeleteKitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    kitName: string;
    status: 'confirm' | 'success' | 'error' | 'loading' | null;
    message: string;
}

export const DeleteKitModal: React.FC<DeleteKitModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    kitName,
    status,
    message
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
            
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 200);
            
            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!shouldRender || !status) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && status !== 'loading') {
            onClose();
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'confirm':
                return {
                    icon: <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>,
                    title: "Delete Kit",
                    description: (
                        <>
                            Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-red-500/80">"{kitName}"</span>?
                            <br />This action cannot be undone.
                        </>
                    ),
                    footer: (
                        <div className="flex justify-end gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-[#121212] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900 transition-colors shadow-sm"
                            >
                                Delete Kit
                            </button>
                        </div>
                    )
                };

            case 'loading':
                return {
                    icon: <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4 animate-pulse">
                        <Trash2 className="h-6 w-6 text-gray-400" />
                    </div>,
                    title: "Deleting...",
                    description: "Please wait while we remove the kit.",
                    footer: null
                };

            case 'success':
                return {
                    icon: <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>,
                    title: "Kit Deleted",
                    description: `The kit "${kitName}" has been deleted successfully.`,
                    footer: (
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    )
                };

            case 'error':
                return {
                    icon: <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>,
                    title: "Error",
                    description: message,
                    footer: (
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    )
                };

            default:
                return null;
        }
    };

    const content = renderContent();
    if (!content) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div 
                className={`relative bg-white dark:bg-[#121212] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 ease-out ${
                    isVisible 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                }`}
            >
                {content.icon}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{content.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{content.description}</p>
                </div>
                {content.footer && <div className="mt-4">{content.footer}</div>}
            </div>
        </div>,
        document.body
    );
};