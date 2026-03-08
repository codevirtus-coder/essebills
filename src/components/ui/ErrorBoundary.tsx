import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Oops! Something went wrong</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                An unexpected error occurred. Our team has been notified and we're working to fix it.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-mono text-red-500 break-all line-clamp-2">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Try Refreshing
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Return Home
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              Error Code: ESE-500-SYSTEM
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
