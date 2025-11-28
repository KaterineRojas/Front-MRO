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

export const RequestStatusBadge = ( status : string) => {
    switch (status) {
        case 'pending':
            return (
                <Badge variant="warning">
                    <Clock className="mr-1 h-3 w-3" /> Pending
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="success">
                    <Check className="mr-1 h-3 w-3" /> Approved
                </Badge>
            );
        case 'rejected':
            return (
                <Badge variant="critical">
                    <XCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
            );
        case 'completed':
            return (
                <Badge variant="info">
                    <CheckCircle className="mr-1 h-3 w-3" /> Completed
                </Badge>
            );
        default:
            return <Badge variant="neutral">{status}</Badge>;
    }
};

export const UrgencyBadge = ( urgency : string) => {
    switch (urgency) {
        case 'low':
            return <Badge variant="success">Low</Badge>;
        case 'medium':
            return <Badge variant="warning">Medium</Badge>;
        case 'high':
            return <Badge variant="critical">High</Badge>;
        case 'urgent':
            return (
                <Badge variant="destructive" className="font-bold">
                    <AlertTriangle className="mr-1 h-3 w-3" /> URGENT
                </Badge>
            );
        default:
            return <Badge variant="neutral">{urgency}</Badge>;
    }
};


export const RequestTypeBadge = ( type : string) => {
    switch (type) {
        case 'transfer-on-site':
            return (
                <Badge variant="neutral">
                    <ArrowRightLeft className="mr-1 h-3 w-3" /> Transfer
                </Badge>
            );
        case 'purchase':
            return (
                <Badge variant="brand">
                    <ShoppingCart className="mr-1 h-3 w-3" /> Purchase
                </Badge>
            );
        case 'purchase-on-site':
            return (
                <Badge variant="info">
                    <Store className="mr-1 h-3 w-3" /> Purchase On-Site
                </Badge>
            );
        default:
            return <Badge variant="outline" className="capitalize">{type.replace(/-/g, ' ')}</Badge>;
    }
};