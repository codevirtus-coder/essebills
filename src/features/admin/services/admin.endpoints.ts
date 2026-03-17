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
