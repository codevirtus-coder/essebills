import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
          <div className="max-w-md w-full glass-card p-10 border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="mt-8 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Something went wrong
              </h2>
              
              <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                An unexpected error occurred. Our team has been notified.
              </p>
              
              {this.state.error && (
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-left border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Diagnostic Info:</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono break-words leading-relaxed">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="mt-10 flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Attempt Recovery
                </button>
                
                <Link
                  to="/"
                  onClick={this.handleReset}
                  className="w-full inline-flex items-center justify-center px-6 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
