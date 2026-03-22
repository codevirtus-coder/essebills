import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'confirm-dialog-title' : undefined}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {title && (
          <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-900 mb-2 pr-8">
            {title}
          </h2>
        )}

        <p className="text-sm text-slate-600 mb-5">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${
              destructive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

let confirmDialogCallback: (() => void) | null = null
let confirmDialogResolve: ((value: boolean) => void) | null = null

interface ConfirmDialogState {
  isOpen: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

let dialogState: ConfirmDialogState = {
  isOpen: false,
  message: '',
}

function notifyDialogUpdate() {
  window.dispatchEvent(new CustomEvent('confirm-dialog-update', { detail: { ...dialogState } }))
}

export function showConfirmDialog(
  message: string,
  onConfirm: () => void,
  options?: {
    title?: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
  }
): void {
  dialogState = {
    isOpen: true,
    message,
    title: options?.title,
    confirmLabel: options?.confirmLabel,
    cancelLabel: options?.cancelLabel,
    destructive: options?.destructive,
  }
  confirmDialogCallback = onConfirm
  notifyDialogUpdate()
}

export function ConfirmDialogContainer() {
  const [state, setState] = React.useState<ConfirmDialogState>({
    isOpen: false,
    message: '',
  })

  useEffect(() => {
    const handleUpdate = (e: CustomEvent<ConfirmDialogState>) => {
      setState(e.detail)
    }
    window.addEventListener('confirm-dialog-update', handleUpdate as EventListener)
    return () => window.removeEventListener('confirm-dialog-update', handleUpdate as EventListener)
  }, [])

  const handleConfirm = () => {
    if (confirmDialogCallback) {
      confirmDialogCallback()
    }
    dialogState = { isOpen: false, message: '' }
    confirmDialogCallback = null
    notifyDialogUpdate()
  }

  const handleCancel = () => {
    dialogState = { isOpen: false, message: '' }
    confirmDialogCallback = null
    notifyDialogUpdate()
  }

  return (
    <ConfirmDialog
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      destructive={state.destructive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
