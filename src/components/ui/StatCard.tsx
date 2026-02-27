type StatCardProps = {
  // common
  label?: string
  title?: string
  value?: string | number
  subtitle?: string
  // optional visual props used in various features
  change?: string
  icon?: string
  iconBg?: string
  iconColor?: string
  chartPath?: string
  strokeColor?: string
}

export default function StatCard({ label, title, value, subtitle }: StatCardProps) {
  const displayTitle = title ?? label ?? ''
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{displayTitle}</div>
      {subtitle && <div className="stat-sub">{subtitle}</div>}
    </div>
  )
}
