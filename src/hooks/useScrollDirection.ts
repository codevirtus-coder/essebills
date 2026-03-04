import { useEffect, useRef, useState } from 'react'

export type ScrollDirection = 'up' | 'down'

export function useScrollDirection(threshold = 4): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('down')
  const lastYRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    lastYRef.current = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastYRef.current

      if (Math.abs(delta) < threshold) return

      setDirection(delta > 0 ? 'down' : 'up')
      lastYRef.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return direction
}
