import { useNavigate, useParams } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import UserProfile from '../components/UserProfile'
import Billers from '../components/Billers'
import Products from '../components/Products'
import Agents from '../components/Agents'
import AdminUsersPage from '../components/AdminUsersPage'
import AdminUserGroupsPage from '../components/AdminUserGroupsPage'
import AdminTransactionsPage from '../components/AdminTransactionsPage'
import BulkPaymentsPage from '../../agent/pages/BulkPaymentsPage'
import AdminParametersPage from '../components/AdminParametersPage'
import AdminCountryCurrenciesPage from '../components/AdminCountryCurrenciesPage'
import AdminStyledApiModulePage from '../components/AdminStyledApiModulePage'
import Settings from '../components/Settings'
import Commissions from '../components/Commissions'
import BankTopUps from '../components/BankTopUps'
import Support from '../components/Support'
import WhatsAppCenter from '../components/WhatsAppCenter'
import Donations from '../components/Donations'
import AdminBankAccountsPage from '../components/AdminBankAccountsPage'
import AdminProvidersPage from '../components/AdminProvidersPage'
import AdminDiagnosticsPage from '../components/AdminDiagnosticsPage'
import { NotificationsPage } from '../../../pages/NotificationsPage'
import {
  createPesepayCredentials,
  getPaginatedPesepayCredentials,
  updatePesepayCredentials,
  deletePesepayCredentials,
} from '../services'
import { ROUTE_PATHS } from '../../../router/paths'
import '../styles/admin-dashboard.css'

type AdminTab = string

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { tab: urlTab } = useParams()

  const activeTab: AdminTab = urlTab ?? 'dashboard'

  const handleTabChange = (tab: AdminTab) => {
    if (tab === 'dashboard') {
      navigate(ROUTE_PATHS.portalAdmin)
    } else {
      navigate(`${ROUTE_PATHS.portalAdmin}/${tab}`)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'donations':
        return <Donations />
      case 'profile':
        return <UserProfile />
      case 'notifications':
        return <NotificationsPage />
      case 'transactions':
      case 'transactionsZambiaProducts':
      case 'transactionsZimProducts':
        return <AdminTransactionsPage />
      case 'bulkPayments':
        return <BulkPaymentsPage />
      case 'billers':
        return (
          <Billers
            onOnboard={() => {
              handleTabChange('parametersProductCategories')
            }}
          />
        )
      case 'products':
        return <Products />
      case 'agents':
        return <Agents />
      case 'users':
      case 'userSettingsUsers':
        return <AdminUsersPage />
      case 'userSettingsGroups':
        return <AdminUserGroupsPage />
      case 'whatsapp':
        return <WhatsAppCenter />
      case 'diagnostics':
        return <AdminDiagnosticsPage />
      case 'parametersCurrencies':
        return <AdminParametersPage module="currencies" />
      case 'parametersCountries':
        return <AdminParametersPage module="countries" />
      case 'parametersHolidays':
        return <AdminParametersPage module="holidays" />
      case 'parametersBanks':
        return <AdminParametersPage module="banks" />
      case 'parametersCountryCurrencies':
        return <AdminCountryCurrenciesPage />
      case 'parametersProductCategories':
        return <AdminParametersPage module="productCategories" />
      case 'credentialsPesepay':
        return (
          <AdminStyledApiModulePage
            key="credentialsPesepay"
            title="Pesepay Credentials"
            description="Pesepay integration credential records."
            endpoint="/v1/pesepay-integration-credentials"
            createEndpoint="/v1/pesepay-integration-credentials"
            createData={createPesepayCredentials}
            loadData={getPaginatedPesepayCredentials}
            onUpdate={updatePesepayCredentials}
            onDelete={deletePesepayCredentials}
          />
        )
      case 'esebillsAccounts':
        return <AdminBankAccountsPage />
      case 'providers':
        return <AdminProvidersPage />
      case 'commissions':
        return <Commissions />
      case 'bankTopUps':
        return <BankTopUps />
      case 'settings':
        return <Settings initialTab="commissions" />
      case 'support':
        return <Support />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {renderContent()}
    </div>
  )
}
