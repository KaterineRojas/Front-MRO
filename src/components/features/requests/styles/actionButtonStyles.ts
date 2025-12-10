/**
 * Reusable animation styles for action buttons across all request modules
 * Used in: Transfer, Borrow, Purchase
 */

export const actionButtonAnimationStyles = `
  @keyframes scaleHover {
    0% { transform: scale(1); }
    100% { transform: scale(1.12); }
  }

  @keyframes colorPulse {
    0% { filter: brightness(1); }
    100% { filter: brightness(1.2); }
  }
  
  .action-btn-enhance {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    position: relative !important;
  }
  
  .action-btn-enhance:hover {
    animation: scaleHover 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, 
               colorPulse 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
    transform: scale(1.12) !important;
  }
  
  /* Accept Button - Green */
  .btn-accept {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
  }
  
  .btn-accept:hover {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5) !important;
    border: none !important;
    color: white !important;
  }
  
  .btn-accept:active,
  .btn-accept:focus,
  .btn-accept:focus-visible {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5) !important;
    outline: none !important;
    border: none !important;
  }
  
  .btn-accept:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
  
  /* Reject Button - Red */
  .btn-reject {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
  }
  
  .btn-reject:hover {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%) !important;
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5) !important;
    border: none !important;
    color: white !important;
  }
  
  .btn-reject:active,
  .btn-reject:focus,
  .btn-reject:focus-visible {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5) !important;
    outline: none !important;
    border: none !important;
  }
  
  .btn-reject:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
  
  /* Cancel Button - Orange */
  .btn-cancel {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
  }
  
  .btn-cancel:hover {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%) !important;
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.5) !important;
    border: none !important;
    color: white !important;
  }
  
  .btn-cancel:active,
  .btn-cancel:focus,
  .btn-cancel:focus-visible {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.5) !important;
    outline: none !important;
    border: none !important;
  }
  
  .btn-cancel:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }

  /* Approve Button - Blue */
  .btn-approve {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
  }
  
  .btn-approve:hover {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5) !important;
    border: none !important;
    color: white !important;
  }
  
  .btn-approve:active,
  .btn-approve:focus,
  .btn-approve:focus-visible {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5) !important;
    outline: none !important;
    border: none !important;
  }

  /* Delete Button - Purple */
  .btn-delete {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
  }
  
  .btn-delete:hover {
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%) !important;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.5) !important;
    border: none !important;
    color: white !important;
  }
  
  .btn-delete:active,
  .btn-delete:focus,
  .btn-delete:focus-visible {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%) !important;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.5) !important;
    outline: none !important;
    border: none !important;
  }
`;

/**
 * Hook to inject action button styles into a component
 * Usage: useActionButtonStyles() in your component
 */
export function useActionButtonStyles(): void {
  if (typeof document !== 'undefined') {
    // Check if styles are already injected
    const styleId = 'action-button-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = actionButtonAnimationStyles;
      document.head.appendChild(style);
    }
  }
}
