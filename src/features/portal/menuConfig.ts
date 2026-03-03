import type { UserGroup } from '../auth/dto/auth.dto'

export type MenuItem = {
  id: string
  label: string
  icon: string
  path?: string
  children?: MenuItem[]
}

export type MenuSection = {
  id: string
  title?: string
  items: MenuItem[]
}

// Admin menu - full access
export const ADMIN_MENU: MenuSection[] = [
  {
    id: 'payments',
    title: 'Payments',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      {
        id: 'transactions',
        label: 'Transactions',
        icon: 'sync_alt',
        children: [
          { id: 'transactionsZambiaProducts', label: 'Zambia Products', icon: 'subdirectory_arrow_right' },
          { id: 'transactionsZimProducts', label: 'Zim Products', icon: 'subdirectory_arrow_right' },
        ],
      },
      {
        id: 'vouchers',
        label: 'Vouchers',
        icon: 'confirmation_number',
        children: [
          { id: 'vouchersZambiaProducts', label: 'Zambia Products', icon: 'subdirectory_arrow_right' },
          { id: 'vouchersZimProducts', label: 'Zim Products', icon: 'subdirectory_arrow_right' },
        ],
      },
      { id: 'rongekaAccounts', label: 'Rongeka Accounts', icon: 'account_balance_wallet' },
      { id: 'products', label: 'Products', icon: 'inventory_2' },
    ],
  },
  {
    id: 'platform',
    title: 'Platform',
    items: [
      {
        id: 'parameters',
        label: 'Parameters',
        icon: 'tune',
        children: [
          { id: 'parametersCurrencies', label: 'Currencies', icon: 'subdirectory_arrow_right' },
          { id: 'parametersCountries', label: 'Countries', icon: 'subdirectory_arrow_right' },
          { id: 'parametersHolidays', label: 'Holidays', icon: 'subdirectory_arrow_right' },
          { id: 'parametersBanks', label: 'Banks', icon: 'subdirectory_arrow_right' },
          { id: 'parametersProductCategories', label: 'Product Categories', icon: 'subdirectory_arrow_right' },
        ],
      },
      {
        id: 'sms',
        label: 'SMS',
        icon: 'sms',
        children: [
          { id: 'smsMessages', label: 'SMSes', icon: 'subdirectory_arrow_right' },
          { id: 'smsCharges', label: 'SMS Charges', icon: 'subdirectory_arrow_right' },
        ],
      },
      {
        id: 'userSettings',
        label: 'User Settings',
        icon: 'manage_accounts',
        children: [
          { id: 'userSettingsUsers', label: 'Users', icon: 'subdirectory_arrow_right' },
          { id: 'userSettingsGroups', label: 'Groups', icon: 'subdirectory_arrow_right' },
        ],
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    items: [
      {
        id: 'econet',
        label: 'Econet',
        icon: 'network_cell',
        children: [
          { id: 'econetBundlePlanTypes', label: 'Bundle Plan Types', icon: 'subdirectory_arrow_right' },
          { id: 'econetDataBundleTypes', label: 'Data Bundle Types', icon: 'subdirectory_arrow_right' },
        ],
      },
      {
        id: 'netone',
        label: 'Netone',
        icon: 'network_cell',
        children: [
          { id: 'netoneBundlePlanTypes', label: 'Bundle Plan Types', icon: 'subdirectory_arrow_right' },
          { id: 'netoneDataBundleTypes', label: 'Data Bundle Types', icon: 'subdirectory_arrow_right' },
        ],
      },
      {
        id: 'credentials',
        label: 'Credentials',
        icon: 'vpn_key',
        children: [
          { id: 'credentialsPesepay', label: 'Pesepay', icon: 'subdirectory_arrow_right' },
          { id: 'credentialsCgrate', label: 'Cgrate', icon: 'subdirectory_arrow_right' },
          { id: 'credentialsZesa', label: 'Zesa', icon: 'subdirectory_arrow_right' },
          { id: 'credentialsEconet', label: 'Econet', icon: 'subdirectory_arrow_right' },
          { id: 'credentialsEsolutionsSms', label: 'Esolutions SMS', icon: 'subdirectory_arrow_right' },
          { id: 'credentialsNetoneEvd', label: 'Netone EVD', icon: 'subdirectory_arrow_right' },
          { id: 'credentialsEsolutionsAirtime', label: 'Esolutions Airtime', icon: 'subdirectory_arrow_right' },
        ],
      },
      {
        id: 'tuition',
        label: 'Tuition',
        icon: 'school',
        children: [
          { id: 'tuitionTransactions', label: 'Transactions', icon: 'subdirectory_arrow_right' },
          { id: 'tuitionInstitutions', label: 'Institutions', icon: 'subdirectory_arrow_right' },
          { id: 'tuitionFeeTypes', label: 'Fee Types', icon: 'subdirectory_arrow_right' },
          { id: 'tuitionProcessingFees', label: 'Processing Fees', icon: 'subdirectory_arrow_right' },
        ],
      },
    ],
  },
  {
    id: 'ops',
    title: 'Operations',
    items: [
      { id: 'billers', label: 'Billers', icon: 'corporate_fare' },
      { id: 'agents', label: 'Agents', icon: 'storefront' },
      { id: 'commissions', label: 'Commissions', icon: 'payments' },
      { id: 'whatsapp', label: 'WhatsApp Center', icon: 'mark_chat_read' },
      { id: 'reports', label: 'Reports', icon: 'analytics' },
    ],
  },
]

// Admin preference items (Profile, Settings, Support)
export const ADMIN_PREFERENCE_ITEMS: MenuItem[] = [
  { id: 'profile', label: 'Profile', icon: 'account_circle' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'support', label: 'Support', icon: 'help' },
]

// Agent menu - limited access
export const AGENT_MENU: MenuSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Dashboard', icon: 'home' },
      { id: 'sell', label: 'Make a Sale', icon: 'point_of_sale' },
      { id: 'commissions', label: 'Earnings Analysis', icon: 'payments' },
      { id: 'schedule', label: 'Commission Schedule', icon: 'table_chart' },
      { id: 'float', label: 'Float Wallet', icon: 'account_balance_wallet' },
      { id: 'profile', label: 'Profile', icon: 'person' },
    ],
  },
]

// Biller menu
export const BILLER_MENU: MenuSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Dashboard', icon: 'home' },
      { id: 'collections', label: 'Collections', icon: 'payments' },
      { id: 'settlements', label: 'Settlements', icon: 'account_balance' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
      { id: 'profile', label: 'Profile', icon: 'person' },
    ],
  },
]

// Customer menu
export const CUSTOMER_MENU: MenuSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Dashboard', icon: 'home' },
      { id: 'transactions', label: 'My Transactions', icon: 'receipt_long' },
      { id: 'profile', label: 'Profile', icon: 'person' },
    ],
  },
]

export function getMenuByGroup(group: UserGroup): MenuSection[] {
  switch (group) {
    case 'ADMIN':
      return ADMIN_MENU
    case 'AGENT':
      return AGENT_MENU
    case 'BILLER':
      return BILLER_MENU
    case 'CUSTOMER':
      return CUSTOMER_MENU
    default:
      return CUSTOMER_MENU
  }
}
