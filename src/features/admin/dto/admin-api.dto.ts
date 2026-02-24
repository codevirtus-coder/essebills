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
  active?: boolean
} & Record<string, unknown>

export type ProductVendorBalanceDto = {
  productCode?: string
  balance?: number
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

export type ReportRequestDto = {
  startDate: string
  endDate: string
  format: string
}
