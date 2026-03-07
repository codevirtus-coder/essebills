// ============================================================================
// API Endpoints - Based on the OpenAPI spec
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    authenticate: '/authenticate',
    verifyOtp: '/authenticate/verify-otp',
    refreshToken: '/v1/auth/refresh',
  },

  // Users
  users: {
    root: '/v1/users',
    myAccount: '/v1/users/my-account',
    profile: '/v1/users/my-account', // Alias for profile
    forgotPassword: '/v1/users/forgot-password',
    resetPassword: '/v1/users/reset-password',
    updatePassword: '/v1/users/update-password',
    byId: (userId: string | number) => `/v1/users/${userId}`,
  },

  // Groups
  groups: {
    root: '/v1/groups',
    byId: (groupId: string | number) => `/v1/groups/${groupId}`,
  },

  // Products
  products: {
    root: '/v1/products',
    byId: (productId: string | number) => `/v1/products/${productId}`,
    byCategory: (id: string | number) => `/v1/products/by-category/${id}`,
  },

  // Product Categories
  productCategories: {
    root: '/v1/product-categories',
    byId: (id: string | number) => `/v1/product-categories/${id}`,
  },

  // Currencies
  currencies: {
    root: '/v1/currencies',
    byId: (currencyId: string | number) => `/v1/currencies/${currencyId}`,
  },

  // Countries
  countries: {
    root: '/v1/countries',
    byId: (id: string | number) => `/v1/countries/${id}`,
  },

  // Banks
  banks: {
    root: '/v1/banks',
    byId: (bankId: string | number) => `/v1/banks/${bankId}`,
  },

  // Holidays
  holidays: {
    root: '/v1/holidays',
  },

  // EseBills Accounts
  esebillsAccounts: {
    root: '/v1/esebills-accounts',
    byId: (accountId: string | number) => `/v1/esebills-accounts/${accountId}`,
  },

  // Payments
  payments: {
    root: '/v1/payment-transactions',
    all: '/v1/payment-transactions', // Alias for all payments
    byId: (id: string | number) => `/v1/payment-transactions/${id}`,
    productPayment: '/v1/product-payment',
  },

  // Integration Credentials
  integrations: {
    pesepay: {
      root: '/v1/pesepay-integration-credentials',
    },
  },

  // Access Control
  accessControl: {
    authorities: {
      root: '/v1/access-control/authorities',
      all: '/v1/access-control/authorities/all',
    },
    userAuthorities: {
      root: '/v1/access-control/user-authorities',
      bundled: '/v1/access-control/user-authorities/bundled',
      byUser: (userId: string | number) => `/v1/access-control/user-authorities/by-user/${userId}`,
      byUserAll: (userId: string | number) => `/v1/access-control/user-authorities/by-user/${userId}/all`,
      unassigned: (userId: string | number) => `/v1/access-control/user-authorities/unassigned/${userId}`,
    },
    groupAuthorities: {
      root: '/v1/access-control/group-authorities',
      bundled: '/v1/access-control/group-authorities/bundled',
      byGroup: (groupId: string | number) => `/v1/access-control/group-authorities/by-group/${groupId}`,
      byGroupAll: (groupId: string | number) => `/v1/access-control/group-authorities/by-group/${groupId}/all`,
      unassigned: (groupId: string | number) => `/v1/access-control/group-authorities/unassigned/${groupId}`,
    },
  },

  // Agent Commission Rates
  agentCommission: {
    rates: (agentId: string | number) => `/v1/admin/agents/${agentId}/commission-rates`,
    rateById: (agentId: string | number, id: string | number) => `/v1/admin/agents/${agentId}/commission-rates/${id}`,
  },

  // Admin Dashboard
  adminDashboard: {
    stats: '/v1/admin/dashboard/stats',
    revenue: '/v1/admin/dashboard/revenue',
    topBillers: '/v1/admin/dashboard/top-billers',
    topAgents: '/v1/admin/dashboard/top-agents',
    activityFeed: '/v1/admin/dashboard/activity-feed',
  },

  // Admin Transactions
  adminTransactions: {
    root: '/v1/admin/transactions',
    byId: (id: string | number) => `/v1/admin/transactions/${id}`,
    updateStatus: (id: string | number) => `/v1/admin/transactions/${id}/status`,
    export: '/v1/admin/transactions/export',
    statistics: '/v1/admin/transactions/statistics',
  },

  // Admin Users
  adminUsers: {
    root: '/v1/admin/users',
    byId: (userId: string | number) => `/v1/admin/users/${userId}`,
    updateStatus: (userId: string | number) => `/v1/admin/users/${userId}/status`,
    activity: (userId: string | number) => `/v1/admin/users/${userId}/activity`,
  },

  // Admin Agents
  adminAgents: {
    root: '/v1/admin/agents',
    byId: (agentId: string | number) => `/v1/admin/agents/${agentId}`,
    updateStatus: (agentId: string | number) => `/v1/admin/agents/${agentId}/status`,
    wallet: (agentId: string | number) => `/v1/admin/agents/${agentId}/wallet`,
    transactions: (agentId: string | number) => `/v1/admin/agents/${agentId}/transactions`,
    commissions: (agentId: string | number) => `/v1/admin/agents/${agentId}/commissions`,
    floatTopup: (agentId: string | number) => `/v1/admin/agents/${agentId}/float-topup`,
    bankTopups: (agentId: string | number) => `/v1/admin/agents/${agentId}/bank-topups`,
    bankTopupConfirm: (agentId: string | number, topupId: string | number) => `/v1/admin/agents/${agentId}/bank-topups/${topupId}/confirm`,
    bankTopupReject: (agentId: string | number, topupId: string | number) => `/v1/admin/agents/${agentId}/bank-topups/${topupId}/reject`,
    commissionRates: (agentId: string | number) => `/v1/admin/agents/${agentId}/commission-rates`,
    commissionRateById: (agentId: string | number, rateId: string | number) => `/v1/admin/agents/${agentId}/commission-rates/${rateId}`,
  },

  // Admin Billers
  adminBillers: {
    root: '/v1/admin/billers',
    byId: (billerId: string | number) => `/v1/admin/billers/${billerId}`,
    updateStatus: (billerId: string | number) => `/v1/admin/billers/${billerId}/status`,
    products: (billerId: string | number) => `/v1/admin/billers/${billerId}/products`,
    transactions: (billerId: string | number) => `/v1/admin/billers/${billerId}/transactions`,
    settlements: (billerId: string | number) => `/v1/admin/billers/${billerId}/settlements`,
    analytics: (billerId: string | number) => `/v1/admin/billers/${billerId}/analytics`,
    settlement: (billerId: string | number) => `/v1/admin/billers/${billerId}/settlement`,
  },

  // Admin Products
  adminProducts: {
    root: '/v1/admin/products',
    byId: (productId: string | number) => `/v1/admin/products/${productId}`,
    updateStatus: (productId: string | number) => `/v1/admin/products/${productId}/status`,
    categories: '/v1/admin/products/categories',
    categoryById: (categoryId: string | number) => `/v1/admin/products/categories/${categoryId}`,
  },

  // Admin Commissions
  adminCommissions: {
    rates: '/v1/admin/commissions/rates',
    payouts: '/v1/admin/commissions/payouts',
    payoutApprove: (payoutId: string | number) => `/v1/admin/commissions/payouts/${payoutId}/approve`,
    payoutReject: (payoutId: string | number) => `/v1/admin/commissions/payouts/${payoutId}/reject`,
    earnings: '/v1/admin/commissions/earnings',
  },

  // Admin Reports
  adminReports: {
    revenue: '/v1/admin/reports/revenue',
    transactions: '/v1/admin/reports/transactions',
    agents: '/v1/admin/reports/agents',
    billers: '/v1/admin/reports/billers',
    commissions: '/v1/admin/reports/commissions',
    settlements: '/v1/admin/reports/settlements',
  },

  // Admin Settings
  adminSettings: {
    platform: '/v1/admin/settings/platform',
    currencies: '/v1/admin/settings/currencies',
    banks: '/v1/admin/settings/banks',
    holidays: '/v1/admin/settings/holidays',
  },

  // Admin Bank Top-ups
  adminBankTopUps: {
    root: '/v1/admin/bank-top-ups',
    pending: '/v1/admin/bank-top-ups/pending',
    confirm: (id: string | number) => `/v1/admin/bank-top-ups/${id}/confirm`,
    reject: (id: string | number) => `/v1/admin/bank-top-ups/${id}/reject`,
  },

  // Agent
  agent: {
    root: '/v1/agent',
    profile: '/v1/agent/profile',
    updateProfile: '/v1/agent/profile',
    shopDetails: '/v1/agent/shop-details',
    wallet: {
      balances: '/v1/agent/wallet/balances',
      history: '/v1/agent/wallet/history',
      balanceByCurrency: (currency: string) => `/v1/agent/wallet/balance/${currency}`,
    },
    bankTopups: '/v1/agent/bank-topups',
    bankTopupById: (id: string | number) => `/v1/agent/bank-topups/${id}`,
    bankAccounts: '/v1/agent/bank-accounts',
    payments: {
      process: '/v1/agent/payments/process',
      recent: '/v1/agent/payments/recent',
      history: '/v1/agent/payments/history',
      byId: (id: string | number) => `/v1/agent/payments/${id}`,
      products: '/v1/agent/payments/products',
    },
    commissions: {
      balance: '/v1/agent/commissions/balance',
      history: '/v1/agent/commissions/history',
      rates: '/v1/agent/commissions/rates',
      payoutRequest: '/v1/agent/commissions/payout-request',
      payoutHistory: '/v1/agent/commissions/payout-history',
    },
  },

  // Wallet (user-facing top-up submissions)
  wallet: {
    bankTopUps: '/v1/wallet/bank-top-ups',
  },

  // Biller
  biller: {
    root: '/v1/biller',
    profile: '/v1/biller/profile',
    updateProfile: '/v1/biller/profile',
    collections: {
      root: '/v1/biller/collections',
      summary: '/v1/biller/collections/summary',
      byId: (id: string | number) => `/v1/biller/collections/${id}`,
      statistics: '/v1/biller/collections/statistics',
    },
    settlements: {
      root: '/v1/biller/settlements',
      pending: '/v1/biller/settlements/pending',
      byId: (id: string | number) => `/v1/biller/settlements/${id}`,
      summary: '/v1/biller/settlements/summary',
    },
    analytics: {
      daily: '/v1/biller/analytics/daily',
      weekly: '/v1/biller/analytics/weekly',
      monthly: '/v1/biller/analytics/monthly',
      topProducts: '/v1/biller/analytics/top-products',
    },
    paymentPoints: {
      root: '/v1/biller/payment-points',
      transactions: (pointId: string | number) => `/v1/biller/payment-points/${pointId}/transactions`,
    },
    products: {
      root: '/v1/biller/products',
      updateStatus: (productId: string | number) => `/v1/biller/products/${productId}/status`,
    },
    settings: {
      notifications: '/v1/biller/settings/notifications',
      settlementBank: '/v1/biller/settings/settlement-bank',
    },
  },

  // Customer
  customer: {
    root: '/v1/customer',
    profile: '/v1/customer/profile',
    updateProfile: '/v1/customer/profile',
    transactions: {
      root: '/v1/customer/transactions',
      byId: (id: string | number) => `/v1/customer/transactions/${id}`,
      statistics: '/v1/customer/transactions/statistics',
    },
    payments: {
      root: '/v1/customer/payments',
      quickPay: '/v1/customer/payments/quick-pay',
      validate: '/v1/customer/payments/validate',
    },
    products: {
      root: '/v1/customer/products',
      validate: (productId: string | number) => `/v1/customer/products/${productId}/validate`,
      categories: '/v1/customer/products/categories',
    },
    savedAccounts: {
      root: '/v1/customer/saved-accounts',
      byId: (id: string | number) => `/v1/customer/saved-accounts/${id}`,
    },
  },

  // WhatsApp
  whatsapp: {
    webhook: '/v1/whatsapp/webhook',
    simulator: {
      inbound: '/v1/whatsapp/simulator/inbound',
      responses: '/v1/whatsapp/simulator/responses',
    },
    sessions: {
      root: '/v1/whatsapp/sessions',
    },
    messages: {
      root: '/v1/whatsapp/messages',
    },
  },

  // OTP
  otp: {
    verify: '/v1/otp/verify',
  },

  // Registration
  register: {
    customer: '/v1/register/customer',
    biller: '/v1/register/biller',
    agent: '/v1/register/agent',
  },

  // Customer Details
  customerDetails: {
    fetch: '/v1/query-customer-details',
  },

  // Audits
  audits: {
    root: '/v1/audits',
    byId: (id: string | number) => `/v1/audits/${id}`,
    byPerformerPeriod: '/v1/audits/by-performer/period',
    myAudits: '/v1/my-audits/period',
  },

  // Notifications
  notifications: {
    root: '/v1/notifications',
    markRead: (id: string | number) => `/v1/notifications/${id}/read`,
    markAllRead: '/v1/notifications/read-all',
  },
} as const

export type ApiEndpoints = typeof API_ENDPOINTS
