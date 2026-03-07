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

  // Agent
  agent: {
    wallet: {
      balances: '/v1/agent/wallet/balances',
      history: '/v1/agent/wallet/history',
    },
  },

  // Wallet (user-facing top-up submissions)
  wallet: {
    bankTopUps: '/v1/wallet/bank-top-ups',
  },

  // Admin bank top-up management
  adminBankTopUps: {
    root: '/v1/admin/bank-top-ups',
    confirm: (id: string | number) => `/v1/admin/bank-top-ups/${id}/confirm`,
    reject: (id: string | number) => `/v1/admin/bank-top-ups/${id}/reject`,
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
} as const

export type ApiEndpoints = typeof API_ENDPOINTS
