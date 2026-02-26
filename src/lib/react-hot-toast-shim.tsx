import React from 'react'
import { GoeyToaster, goeyToast } from 'goey-toast'
import 'goey-toast/styles.css'

type ReactHotToastLike = {
  (message: string, options?: Record<string, unknown>): string | number
  success: (message: string, options?: Record<string, unknown>) => string | number
  error: (message: string, options?: Record<string, unknown>) => string | number
  loading?: (message: string, options?: Record<string, unknown>) => string | number
  dismiss: (id?: string | number) => void
  promise?: typeof goeyToast.promise
}

const toastShim = Object.assign(
  (message: string, options?: Record<string, unknown>) => goeyToast(message, options),
  {
    success: (message: string, options?: Record<string, unknown>) =>
      goeyToast.success(message, options),
    error: (message: string, options?: Record<string, unknown>) =>
      goeyToast.error(message, options),
    loading: (message: string, options?: Record<string, unknown>) =>
      goeyToast.info(message, options),
    dismiss: (id?: string | number) => {
      goeyToast.dismiss(id)
    },
    promise: goeyToast.promise,
  },
) as ReactHotToastLike

type ToasterProps = {
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

