import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[300px]">
                {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>}
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
