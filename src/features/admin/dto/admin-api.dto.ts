export type PrimitiveFilterValue = string | number | boolean | null | undefined

export type QueryFilters = Record<string, PrimitiveFilterValue>

export type PageDto<T> = {
  content?: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
} & Record<string, unknown>

export type AdminUserDto = {
  id?: number | string
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  active?: boolean
  enabled?: boolean
  gender?: string
  title?: string
  initials?: string
  nationality?: string
  dateOfBirth?: string
  nationalIdentificationNumber?: string
  organisationName?: string
  shopName?: string
  shopLocation?: string
  otpEnabled?: boolean
  authorities?: string[]
  group?: AdminGroupDto | null
} & Record<string, unknown>

export type AdminGroupDto = {
  id?: number | string
  name?: string
  description?: string
} & Record<string, unknown>

export type AdminProductDto = {
  id?: number | string
  name?: string
  code?: string
  status?: string
  countryCode?: string
  defaultCurrencyCode?: string
  description?: string
  minimumDisablingBalance?: number
  minimumPurchaseAmount?: number
  productLogoFileName?: string
  returnUrl?: string
  category?: AdminProductCategoryDto
} & Record<string, unknown>

export type AdminProductCategoryDto = {
  id?: number | string
  name?: string
  displayName?: string
  emoji?: string
  sortOrder?: number
  active?: boolean
} & Record<string, unknown>

export type AdminProductFieldDto = {
  id?: number | string
  name?: string
  fieldType?: string
  required?: boolean
  sortOrder?: number
} & Record<string, unknown>

export type AdminCountryDto = {
  id?: number | string
  code?: string
  name?: string
} & Record<string, unknown>

export type AdminCurrencyDto = {
  id?: number | string
  code?: string
  name?: string
  description?: string
  rateToDefault?: number
  active?: boolean
  defaultCurrency?: boolean
} & Record<string, unknown>

export type AdminBankDto = {
  id?: number | string
  name?: string
  code?: string
} & Record<string, unknown>

export type AdminEsebillsAccountDto = {
  id?: number | string
  bank?: string
  accountNumber?: string
  accountName?: string
} & Record<string, unknown>

export type AdminPesepayCredentialsDto = {
  id?: number | string
  encryptionKey?: string
  integrationKey?: string
} & Record<string, unknown>

export type AdminPaymentTransactionDto = {
  id?: number | string
  amount?: number
  totalAmount?: number
  paymentStatus?: string
  productName?: string
  productReferenceNumber?: string
  customerEmail?: string
  customerPhoneNumber?: string
  dateTimeOfTransaction?: string
  currencyCode?: string
} & Record<string, unknown>

export type AdminAuthorityDto = {
  id?: number | string
  name?: string
  description?: string
} & Record<string, unknown>

export type AdminAgentCommissionRateDto = {
  id?: number | string
  productCode?: string
  commissionRate?: number
} & Record<string, unknown>

export type AdminWhatsAppSessionDto = {
  id?: number | string
  phoneNumber?: string
  currentFlow?: string
  currentStep?: string
  status?: string
  linkedUserId?: number
  lastInteractionAt?: string
} & Record<string, unknown>

export type ForgotPasswordRequestDto = {
  username?: string
  email?: string
  phoneNumber?: string
} & Record<string, unknown>

export type ResetPasswordRequestDto = {
  token: string
  password: string
  confirmPassword?: string
} & Record<string, unknown>
