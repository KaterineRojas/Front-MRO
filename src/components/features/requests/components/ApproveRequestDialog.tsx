import React, { useState, useEffect } from 'react';
import { type Request } from '../data/mockRequest.ts';
import { X } from 'lucide-react';
import { getTypeBadge } from '../../inventory/components/RequestBadges.tsx'
import { useSelector } from 'react-redux';


interface RequestActionDialogProps {
    show: boolean;
    variant: 'approve' | 'reject';
    request: Request | null;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function RequestModal({
    show,
    variant,
    request,
    onCancel,
    onConfirm,
}: RequestActionDialogProps) {

    const darkMode = useSelector((state: any) => state.ui.darkMode);

    const [reason, setReason] = useState("");
    const isReject = variant === 'reject';

    const title = isReject ? "Reject Request" : "Approve Request";
    const description = isReject
        ? "Please provide a reason for rejecting this request."
        : "Are you sure you want to approve this request?";

    const confirmText = isReject ? "Reject Request" : "Approve Request";

    const confirmButtonClass = isReject
        ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600";

    const isConfirmDisabled = isReject && reason.trim() === "";

    useEffect(() => {
        if (!show) {
            setReason("");
        }
    }, [show]);


    if (!show || !request) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[3px]"
                onClick={onCancel}
            ></div>

            <div className="relative w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-950">

                {/* Cabecera (Actualizada con títulos dinámicos) */}
                <div className="mb-4">
                    <h2 className="text-xl text-center md:text-left font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <p className="text-sm text-center md:text-left text-gray-500 dark:text-gray-400">
                        {description}
                    </p>

                    <X className='h-6 w-6 absolute right-0 top-0 m-4 text-gray-400 hover:text-red-500 hover:rotate-90 transition duration-300'
                        onClick={onCancel}
                    />
                </div>

                {/* Cuerpo con Detalles */}
                <div className="space-y-4">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Request Number</label>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{request.requestNumber}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                                {getTypeBadge(request.type, darkMode ? 'outline' : 'soft')}
                            </div>
                            <div className='overflow-x-auto'>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Requested By</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{request.requestedBy}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{request.requestedByEmail}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{request.department}</p>
                            </div>
                        </div>
                        {request.project && !isReject && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1 fixed">Project</label>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{request.project}
                                </p>
                            </div>
                        )}
                        {!isReject &&
                            <div className='max-h-[150px] overflow-auto'>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Reason</label>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{request.reason}</p>
                            </div>

                        }
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                Items ({request.items.length})
                            </label>
                            <div className="mt-2 grid gap-4 grid-cols-1 md:grid-cols-2 max-h-[200px] overflow-auto">
                                {request.items.map((item) => (
                                    <div key={item.id} className="flex items-start space-x-3 p-2 border border-gray-200 dark:border-gray-700 rounded">
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/150'}
                                            alt={item.articleDescription}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.articleCode}</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.articleDescription}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-200">
                                                    {item.quantity} {item.unit}
                                                </span>
                                                {item.estimatedCost && (
                                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-800 dark:text-green-100">
                                                        ${(item.estimatedCost * item.quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isReject && (
                        <div>
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="rejectionReason"
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                                shadow-sm bg-white dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 
                                focus:ring-2 focus:ring-blue-500 p-2 max-h-[100px]"
                                placeholder="Explain why this request is being rejected..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            className="rounded-md text-sm font-medium h-9 px-4 py-2 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors
                                ${confirmButtonClass}
                                ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={onConfirm}
                            disabled={isConfirmDisabled}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}