import { goeyToast } from 'goey-toast'

/**
 * Shows a goey-toast warning with a "Confirm" action button.
 * The toast stays visible until the user confirms or dismisses it.
 * Dismissing (swipe, Escape, or close) acts as "Cancel".
 */
export function confirmToast(message: string, onConfirm: () => void) {
  goeyToast.warning(message, {
    duration: 10000,
    action: {
      label: 'Confirm',
      onClick: onConfirm,
    },
  })
}
