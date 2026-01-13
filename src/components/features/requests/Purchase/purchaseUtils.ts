const STATUS_CODE_MAP: Record<number, 'pending' | 'approved' | 'rejected' | 'completed'> = {
  0: 'pending',
  1: 'approved',
  2: 'rejected',
  3: 'completed'
};

const REASON_CODE_MAP: Record<number, 'low-stock' | 'urgent' | 'new-project'> = {
  0: 'low-stock',
  1: 'urgent',
  2: 'new-project'
};

/**
 * Format date to readable string
 */
export function formatDate(dateString?: string | null, fallback: string = '—'): string {
  if (!dateString) {
    return fallback;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get color classes for status badge
 */
export function getStatusColor(status: string | number | undefined, statusName?: string): string {
  const normalized = normalizeStatus(status, statusName);

  switch (normalized) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'approved':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get human-readable status text
 */
export function getStatusText(status: string | number | undefined, statusName?: string): string {
  if (statusName) {
    return statusName;
  }

  if (typeof status === 'number') {
    const mapped = STATUS_CODE_MAP[status];
    if (mapped) {
      return getStatusText(mapped);
    }
    return `Estado ${status}`;
  }

  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

/**
 * Get color classes for reason badge
 */
export function getReasonColor(reason?: string | number, reasonName?: string): string {
  const normalized = normalizeReason(reason, reasonName);

  switch (normalized) {
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'low-stock':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'new-project':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get human-readable reason text
 */
export function getReasonText(reason: string | number, reasonName?: string): string {
  if (reasonName) {
    return reasonName;
  }

  if (typeof reason === 'number') {
    const mapped = REASON_CODE_MAP[reason];
    if (mapped) {
      return getReasonText(mapped);
    }
    return `Motivo ${reason}`;
  }

  switch (reason) {
    case 'low-stock':
      return 'Low stock';
    case 'urgent':
      return 'Urgent';
    case 'new-project':
      return 'New project';
    default:
      return reason;
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function normalizeStatus(status: string | number | undefined, statusName?: string): string {
  if (statusName) {
    return statusName.toLowerCase();
  }

  if (typeof status === 'number') {
    const mapped = STATUS_CODE_MAP[status];
    if (mapped) return mapped;
    return status.toString();
  }

  return (status ?? '').toLowerCase();
}

function normalizeReason(reason?: string | number, reasonName?: string): string {
  if (reasonName) {
    return reasonName.toLowerCase();
  }

  if (typeof reason === 'number') {
    const mapped = REASON_CODE_MAP[reason];
    if (mapped) return mapped;
    return reason.toString();
  }

  return (reason ?? '').toLowerCase();
}