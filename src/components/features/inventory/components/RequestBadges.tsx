import {
    Clock,
    Check,
    XCircle,
    CheckCircle,
    AlertTriangle,
    ShoppingCart,
    ArrowRightLeft,
    Store
} from 'lucide-react';

import { Badge } from './Badge';

type BadgeStyle = 'soft' | 'outline';

export const getStatusBadge = (status: string, style: BadgeStyle = 'soft') => {
    const isSoft = style === 'soft';

    switch (status) {
        case 'pending':
            return (
                <Badge variant={isSoft ? 'warning-soft' : 'warning'}>
                    <Clock className="mr-1 h-3 w-3" /> Pending
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant={isSoft ? 'success-soft' : 'success'}>
                    <Check className="mr-1 h-3 w-3" /> Approved
                </Badge>
            );
        case 'rejected':
            return (
                <Badge variant={isSoft ? 'critical-soft' : 'critical'}>
                    <XCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
            );
        case 'completed':
            return (
                <Badge variant={isSoft ? 'info-soft' : 'info'}>
                    <CheckCircle className="mr-1 h-3 w-3" /> Completed
                </Badge>
            );
        default:
            return <Badge variant={isSoft ? 'neutral-soft' : 'neutral'}>{status}</Badge>;
    }
};

export const getUrgencyBadge = (urgency: string, style: BadgeStyle = 'soft') => {
    const isSoft = style === 'soft';

    switch (urgency) {
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

export const getTypeBadge = (type: string, style: BadgeStyle = 'soft') => {
    const isSoft = style === 'soft';

    switch (type) {
        case 'transfer-on-site':
            return (
                <Badge variant={isSoft ? 'neutral-soft' : 'neutral'}>
                    <ArrowRightLeft className="mr-1 h-3 w-3" /> Transfer
                </Badge>
            );
        case 'purchase':
            return (
                <Badge variant={isSoft ? 'brand-soft' : 'brand'}>
                    <ShoppingCart className="mr-1 h-3 w-3" /> Purchase
                </Badge>
            );
        case 'purchase-on-site':
            return (
                <Badge variant={isSoft ? 'info-soft' : 'info'}>
                    <Store className="mr-1 h-3 w-3" /> Purchase On-Site
                </Badge>
            );
        default:
            return <Badge variant="outline" className="capitalize">{(type || '').replace(/-/g, ' ')}</Badge>;
    }
};