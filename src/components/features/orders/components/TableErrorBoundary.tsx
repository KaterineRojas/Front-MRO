// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { TableErrorState } from './TableErrorState';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class TableErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in OrderTable:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return <TableErrorState message="The data format received was unexpected." />;
        }

        return this.props.children;
    }
}