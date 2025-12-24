/**
 * Mappings for Backend Integer IDs to Human Readable Strings
 * matching your getStatusBadge and getUrgencyBadge logic.
 */

export const STATUS_MAP: Record<number, string> = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
    3: 'completed',
    4: 'packing',
    5: 'sent'
};

export const PRIORITY_MAP: Record<number, string> = {
    0: 'low',
    1: 'medium',
    2: 'high',
    3: 'urgent'
};

/**
 * Clean Date Formatter
 * Formats: "2025-12-23T..." -> "Dec 23, 2025"
 */
export const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Currency Formatter
 */
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

