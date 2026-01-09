import { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    Hash,
    FileText,
    User,
    Building,
    Briefcase,
    StickyNote,
    Package,
    AlertCircle
} from 'lucide-react';
import { getTypeBadge, getReasonBadge } from '../../inventory/components/RequestBadges.tsx';
import { REASON_MAP} from '../../orders/utils/purchase-utils';

import { useSelector } from 'react-redux';
// CHANGED: Import UnifiedRequest instead of LoanRequest
import { UnifiedRequest } from '../types/loanTypes.ts';

interface RequestActionDialogProps {
    show: boolean;
    variant: 'approve' | 'reject';
    // CHANGED: Updated type to UnifiedRequest
    request: UnifiedRequest | null;
    loading: boolean;
    onCancel: () => void;
    onConfirm: (reason: string) => void;
}

export default function RequestModal({
    show,
    variant,
    request,
    loading,
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

    const confirmButtonBaseClass = isReject
        ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600";

    const isConfirmDisabled = loading || (isReject && reason.trim() === "");

    // Helper for label styling with icons
    const LabelWithIcon = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            <Icon className="w-4 h-4" />
            {children}
        </label>
    );

    useEffect(() => {
        if (!show) {
            setReason("");
        }
    }, [show]);

    if (!show || !request) {
        return null;
    }

    // =========================================================================
    // NEW: DATA NORMALIZATION LAYER
    // We extract data safely because 'request' is now UnifiedRequest
    // =========================================================================
    const data = request.originalData || {};

    // Top level info
    const reqNumber = request.requestNumber;
    const reqType = data.kind === 'Purchase'
        ? getReasonBadge(REASON_MAP[data.reason], `${darkMode ? '' : 'soft'}`)
        : getTypeBadge(data.typeRequest, `${darkMode ? '' : 'soft'}`)

    const reqName = request.requester;
    const reqId = data.kind === 'Purchase' ? data.requesterId : data.requesterName;
    const deptId = data.departmentId || data.warehouseName || 'N/A'; // Fallback for purchase
    const projId = data.projectId; // Loans only
    const reqNotes = data.notes; 

    // Items Normalization
    const rawItems = data.items || [];
    const normalizedItems = rawItems.map((item: any) => ({
        id: item.id || Math.random(),
        // Handle different naming conventions (Loan vs Purchase)
        name: item.name || item.productName || 'Unknown Item',
        sku: item.sku || 'N/A',
        imageUrl: item.imageUrl,
        quantity: item.quantityRequested || item.quantity || 0
    }));
    // =========================================================================

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[3px]"
                onClick={loading ? undefined : onCancel}
            ></div>

            <div className="relative w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-950">

                <div className="mb-4">
                    <h2 className="text-xl text-center md:text-left font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <p className="text-sm text-center md:text-left text-gray-500 dark:text-gray-400">
                        {description}
                    </p>

                    {!loading && (
                        <X className='h-6 w-6 absolute right-0 top-0 m-4 text-gray-400 hover:text-red-500 hover:rotate-90 transition duration-300 cursor-pointer'
                            onClick={onCancel}
                        />
                    )}
                </div>

                {/* Cuerpo con Detalles */}
                <div className="space-y-4">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <LabelWithIcon icon={Hash}>Request Number</LabelWithIcon>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{reqNumber}</p>
                            </div>
                            <div>
                                <LabelWithIcon icon={FileText}>Type</LabelWithIcon>
                                {reqType}
                            </div>
                            <div className='overflow-x-auto'>
                                <LabelWithIcon icon={User}>Requested By</LabelWithIcon>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{reqName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{reqId}</p>
                            </div>
                            <div>
                                <LabelWithIcon icon={Building}>Department</LabelWithIcon>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{deptId}</p>
                            </div>
                        </div>

                        {/* Only show Project if it exists (Loans) */}
                        {projId && !isReject && (
                            <div>
                                <LabelWithIcon icon={Briefcase}>Project</LabelWithIcon>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{projId}</p>
                            </div>
                        )}

                        {!isReject && reqNotes && (
                            <div className='max-h-[150px] overflow-auto'>
                                <LabelWithIcon icon={StickyNote}>Notes / Reason</LabelWithIcon>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{reqNotes}</p>
                            </div>
                        )}

                        <div>
                            <LabelWithIcon icon={Package}>Items ({normalizedItems.length})</LabelWithIcon>
                            <div className="mt-2 grid gap-4 grid-cols-1 md:grid-cols-2 max-h-[200px] overflow-auto">
                                {normalizedItems.map((item) => (
                                    <div key={item.id} className="flex items-start space-x-3 p-2 border border-gray-200 dark:border-gray-700 rounded">
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/150'}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.sku}</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-200">
                                                    {item.quantity} units
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isReject && (
                        <div>
                            <label htmlFor="rejectionReason" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="rejectionReason"
                                rows={3}
                                disabled={loading}
                                className={`mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                                    shadow-sm bg-white dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 
                                    p-2 max-h-[100px]
                                    focus:border-red-500 focus:ring-red-600 focus:ring-1 focus:outline-none
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                placeholder="Explain why this request is being rejected..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            disabled={loading}
                            className={`rounded-md text-sm font-medium h-10 px-4 py-2 border border-gray-300 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 transition-colors
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                            `}
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={isConfirmDisabled}
                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors text-white
                                ${confirmButtonBaseClass}
                                ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => onConfirm(reason)}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}