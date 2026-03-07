import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fullscreen';
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showActions?: boolean;
}

export default function CRUDModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  showActions = true,
}: Readonly<CRUDModalProps>) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
    fullscreen: 'max-w-none',
  };

  const isFullscreen = size === 'fullscreen';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed inset-0 z-50 ${isFullscreen ? 'flex items-stretch justify-stretch' : 'flex items-center justify-center p-4'}`}
          >
            <div
              className={`bg-white dark:bg-slate-900 shadow-2xl w-full ${sizeClasses[size]} flex flex-col ${
                isFullscreen ? 'h-screen rounded-none' : 'max-h-[90vh] rounded-2xl'
              } border border-slate-200 dark:border-slate-800`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 dark:text-slate-300">
                {children}
              </div>
              
              {/* Footer */}
              {showActions && (
                <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 ${isFullscreen ? '' : 'rounded-b-2xl'}`}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  {onSubmit && (
                    <button
                      onClick={onSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
