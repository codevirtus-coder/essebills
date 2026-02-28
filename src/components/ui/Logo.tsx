import esebillsLogo from '../../assets/esebills_logo.png'
import type React from 'react'

export default function Logo({ size = 80, className = '', inverted = false }: { size?: number; className?: string; inverted?: boolean }) {
  const imgStyle: React.CSSProperties = {
    height: size,
    width: 'auto',
    filter: inverted ? 'brightness(0) invert(1)' : undefined,
  }

  return (
    <div className={`brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img src={esebillsLogo} alt="EseBills" style={imgStyle} />
    </div>
  )
}
