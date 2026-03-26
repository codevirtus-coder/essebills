import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface PortalDropdownProps {
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>
    onClick: () => void
    open: boolean
  }) => React.ReactNode
  children: (close: () => void) => React.ReactNode
  align?: 'left' | 'right'
}

/**
 * Renders a dropdown via a React portal at document.body so it escapes any
 * overflow-hidden / overflow-x-auto ancestors (e.g. table wrappers).
 * Position is calculated from the trigger button's bounding rect.
 */
export function PortalDropdown({ trigger, children, align = 'right' }: PortalDropdownProps) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const updateStyle = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    // Estimate menu height; open upward if less than 260px below trigger
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < 260
    setStyle({
      position: 'fixed',
      ...(openUpward ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      ...(align === 'right'
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      zIndex: 9999,
    })
  }, [align])

  const handleToggle = useCallback(() => {
    updateStyle()
    setOpen(v => !v)
  }, [updateStyle])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return (
    <>
      {trigger({ ref: triggerRef, onClick: handleToggle, open })}
      {open && createPortal(
        <div ref={menuRef} style={style}>
          {children(() => setOpen(false))}
        </div>,
        document.body,
      )}
    </>
  )
}
