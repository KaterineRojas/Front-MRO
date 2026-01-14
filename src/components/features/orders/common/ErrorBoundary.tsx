import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center border rounded-lg bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800">
                    <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Something went wrong</h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-sm underline text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}