import React from 'react';
import {
    Clock,
    Check,
    XCircle,
    CheckCircle,
    AlertTriangle,
    ShoppingCart,
    ArrowRightLeft,
    Store,
    Package,
    Truck,
    HelpCircle,
    FileText,
    TrendingDown, 
    Sparkles
} from 'lucide-react';

import { Badge } from './Badge';


export const getStatusBadge = (status: string, style: string = 'soft') => {
    const isSoft = style === 'soft';
    const normalizedStatus = status?.toLowerCase() || 'unknown';

    switch (normalizedStatus) {
        // PENDING
        case 'pending':
            return (
                <Badge variant={isSoft ? 'warning-soft' : 'warning'}>
                    <Clock className="mr-1 h-3 w-3" /> Pending
                </Badge>
            );

        // PACKING 
        case 'packing':
            return (
                <Badge variant={isSoft ? 'warning-soft' : 'warning'}>
                    <Package className="mr-1 h-3 w-3" /> Packing
                </Badge>
            );

        // SENT
        case 'sent':
            return (
                <Badge variant={isSoft ? 'info-soft' : 'info'}>
                    <Truck className="mr-1 h-3 w-3" /> Sent
                </Badge>
            );

        // APPROVED
        case 'approved':
            return (
                <Badge variant={isSoft ? 'success-soft' : 'success'}>
                    <Check className="mr-1 h-3 w-3" /> Approved
                </Badge>
            );

        // REJECTED
        case 'rejected':
            return (
                <Badge variant={isSoft ? 'critical-soft' : 'critical'}>
                    <XCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
            );

        // COMPLETED
        case 'completed':
            return (
                <Badge variant={isSoft ? 'info-soft' : 'info'}>
                    <CheckCircle className="mr-1 h-3 w-3" /> Completed
                </Badge>
            );

        // ⚪ DEFAULT
        default:
            return (
                <Badge variant={isSoft ? 'neutral-soft' : 'neutral'}>
                    <HelpCircle className="mr-1 h-3 w-3" /> {status}
                </Badge>
            );
    }
};

export const getUrgencyBadge = (urgency: string, style: string = 'soft') => {
    const isSoft = style === 'soft';
    const normalized = urgency?.toLowerCase() || '';

    switch (normalized) {
        case 'low':
            return <Badge variant={isSoft ? 'success-soft' : 'success'}>Low</Badge>;
        case 'medium':
            return <Badge variant={isSoft ? 'warning-soft' : 'warning'}>Medium</Badge>;
        case 'high':
            return <Badge variant={isSoft ? 'critical-soft' : 'critical'}>High</Badge>;
        case 'urgent':
            return (
                <Badge variant="destructive" className="font-bold">
                    <AlertTriangle className="mr-1 h-3 w-3" /> URGENT
                </Badge>
            );
        default:
            return <Badge variant={isSoft ? 'neutral-soft' : 'neutral'}>{urgency}</Badge>;
    }
};

export const getTypeBadge = (type: number, style: string = 'soft') => {
    const isSoft = style === 'soft';

    switch (type) {
        // 1 - Loan Request
        case 1:
            return (
                <Badge variant={isSoft ? 'teal-soft' : 'teal'}>
                    <FileText className="mr-1 h-3 w-3" /> Loan Request
                </Badge>
            );

        // 2 - Purchase
        case 2:
            return (
                <Badge variant={isSoft ? 'brand-soft' : 'brand'}>
                    <ShoppingCart className="mr-1 h-3 w-3" /> Purchase
                </Badge>
            );

        // 3 - Purchase On Site
        case 3:
            return (
                <Badge variant={isSoft ? 'info-soft' : 'info'}>
                    <Store className="mr-1 h-3 w-3" /> Purchase On Site
                </Badge>
            );

        // 4 - Transfer On Site
        case 4:
            return (
                <Badge variant={isSoft ? 'neutral-soft' : 'neutral'}>
                    <ArrowRightLeft className="mr-1 h-3 w-3" /> Transfer On Site
                </Badge>
            );

        // Fallback for unknown IDs
        default:
            return (
                <Badge variant="outline">
                    <HelpCircle className="mr-1 h-3 w-3" /> Type {type}
                </Badge>
            );
    }
};

export const getReasonBadge = (reason: string, style: string = 'soft') => {
    const isSoft = style === 'soft';
    const normalized = reason?.toLowerCase() || '';

    switch (normalized) {
        case 'urgent':
            return (
                <Badge variant="destructive" className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-3 w-3" />
                    {reason} 
                </Badge>
            );

        case 'low stock':
            return (
                <Badge 
                    variant={isSoft ? 'warning-soft' : 'warning'} 
                    className="flex items-center gap-1.5"
                >
                    <TrendingDown className="h-3 w-3" />
                    {reason}

                </Badge>
            );

        case 'new project':
            return (
                <Badge 
                    variant={isSoft ? 'indigo-soft' : 'default'} 
                    className="flex items-center gap-1.5"
                >
                    <Sparkles className="h-3 w-3" />
                    {reason}
                </Badge>
            );

        default:
            return (
                <Badge variant={isSoft ? 'neutral-soft' : 'neutral'}>
                    {reason}
                </Badge>
            );
    }
};