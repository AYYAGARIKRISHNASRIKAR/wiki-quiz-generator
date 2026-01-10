import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-destructive/20 card-shadow m-4">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            The application encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="btn-secondary"
                            >
                                Try Again
                            </button>
                        </div>
                        {this.state.error && (
                            <pre className="mt-8 p-4 bg-secondary/50 rounded-lg text-xs text-left overflow-auto max-w-full text-destructive">
                                {this.state.error.message}
                            </pre>
                        )}
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
