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
    profile: '/v1/users/profile',
    myAccount: '/v1/users/my-account',
    all: '/v1/users/all',
    forgotPassword: '/v1/users/forgot-password',
    resetPassword: '/v1/users/reset-password',
    updatePassword: '/v1/users/update-password',
    byId: (userId: string | number) => `/v1/users/${userId}`,
    status: (userId: string | number) => `/v1/users/${userId}/status`,
    otpEnabled: (userId: string | number) => `/v1/users/${userId}/otp-enabled`,
  },

  // Groups
  groups: {
    root: '/v1/groups',
    all: '/v1/groups/all',
    byId: (groupId: string | number) => `/v1/groups/${groupId}`,
  },

  // Products
  products: {
    root: '/v1/products',
    all: '/v1/products/all',
    allActive: '/v1/products/all/active',
    vendorBalance: '/v1/products/vendor-balance',
    requiredFields: '/v1/products/required-fields',
    byId: (productId: string | number) => `/v1/products/${productId}`,
    requiredFieldsById: (productId: string | number) => `/v1/products/${productId}/required-fields`,
  },

  // Product Categories
  productCategories: {
    root: '/v1/product-categories',
    all: '/v1/product-categories/all',
    allActive: '/v1/product-categories/all/active',
    byId: (id: string | number) => `/v1/product-categories/${id}`,
  },

  // Currencies
  currencies: {
    root: '/v1/currencies',
    all: '/v1/currencies/all',
    allActive: '/v1/currencies/all-active',
    active: '/v1/currencies/active',
    byId: (currencyId: string | number) => `/v1/currencies/${currencyId}`,
  },

  // Countries
  countries: {
    root: '/v1/countries',
    all: '/v1/countries/all',
    byId: (id: string | number) => `/v1/countries/${id}`,
  },

  // Banks
  banks: {
    root: '/v1/banks',
    all: '/v1/banks/all',
    byId: (bankId: string | number) => `/v1/banks/${bankId}`,
  },

  // Fee Types
  feeTypes: {
    root: '/v1/fee-types',
    all: '/v1/fee-types/all',
    byId: (feeTypeId: string | number) => `/v1/fee-types/${feeTypeId}`,
  },

  // Holidays
  holidays: {
    root: '/v1/holidays',
    byId: (id: string | number) => `/v1/holidays/${id}`,
  },

  // Institutions
  institutions: {
    root: '/v1/institutions',
    all: '/v1/institutions/all',
    byId: (institutionId: string | number) => `/v1/institutions/${institutionId}`,
  },

  // Institution Settlement Accounts
  institutionSettlementAccounts: {
    root: '/v1/institution-settlement-accounts',
    byId: (accountId: string | number) => `/v1/institution-settlement-accounts/${accountId}`,
  },

  // Tuition Settlements
  tuitionSettlements: {
    root: '/v1/tuition-settlements',
    complete: '/v1/tuition-settlements/complete',
  },

  // Tuition Processing Fees
  tuitionProcessingFees: {
    root: '/v1/tuition-processing-fees',
    all: '/v1/tuition-processing-fees/all',
    byId: (feeId: string | number) => `/v1/tuition-processing-fees/${feeId}`,
  },

  // EseBills Accounts
  esebillsAccounts: {
    root: '/v1/esebills-accounts',
    all: '/v1/esebills-accounts/all',
    byId: (accountId: string | number) => `/v1/esebills-accounts/${accountId}`,
  },

  // Payments
  payments: {
    root: '/v1/payment-transactions',
    all: '/v1/payment-transactions/all',
    byId: (id: string | number) => `/v1/payment-transactions/${id}`,
    productPayment: '/v1/product-payment',
    tuitionPayment: '/v1/tuition-payment',
  },

  // ZESA Transactions
  zesaTransactions: {
    root: '/v1/zesa-transactions',
    byReference: '/v1/zesa-transactions/by-reference',
    retry: (id: string | number) => `/v1/zesa-transactions/${id}/retry`,
    resend: (id: string | number) => `/v1/zesa-transactions/${id}/resend`,
    resendAll: '/v1/zesa-transactions/resend',
  },

  // Econet Airtime
  econetAirtime: {
    root: '/v1/airtime-transactions',
    byReference: '/v1/airtime-transactions/by-reference',
  },

  // Netone Transactions
  netoneTransactions: {
    root: '/v1/netone-transactions',
    byReference: '/v1/netone-transactions/by-reference',
  },

  // Esolutions Airtime
  esolutionsAirtime: {
    root: '/v1/esolutions-airtime-transactions',
    byReference: '/v1/esolutions-airtime-transactions/by-reference',
  },

  // Integration Credentials
  integrations: {
    pesepay: {
      root: '/v1/pesepay-integration-credentials',
      all: '/v1/pesepay-integration-credentials/all',
    },
    netoneEvd: {
      root: '/v1/netone-evd-integration-credentials',
      all: '/v1/netone-evd-integration-credentials/all',
    },
    econetEvd: {
      root: '/v1/econet-evd-integration-credentials',
      all: '/v1/econet-evd-integration-credentials/all',
    },
    esolutionsAirtime: {
      root: '/v1/esolution-airtime-integration-credentials',
      all: '/v1/esolution-airtime-integration-credentials/all',
    },
    zesaEsolutions: {
      root: '/v1/zesa-esolutions',
    },
    cgrate: {
      root: '/v1/cgrate/credentials',
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
      balance: '/v1/agent/wallet/balance',
      history: '/v1/agent/wallet/history',
    },
  },

  // Reports
  reports: {
    econetAirtime: '/v1/econet-airtime/reports',
    netoneAirtime: '/v1/netone-airtime/reports',
    esolutionsAirtime: '/v1/esolutions-airtime/reports',
    zesa: '/v1/zesa/reports',
  },

  // WhatsApp
  whatsapp: {
    webhook: '/v1/whatsapp/webhook',
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
