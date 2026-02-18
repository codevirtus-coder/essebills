import { Icon } from './Icon'
import '../features/shared/styles/role-dashboard.css'

type Metric = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'neutral'
}

type Activity = {
  title: string
  time: string
  amount?: string
}

type QuickAction = {
  label: string
  icon: string
}

type RoleDashboardProps = {
  role: string
  title: string
  subtitle: string
  metrics: Metric[]
  activities: Activity[]
  quickActions: QuickAction[]
}

function metricTrendClass(trend: Metric['trend']) {
  if (trend === 'up') return 'dashboard-metric-delta up'
  if (trend === 'down') return 'dashboard-metric-delta down'
  return 'dashboard-metric-delta neutral'
}

export function RoleDashboard({ role, title, subtitle, metrics, activities, quickActions }: RoleDashboardProps) {
  return (
    <section className="dashboard-page">
      <div className="container">
        <header className="dashboard-header">
          <p className="type-overline dashboard-kicker">{role} Dashboard</p>
          <h1 className="type-section-title">{title}</h1>
          <p className="type-body text-muted">{subtitle}</p>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-panel dashboard-metrics" aria-label={`${role} key metrics`}>
            {metrics.map((metric) => (
              <article key={metric.label} className="dashboard-metric-card">
                <p className="dashboard-metric-label">{metric.label}</p>
                <p className="dashboard-metric-value">{metric.value}</p>
                <p className={metricTrendClass(metric.trend)}>{metric.delta}</p>
              </article>
            ))}
          </section>

          <section className="dashboard-panel dashboard-activities" aria-label={`${role} recent activities`}>
            <div className="dashboard-panel-head">
              <h2 className="type-title-md">Recent Activity</h2>
            </div>
            <div className="dashboard-list">
              {activities.map((activity) => (
                <article key={`${activity.title}-${activity.time}`} className="dashboard-list-row">
                  <div>
                    <p className="dashboard-row-title">{activity.title}</p>
                    <p className="dashboard-row-time">{activity.time}</p>
                  </div>
                  {activity.amount ? <p className="dashboard-row-amount">{activity.amount}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-panel dashboard-actions" aria-label={`${role} quick actions`}>
            <div className="dashboard-panel-head">
              <h2 className="type-title-md">Quick Actions</h2>
            </div>
            <div className="dashboard-action-grid">
              {quickActions.map((action) => (
                <button key={action.label} type="button" className="dashboard-action-button">
                  <Icon name={action.icon} className="icon-sm" />
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
