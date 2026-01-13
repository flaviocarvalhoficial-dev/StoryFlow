import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado.</h1>
                        <p className="mb-4 text-gray-700">Ocorreu um erro ao renderizar a aplicação.</p>

                        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-60 mb-4 border border-gray-300">
                            <p className="font-mono text-sm text-red-800 font-bold mb-2">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Recarregar Página
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Limpar Cache e Recarregar
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
