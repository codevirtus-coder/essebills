export const ADMIN_ENDPOINTS = {
  auth: {
    forgotPassword: '/v1/users/forgot-password',
    resetPassword: '/v1/users/reset-password',
  },
  users: {
    root: '/v1/users',
    all: '/v1/users/all',
    profile: '/v1/users/profile',
    myAccount: '/v1/users.my-account',
    byId: (userId: string | number) => `/v1/users/${userId}`,
    status: (userId: string | number) => `/v1/users/${userId}/status`,
  },
  groups: {
    root: '/v1/groups',
    all: '/v1/groups/all',
    byId: (groupId: string | number) => `/v1/groups/${groupId}`,
  },
  products: {
    root: '/v1/products',
    all: '/v1/products/all',
    allActive: '/v1/products/all',
    byId: (productId: string | number) => `/v1/products/${productId}`,
    vendorBalance: '/v1/products/vendor-balance',
  },
  countries: {
    root: '/v1/countries',
    all: '/v1/countries/all',
  },
  currencies: {
    root: '/v1/currencies',
    all: '/v1/currencies/all',
  },
  banks: {
    root: '/v1/banks',
    all: '/v1/banks/all',
  },
  holidays: {
    root: '/v1/holidays',
  },
  rongekaAccounts: {
    root: '/v1/rongeka-accounts',
    all: '/v1/rongeka-accounts/all',
  },
  sms: {
    root: '/v1/sms',
    charges: '/v1/sms-charges',
  },
  econet: {
    bundlePlanTypes: {
      root: '/v1/bundle-plan-types',
      all: '/v1/bundle-plan-types/all',
    },
    dataBundleTypes: {
      root: '/v1/data-bundle-types',
      all: '/v1/data-bundle-types/all',
    },
    credentials: {
      root: '/v1/econet-evd-integration-credentials',
      all: '/v1/econet-evd-integration-credentials/all',
    },
  },
  netone: {
    bundlePlans: {
      root: '/v1/netone-bundle-plans',
      all: '/v1/netone-bundle-plans/all',
    },
    dataBundleTypes: {
      root: '/v1/netone-data-bundle-types',
      all: '/v1/netone-data-bundle-types/all',
    },
    credentials: {
      root: '/v1/netone-evd-integration-credentials',
      all: '/v1/netone-evd-integration-credentials/all',
    },
  },
  credentials: {
    pesepay: {
      root: '/v1/pesepay-integration-credentials',
      all: '/v1/pesepay-integration-credentials/all',
    },
    cgrate: {
      root: '/v1/cgrate/credentials',
    },
    zesa: {
      root: '/v1/zesa-esolutions',
    },
    esolutionsSms: {
      root: '/v1/esolutions-sms-account',
    },
    esolutionsAirtime: {
      root: '/v1/esolution-airtime-integration-credentials',
      all: '/v1/esolution-airtime-integration-credentials/all',
    },
  },
  reports: {
    econetAirtime: '/v1/econet-airtime/reports',
    netoneAirtime: '/v1/netone-airtime/reports',
    zesa: '/v1/zesa/reports',
    telecelAirtime: '/v1/telecel-airtime/reports',
    esolutionsAirtime: (format: string) =>
      `/v1/esolutions-airtime/reports/${format}`,
  },
} as const
