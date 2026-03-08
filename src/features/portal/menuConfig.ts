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

// Admin menu — aligned to API spec endpoints
export const ADMIN_MENU: MenuSection[] = [
  {
    id: 'payments',
    title: 'Payments',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'transactions', label: 'Transactions', icon: 'sync_alt' },
    ],
  },
  {
    id: 'donations',
    title: 'Donations',
    items: [
      { id: 'donations', label: 'Donations', icon: 'favorite' },
    ],
  },
  {
    id: 'catalog',
    title: 'Product Catalog',
    items: [
      { id: 'products', label: 'Manage Products', icon: 'inventory_2' },
      { id: 'parametersProductCategories', label: 'Product Categories', icon: 'layers' },
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
        ],
      },
      { id: 'esebillsAccounts', label: 'EseBills Accounts', icon: 'account_balance' },
      { id: 'providers', label: 'Providers', icon: 'hub' },
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
      { id: 'credentialsPesepay', label: 'Pesepay Credentials', icon: 'vpn_key' },
    ],
  },
  {
    id: 'ops',
    title: 'Operations',
    items: [
      { id: 'billers', label: 'Billers', icon: 'corporate_fare' },
      { id: 'agents', label: 'Agents', icon: 'storefront' },
      { id: 'commissions', label: 'Commissions', icon: 'payments' },
      { id: 'bankTopUps', label: 'Bank Top-Ups', icon: 'account_balance_wallet' },
      { id: 'whatsapp', label: 'WhatsApp Center', icon: 'mark_chat_read' },
    ],
  },
]

// Admin preference items (Profile, Settings, Support)
export const ADMIN_PREFERENCE_ITEMS: MenuItem[] = [
  { id: 'profile', label: 'Profile', icon: 'account_circle' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'support', label: 'Support', icon: 'help' },
]

// Agent menu
export const AGENT_MENU: MenuSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Dashboard', icon: 'home' },
      { id: 'sell', label: 'Make a Sale', icon: 'point_of_sale' },
      { id: 'commissions', label: 'Earnings Analysis', icon: 'payments' },
      { id: 'schedule', label: 'Commission Schedule', icon: 'table_chart' },
      { id: 'float', label: 'Float Wallet', icon: 'account_balance_wallet' },
      { id: 'notifications', label: 'Notifications', icon: 'notifications' },
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
      { id: 'donations', label: 'Donations', icon: 'favorite' },
      { id: 'notifications', label: 'Notifications', icon: 'notifications' },
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
      { id: 'notifications', label: 'Notifications', icon: 'notifications' },
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
