import type { ReactNode } from 'react'
import { ADMIN_CARD, ADMIN_LAYOUT_SHELL } from './adminUi'

interface AdminTableLayoutProps {
  title: string
  subtitle?: string
  sourceLabel?: string
  sourceValue?: string
  actions?: ReactNode
  stats?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
}

export function AdminTableLayout({
  title,
  subtitle,
  sourceLabel,
  sourceValue,
  actions,
  stats,
  toolbar,
  children,
}: AdminTableLayoutProps) {
  return (
    <div className={ADMIN_LAYOUT_SHELL}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">{title}</h2>
          {subtitle ? <p className="text-sm text-neutral-text">{subtitle}</p> : null}
          {sourceLabel && sourceValue ? (
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-text mt-2">
              {sourceLabel}: {sourceValue}
            </p>
          ) : null}
        </div>
        {actions}
      </div>

      {stats}

      {toolbar ? <div className={`${ADMIN_CARD} p-4 flex flex-col md:flex-row gap-4 items-center`}>{toolbar}</div> : null}

      {children}
    </div>
  )
}
