import React from 'react'
import { GoeyToaster, goeyToast } from 'goey-toast'
import 'goey-toast/styles.css'

type ToastLike = {
  (message: string, options?: Record<string, unknown>): string | number
  success: (message: string, options?: Record<string, unknown>) => string | number
  error: (message: string, options?: Record<string, unknown>) => string | number
  loading?: (message: string, options?: Record<string, unknown>) => string | number
  dismiss: (id?: string | number) => void
  promise?: typeof goeyToast.promise
}

const toastShim: ToastLike = Object.assign(
  (message: string, options?: Record<string, unknown>) => goeyToast(message, { duration: 4000, ...options }),
  {
    success: (message: string, options?: Record<string, unknown>) =>
      goeyToast.success(message, { duration: 4000, ...options }),
    error: (message: string, options?: Record<string, unknown>) =>
      goeyToast.error(message, { duration: 6000, ...options }),
    loading: (message: string, options?: Record<string, unknown>) =>
      goeyToast(message, { duration: 0, ...options }),
    dismiss: (id?: string | number) => {
      goeyToast.dismiss(id)
    },
    promise: goeyToast.promise,
  },
)

export const toast = toastShim

export type ToasterProps = {
  position?: React.ComponentProps<typeof GoeyToaster>['position']
  toastOptions?: {
    duration?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

export function Toaster({ position = 'top-right', toastOptions }: ToasterProps) {
  return (
    <GoeyToaster
      position={position}
      toastOptions={toastOptions}
    />
  )
}

export default toastShim
