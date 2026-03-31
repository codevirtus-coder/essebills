export const ADMIN_ENDPOINTS = {
  auth: {
    login: '/authenticate',
    verifyOtp: '/authenticate/verify-otp',
    refresh: '/v1/auth/refresh',
    forgotPassword: '/v1/users/forgot-password',
    resetPassword: '/v1/users/reset-password',
    updatePassword: '/v1/users/update-password',
  },
  users: {
    root: '/v1/users',
    myAccount: '/v1/users/my-account',
    byId: (userId: string | number) => `/v1/users/${userId}`,
  },
  adminUserActions: {
    sendPasswordReset: (userId: string | number) => `/v1/admin/users/${userId}/send-password-reset`,
    setPassword: (userId: string | number) => `/v1/admin/users/${userId}/set-password`,
    resendInvite: (userId: string | number) => `/v1/admin/users/${userId}/resend-invite`,
    setOtp: (userId: string | number) => `/v1/admin/users/${userId}/otp`,
  },
  passwords: {
    forgot: '/v1/users/forgot-password',
    reset: '/v1/users/reset-password',
    update: '/v1/users/update-password',
  },
  bulkPayments: {
    groups: '/v1/bulk-payments/groups',
    groupById: (id: string | number) => `/v1/bulk-payments/groups/${id}`,
    initiate: '/v1/bulk-payments/initiate',
    initiateFromGroup: (groupId: string | number) => `/v1/bulk-payments/initiate/from-group/${groupId}`,
    schedules: '/v1/bulk-payments/schedules',
    scheduleById: (id: string | number) => `/v1/bulk-payments/schedules/${id}`,
    requests: '/v1/bulk-payments/requests',
    requestById: (id: string | number) => `/v1/bulk-payments/requests/${id}`,
  },
  groups: {
    root: '/v1/groups',
    byId: (groupId: string | number) => `/v1/groups/${groupId}`,
  },
  products: {
    root: '/v1/products',
    byId: (productId: string | number) => `/v1/products/${productId}`,
  },
  productFields: {
    root: '/v1/product-fields',
    byId: (id: string | number) => `/v1/product-fields/${id}`,
  },
  productCategories: {
    root: '/v1/product-categories',
    reorder: '/v1/product-categories/reorder',
    byId: (id: string | number) => `/v1/product-categories/${id}`,
  },
  paymentTransactions: {
    root: '/v1/payment-transactions',
    byId: (id: string | number) => `/v1/payment-transactions/${id}`,
  },
  productPayment: {
    process: '/v1/product-payment',
  },
  currencies: {
    root: '/v1/currencies',
    byId: (currencyId: string | number) => `/v1/currencies/${currencyId}`,
  },
  countries: {
    root: '/v1/countries',
    byId: (id: string | number) => `/v1/countries/${id}`,
  },
  countryCurrencies: {
    root: '/v1/country-currencies',
  },
  banks: {
    root: '/v1/banks',
    byId: (bankId: string | number) => `/v1/banks/${bankId}`,
  },
  holidays: {
    root: '/v1/holidays',
  },
  esebillsAccounts: {
    root: '/v1/esebills-accounts',
    byId: (accountId: string | number) => `/v1/esebills-accounts/${accountId}`,
  },
  providers: {
    enable: (provider: string) => `/v1/providers/${provider}/enable`,
    disable: (provider: string) => `/v1/providers/${provider}/disable`,
  },
  pesepayCredentials: {
    root: '/v1/pesepay-integration-credentials',
    byId: (id: string | number) => `/v1/pesepay-integration-credentials/${id}`,
    syncCurrencies: '/v1/pesepay-integration-credentials/sync-currencies',
  },
  pesepayPayments: {
    updateTransaction: (paymentTransactionId: string | number) =>
      `/v1/pesepay/payments/transactions/${paymentTransactionId}`,
  },
  accessControl: {
    authorities: {
      root: '/v1/access-control/authorities',
      all: '/v1/access-control/authorities/all',
    },
    userAuthorities: {
      root: '/v1/access-control/user-authorities',
      bundled: '/v1/access-control/user-authorities/bundled',
      byUser: (userId: string | number) =>
        `/v1/access-control/user-authorities/by-user/${userId}`,
      byUserAll: (userId: string | number) =>
        `/v1/access-control/user-authorities/by-user/${userId}/all`,
      unassigned: (userId: string | number) =>
        `/v1/access-control/user-authorities/unassigned/${userId}`,
    },
    groupAuthorities: {
      root: '/v1/access-control/group-authorities',
      bundled: '/v1/access-control/group-authorities/bundled',
      byGroup: (groupId: string | number) =>
        `/v1/access-control/group-authorities/by-group/${groupId}`,
      byGroupAll: (groupId: string | number) =>
        `/v1/access-control/group-authorities/by-group/${groupId}/all`,
      unassigned: (groupId: string | number) =>
        `/v1/access-control/group-authorities/unassigned/${groupId}`,
    },
  },
  agentCommission: {
    rates: (agentId: string | number) => `/v1/admin/agents/${agentId}/commission-rates`,
    rateById: (agentId: string | number, id: string | number) =>
      `/v1/admin/agents/${agentId}/commission-rates/${id}`,
  },
  serviceCharges: {
    root: '/v1/service-charges',
    byId: (id: string | number) => `/v1/service-charges/${id}`,
  },
  registration: {
    customer: '/v1/register/customer',
    biller: '/v1/register/biller',
    agent: '/v1/register/agent',
  },
  otp: {
    verify: '/v1/otp/verify',
  },
  whatsapp: {
    sessions: '/v1/whatsapp/sessions',
    messages: '/v1/whatsapp/messages',
  },
} as const
