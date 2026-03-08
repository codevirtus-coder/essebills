import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

const ErrorPage: React.FC<{ error?: Error | string; onRetry?: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-emerald-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <div className="max-w-md w-full glass-card p-10 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl animate-in fade-in duration-500">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-tr from-red-100 via-emerald-100 to-blue-100 dark:from-red-900/20 dark:via-emerald-900/20 dark:to-blue-900/20">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-8 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Oops! Something went wrong
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
            An unexpected error occurred. Please try again or contact support if the issue persists.
          </p>
          {error && (
            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-left border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Diagnostic Info:</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-mono break-words leading-relaxed">
                {typeof error === "string" ? error : error.message}
              </p>
            </div>
          )}
          <div className="mt-10 flex flex-col gap-3">
            <button
              onClick={onRetry}
              className="w-full inline-flex items-center justify-center px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
