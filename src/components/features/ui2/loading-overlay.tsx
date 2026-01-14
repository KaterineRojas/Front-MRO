import React from 'react';
import { Loader2, Package } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'minimal';
}

/**
 * Loading overlay component that blocks the entire page with a spinner
 * Can be used globally or for specific sections
 */
export function LoadingOverlay({ isLoading, message = 'Loading...', children, variant = 'default' }: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  // Minimal variant - just spinner, no card
  if (variant === 'minimal') {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-6">
            {/* Large spinning icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
              <Loader2
                className="relative h-20 w-20 text-primary"
                strokeWidth={2.5}
                style={{
                  animation: 'spin 1s linear infinite'
                }}
              />
            </div>

            {/* Optional message */}
            {message && (
              <p className="text-lg font-medium text-foreground animate-pulse">{message}</p>
            )}
          </div>
        </div>

        {/* Ensure spin animation is defined */}
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  // Default variant - with card
  return (
    <>
      {children}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="relative flex flex-col items-center space-y-6">
          {/* Animated circles background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-primary/20 animate-ping"></div>
          </div>

          {/* Main loading card */}
          <div className="relative flex flex-col items-center space-y-4 rounded-2xl bg-card p-10 shadow-2xl border-2 border-primary/10">
            {/* Icon container with gradient */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-primary/10 p-4 rounded-full">
                <Loader2 className="h-14 w-14 animate-spin text-primary" strokeWidth={2.5} />
              </div>
            </div>

            {/* Loading text */}
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xl font-semibold text-foreground tracking-tight">{message}</p>
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground animate-pulse">Please wait a moment...</p>
        </div>
      </div>
    </>
  );
}

/**
 * Simple inline loading spinner
 */
export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center space-x-3 p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
        <Loader2 className="relative h-7 w-7 animate-spin text-primary" strokeWidth={2.5} />
      </div>
      {message && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{message}</span>
          <div className="flex space-x-1 mt-1">
            <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for cards and content
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-3">
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
        <div className="h-3 w-full bg-muted animate-pulse rounded"></div>
        <div className="h-3 w-4/5 bg-muted animate-pulse rounded"></div>
      </div>
    </div>
  );
}

/**
 * Full page loading with branding
 */
export function FullPageLoading({ message = 'Loading Inventory System...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo/Icon with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-primary/20 p-8 rounded-full animate-bounce">
            <Package className="h-20 w-20 text-primary" strokeWidth={2} />
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-64 space-y-4">
          <p className="text-center text-xl font-semibold text-foreground">{message}</p>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                 style={{
                   animation: 'loading 1.5s ease-in-out infinite',
                   width: '40%',
                 }}
            ></div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Preparing your workspace...</p>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(250%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
