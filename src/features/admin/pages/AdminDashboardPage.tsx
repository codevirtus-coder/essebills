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
import AdminStyledApiModulePage from '../components/AdminStyledApiModulePage'
import Settings from '../components/Settings'
import Commissions from '../components/Commissions'
import BankTopUps from '../components/BankTopUps'
import Support from '../components/Support'
import WhatsAppCenter from '../components/WhatsAppCenter'
import Donations from '../components/Donations'
import EsolutionsAdminPanel from '../components/EsolutionsAdminPanel'
import { NotificationsPage } from '../../../pages/NotificationsPage'
import {
  createPesepayCredentials,
  getPaginatedPesepayCredentials,
  updatePesepayCredentials,
  deletePesepayCredentials,
  getPaginatedEsebillsAccounts,
  createEsebillsAccount,
  updateEsebillsAccount,
  deleteEsebillsAccount,
} from '../services'
import { getCurrencies } from '../../../services'
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
      case 'parametersCurrencies':
        return <AdminParametersPage module="currencies" />
      case 'parametersCountries':
        return <AdminParametersPage module="countries" />
      case 'parametersHolidays':
        return <AdminParametersPage module="holidays" />
      case 'parametersBanks':
        return <AdminParametersPage module="banks" />
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
        return (
          <AdminStyledApiModulePage
            key="esebillsAccounts"
            title="EseBills Accounts"
            description="Platform bank accounts used for settlement."
            endpoint="/v1/esebills-accounts"
            createEndpoint="/v1/esebills-accounts"
            createData={createEsebillsAccount}
            loadData={getPaginatedEsebillsAccounts}
            tableMode="auto"
            createMode="fields"
            columns={[
              { key: 'bank', label: 'Bank' },
              { key: 'accountNumber', label: 'Account Number' },
              { key: 'accountName', label: 'Account Name' },
              { key: 'currency.code', label: 'Currency' },
            ]}
            createFields={[
              { key: 'bank', label: 'Bank', type: 'text' },
              { key: 'accountNumber', label: 'Account Number', type: 'text' },
              { key: 'accountName', label: 'Account Name', type: 'text' },
              {
                key: 'currencyCode',
                label: 'Currency',
                type: 'select',
                optionsLoader: async () => {
                  const page = await getCurrencies()
                  const list = Array.isArray(page?.content) ? page.content : []
                  return list
                    .filter((c) => c.active !== false && c.code)
                    .map((c) => ({ label: String(c.code), value: String(c.code) }))
                },
              },
            ]}
            emptyLabel="EseBillsAccounts"
            onUpdate={updateEsebillsAccount}
            onDelete={deleteEsebillsAccount}
          />
        )
      case 'providers':
        return <EsolutionsAdminPanel />
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
