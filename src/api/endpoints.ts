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
    all: '/v1/product-categories/all',
    reorder: '/v1/product-categories/reorder',
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
    portal: {
      root: '/v1/portal/product-payment',
      transactions: '/v1/portal/product-payment/transactions',
      repeat: (id: string | number) => `/v1/portal/product-payment/repeat/${id}`,
    },
  },

  // Bulk Payments
  bulkPayments: {
    root: '/v1/bulk-payments',
    groups: {
      root: '/v1/bulk-payments/groups',
      byId: (id: string | number) => `/v1/bulk-payments/groups/${id}`,
    },
    schedules: {
      root: '/v1/bulk-payments/schedules',
      byId: (id: string | number) => `/v1/bulk-payments/schedules/${id}`,
    },
    requests: {
      root: '/v1/bulk-payments/requests',
      byId: (id: string | number) => `/v1/bulk-payments/requests/${id}`,
    },
    initiate: '/v1/bulk-payments/initiate',
  },

  // Donations (Gateway spec: /v1/donations/*)
  donationsV1: {
    campaigns: '/v1/donation-campaigns',
    donationsByCampaign: (campaignId: string | number) => `/v1/donations/by-campaign/${campaignId}`,
  },

  // Integration Credentials
  integrations: {
    pesepay: {
      root: '/v1/pesepay-integration-credentials',
      byId: (id: string | number) => `/v1/pesepay-integration-credentials/${id}`,
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
      byUser: (userId: string | number) => `/v1/access-control/user-authorities/by-user/${userId}`,
    },
    groupAuthorities: {
      root: '/v1/access-control/group-authorities',
      byGroup: (groupId: string | number) => `/v1/access-control/group-authorities/by-group/${groupId}`,
    },
  },

  // Agent Commission Rates
  agentCommission: {
    rates: (agentId: string | number) => `/v1/admin/agents/${agentId}/commission-rates`,
    rateById: (agentId: string | number, id: string | number) => `/v1/admin/agents/${agentId}/commission-rates/${id}`,
  },

  // Admin Dashboard
  adminDashboard: {
    stats: '/v1/analytics/admin/dashboard/stats',
    revenue: '/v1/analytics/admin/dashboard/revenue',
    topBillers: '/v1/analytics/admin/dashboard/stats', // Reusing stats as specific ones aren't in spec
    topAgents: '/v1/analytics/admin/dashboard/stats',
    activityFeed: '/v1/audits',
  },

  // Admin Transactions (Redirecting to standard payment-transactions)
  adminTransactions: {
    root: '/v1/payment-transactions',
    byId: (id: string | number) => `/v1/payment-transactions/${id}`,
    updateStatus: (id: string | number) => `/v1/payment-transactions/${id}`, // PATCH on same resource
    export: '/v1/payment-transactions',
    statistics: '/v1/analytics/admin/dashboard/stats',
  },

  // Admin Users (Redirecting to standard users)
  adminUsers: {
    root: '/v1/users',
    byId: (userId: string | number) => `/v1/users/${userId}`,
    updateStatus: (userId: string | number) => `/v1/users/${userId}`,
    activity: (userId: string | number) => `/v1/audits`,
  },

  // Admin Agents (Redirecting to standard users with filtering)
  adminAgents: {
    root: '/v1/users',
    byId: (agentId: string | number) => `/v1/users/${agentId}`,
    updateStatus: (agentId: string | number) => `/v1/users/${agentId}`,
    wallet: (agentId: string | number) => `/v1/agent-wallet/${agentId}/balance`,
    transactions: (agentId: string | number) => `/v1/agent-wallet/${agentId}/transactions`,
    commissions: (agentId: string | number) => `/v1/analytics/agent/dashboard/${agentId}/stats`,
    floatTopup: (agentId: string | number) => `/v1/wallet/bank-top-ups`,
    bankTopups: (agentId: string | number) => `/v1/admin/bank-top-ups`,
    bankTopupConfirm: (agentId: string | number, topupId: string | number) => `/v1/admin/bank-top-ups/${topupId}/confirm`,
    bankTopupReject: (agentId: string | number, topupId: string | number) => `/v1/admin/bank-top-ups/${topupId}/reject`,
    commissionRates: (agentId: string | number) => `/v1/admin/agents/${agentId}/commission-rates`,
    commissionRateById: (agentId: string | number, rateId: string | number) => `/v1/admin/agents/${agentId}/commission-rates/${rateId}`,
  },

  // Admin Billers
  adminBillers: {
    root: '/v1/users',
    byId: (billerId: string | number) => `/v1/users/${billerId}`,
    updateStatus: (billerId: string | number) => `/v1/users/${billerId}`,
    products: (billerId: string | number) => `/v1/products`,
    transactions: (billerId: string | number) => `/v1/payment-transactions`,
    settlements: (billerId: string | number) => `/v1/payment-transactions`, // Redirect to transactions
    analytics: (billerId: string | number) => `/v1/analytics/biller/dashboard/${billerId}/summary`,
  },

  // Admin Products
  adminProducts: {
    root: '/v1/products',
    byId: (productId: string | number) => `/v1/products/${productId}`,
    updateStatus: (productId: string | number) => `/v1/products/${productId}`,
    categories: '/v1/product-categories',
    categoryById: (categoryId: string | number) => `/v1/product-categories/${categoryId}`,
  },

  // Admin Commissions
  adminCommissions: {
    rates: '/v1/admin/agents/commission-rates',
    payouts: '/v1/agent-wallet/transactions',
    earnings: '/v1/analytics/admin/dashboard/stats',
  },

  // Admin Reports
  adminReports: {
    revenue: '/v1/analytics/admin/dashboard/revenue',
    transactions: '/v1/payment-transactions',
    agents: '/v1/users',
    billers: '/v1/users',
    commissions: '/v1/analytics/admin/dashboard/stats',
  },

  // Admin Settings
  adminSettings: {
    platform: '/v1/access-control/authorities',
    currencies: '/v1/currencies',
    banks: '/v1/banks',
    holidays: '/v1/holidays',
  },

  // Admin Bank Top-ups
  adminBankTopUps: {
    root: '/v1/admin/bank-top-ups',
    confirm: (id: string | number) => `/v1/admin/bank-top-ups/${id}/confirm`,
    reject: (id: string | number) => `/v1/admin/bank-top-ups/${id}/reject`,
    proofOfPayment: (id: string | number) => `/v1/admin/bank-top-ups/${id}/proof-of-payment-url`,
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
    wallet: {
      balances: '/v1/customer/wallet/balances',
      history: '/v1/customer/wallet/history',
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

  // Analytics
  analytics: {
    // Admin Analytics
    admin: {
      dashboard: {
        stats: '/v1/analytics/admin/dashboard/stats',
        transactions: '/v1/analytics/admin/dashboard/transactions',
        revenue: (params?: { period?: string; startDate?: string; endDate?: string }) => {
          const query = new URLSearchParams()
          if (params?.period) query.set('period', params.period)
          if (params?.startDate) query.set('startDate', params.startDate)
          if (params?.endDate) query.set('endDate', params.endDate)
          return `/v1/analytics/admin/dashboard/revenue${query.toString() ? '?' + query.toString() : ''}`
        },
      },
    },
    // Biller Analytics
    biller: {
      dashboard: {
        summary: (billerId: string | number) => `/v1/analytics/biller/dashboard/${billerId}/summary`,
        transactions: (billerId: string | number) => `/v1/analytics/biller/dashboard/${billerId}/transactions`,
      },
    },
    // Agent Analytics
    agent: {
      dashboard: {
        stats: (agentId: string | number) => `/v1/analytics/agent/dashboard/${agentId}/stats`,
        transactions: (agentId: string | number) => `/v1/analytics/agent/dashboard/${agentId}/transactions`,
      },
    },
    // Customer Analytics
    customer: {
      dashboard: {
        transactions: (customerPhoneNumber: string) => `/v1/analytics/customer/dashboard/${customerPhoneNumber}/transactions`,
      },
    },
    // Donations Analytics
    donations: {
      summary: '/v1/analytics/donations/summary',
    },
    // WhatsApp Sessions Analytics
    whatsappSessions: {
      summary: '/v1/analytics/whatsapp-sessions/summary',
    },
  },

  // Notifications
  notifications: {
    root: '/v1/notifications',
    markRead: (id: string | number) => `/v1/notifications/${id}/read`,
    markAllRead: '/v1/notifications/read-all',
    delete: (id: string | number) => `/v1/notifications/${id}`,
  },

  // Donations
  donations: {
    root: '/v1/donations',
    byId: (id: string | number) => `/v1/donations/${id}`,
    byCampaign: (campaignId: string | number) => `/v1/donations/by-campaign/${campaignId}`,
    byDonor: (donorId: string | number) => `/v1/donations/by-donor/${donorId}`,
    stats: '/v1/donations/stats',
    refund: (id: string | number) => `/v1/donations/${id}/refund`,
  },

  // Donation Campaigns
  donationCampaigns: {
    root: '/v1/donation-campaigns',
    byId: (id: string | number) => `/v1/donation-campaigns/${id}`,
    updateStatus: (id: string | number) => `/v1/donation-campaigns/${id}/status`,
    liquidate: (id: string | number) => `/v1/donation-campaigns/${id}/liquidate`,
  },

  // Donation Categories/Charities
  donationCategories: {
    root: '/v1/donation-categories',
    byId: (id: string | number) => `/v1/donation-categories/${id}`,
  },
} as const

export type ApiEndpoints = typeof API_ENDPOINTS
