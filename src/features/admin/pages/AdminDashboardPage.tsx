import { useNavigate, useParams } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import UserProfile from '../components/UserProfile'
import Billers from '../components/Billers'
import Products from '../components/Products'
import Agents from '../components/Agents'
import AdminUsersPage from '../components/AdminUsersPage'
import AdminUserGroupsPage from '../components/AdminUserGroupsPage'
import AdminTransactionsPage from '../components/AdminTransactionsPage'
import AdminParametersPage from '../components/AdminParametersPage'
import AdminStyledApiModulePage from '../components/AdminStyledApiModulePage'
import Settings from '../components/Settings'
import Commissions from '../components/Commissions'
import Support from '../components/Support'
import WhatsAppCenter from '../components/WhatsAppCenter'
import AdminFeaturePlaceholder from '../components/AdminFeaturePlaceholder'
import {
  createPesepayCredentials,
  getPaginatedPesepayCredentials,
  getPaginatedEsebillsAccounts,
  createEsebillsAccount,
  updateEsebillsAccount,
  deleteEsebillsAccount,
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
      case 'profile':
        return <UserProfile />
      case 'notifications':
        return <NotificationsPage />
      case 'transactions':
      case 'transactionsZambiaProducts':
      case 'transactionsZimProducts':
        return <AdminTransactionsPage />
      case 'vouchersZambiaProducts':
        return <AdminFeaturePlaceholder title="Zambia Vouchers" description="Manage and distribute digital vouchers for the Zambian market." />
      case 'vouchersZimProducts':
        return <AdminFeaturePlaceholder title="Zim Vouchers" description="Manage and distribute digital vouchers for the Zimbabwean market." />
      case 'rongekaAccounts':
        return (
          <AdminStyledApiModulePage
            key="rongekaAccounts"
            title="Rongeka Accounts"
            description="Manage Rongeka integration bank accounts and settlement parameters."
            endpoint="/v1/rongeka-accounts"
            loadData={getPaginatedEsebillsAccounts} // Fallback or dedicated service
            tableMode="auto"
          />
        )
      case 'tuitionTransactions':
        return <AdminTransactionsPage />
      case 'tuitionInstitutions':
        return <AdminFeaturePlaceholder title="Tuition Institutions" description="Configure educational institutions for tuition fee collections." />
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
            ]}
            createFields={[
              { key: 'bank', label: 'Bank', type: 'text' },
              { key: 'accountNumber', label: 'Account Number', type: 'text' },
              { key: 'accountName', label: 'Account Name', type: 'text' },
            ]}
            emptyLabel="EseBillsAccounts"
            onUpdate={updateEsebillsAccount}
            onDelete={deleteEsebillsAccount}
          />
        )
      case 'providers':
        return <AdminFeaturePlaceholder title="Providers" description="Enable or disable payment providers (ESOLUTIONS, ECONET_DIRECT, NETONE_DIRECT, ZESA_DIRECT)." />
      case 'commissions':
        return <Commissions />
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
