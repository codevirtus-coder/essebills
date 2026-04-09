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
    requiredFieldsAll: '/v1/products/required-fields',
    vendorBalance: '/v1/products/vendor-balance',
    logoUrl: (productId: string | number) => `/v1/products/${productId}/logo-url`,
    logo: (productId: string | number) => `/v1/products/${productId}/logo`,
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
    all: '/v1/country-currencies/all',
    allByCountry: (countryCode: string) => `/v1/country-currencies/all/${countryCode}`,
    byId: (id: string | number) => `/v1/country-currencies/${id}`,
  },
  banks: {
    root: '/v1/banks',
    byId: (bankId: string | number) => `/v1/banks/${bankId}`,
  },
  holidays: {
    root: '/v1/holidays',
    byId: (id: string | number) => `/v1/holidays/${id}`,
  },
  esebillsAccounts: {
    root: '/v1/esebills-accounts',
    all: '/v1/esebills-accounts/all',
    default: '/v1/esebills-accounts/default',
    search: '/v1/esebills-accounts/search',
    byId: (accountId: string | number) => `/v1/esebills-accounts/${accountId}`,
  },
  providers: {
    root: '/v1/providers',
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
  adminBankTopUps: {
    root: '/v1/admin/bank-top-ups',
    proofOfPaymentUrl: (id: string | number) => `/v1/admin/bank-top-ups/${id}/proof-of-payment-url`,
  },
  esolutionsAdmin: {
    balance: '/v1/admin/esolutions/balance',
    balanceBy: (param: string) => `/v1/admin/esolutions/balance/${param}`,
  },
  esolutionsV2: {
    catalog: '/api/v2/esolutions/catalog',
    catalogByMerchant: (merchantCode: string) => `/api/v2/esolutions/catalog/merchant/${merchantCode}`,
    productsByMerchant: (merchantCode: string) => `/api/v2/esolutions/products/merchant/${merchantCode}`,
    balance: '/api/v2/esolutions/balance',
    catalogSync: (merchantCode: string) => `/api/v2/esolutions/catalog/sync/${merchantCode}`,
    resend: '/api/v2/esolutions/resend',
    transaction: '/api/v2/esolutions/transaction',
  },
  whatsapp: {
    sessions: '/v1/whatsapp/sessions',
    messages: '/v1/whatsapp/messages',
    sessionsById: (id: string | number) => `/v1/whatsapp/sessions/${id}`,
    messagesBySession: (sessionId: string | number) => `/v1/whatsapp/messages/by-session/${sessionId}`,
    messagesByPhone: (phoneNumber: string) => `/v1/whatsapp/messages/by-phone/${phoneNumber}`,
    webhook: '/v1/whatsapp/webhook',
  },
  sms: {
    root: '/v1/sms',
  },
  test: {
    email: '/v1/test/email',
  },
} as const
