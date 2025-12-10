import { useState, useEffect } from 'react';
import { X, User, Building, Briefcase, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import { LoanRequest } from '../types/loanTypes.ts';

interface RequestActionDialogProps {
    show: boolean;
    variant: 'approve' | 'reject';
    request: LoanRequest | null;
    onCancel: () => void;
    onConfirm: (reason: string) => void;
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
        ? `You are about to reject request #${request?.requestNumber}. This action cannot be undone.`
        : `Are you sure you want to approve request #${request?.requestNumber}?`;

    const confirmText = isReject ? "Reject Request" : "Approve Request";

    const confirmButtonClass = isReject
        ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600";

    const isConfirmDisabled = isReject && reason.trim() === "";

    useEffect(() => {
        if (show) {
            setReason("");
        }
    }, [show]);

    if (!show || !request) {
        return null;
    }

    const formattedDate = new Date(request.createdAt).toLocaleDateString();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
                onClick={onCancel}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl p-6 bg-white rounded-xl shadow-2xl dark:bg-[#121212] border border-gray-200 dark:border-gray-800 transform transition-all">

                {/* Header */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Resumen de la Solicitud */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Requester */}
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Requested By</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.requesterName}</p>
                                <p className="text-xs text-gray-500">{request.requesterId}</p>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="flex items-start gap-3">
                            <Building className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Department</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.departmentId}</p>
                            </div>
                        </div>

                        {/* Project */}
                        {request.projectId && (
                            <div className="flex items-start gap-3">
                                <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Project</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.projectId}</p>
                                </div>
                            </div>
                        )}

                        {/* Date */}
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formattedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área de Texto  */}
                <div className="mb-6">
                    <label
                        htmlFor="action-reason"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        {isReject ? "Rejection Reason (Required)" : "Approval Notes (Optional)"}
                    </label>
                    <textarea
                        id="action-reason"
                        rows={3}
                        className={`w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-opacity-50 text-sm p-3
              ${isReject && !reason.trim()
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200'}
              bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100
            `}
                        placeholder={isReject ? "Explain why this request is being rejected..." : "Add any comments for the record..."}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2
              ${confirmButtonClass}
              ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                        onClick={() => onConfirm(reason)} 
                        disabled={isConfirmDisabled}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}