// ============================================================================
// Common/Base Types - Derived from API spec components/schemas
// ============================================================================

/** Generic filter value type */
export type FilterValue = string | number | boolean | null | undefined

/** Query filters object */
export type QueryFilters = Record<string, FilterValue>

// --------------------------------------------------------------------------
// Pagination Types
// --------------------------------------------------------------------------

/** Pagination parameters */
export interface Pageable {
  page?: number
  size?: number
  sort?: string[]
}

/** Sort object from paginated responses */
export interface SortObject {
  sorted?: boolean
  unsorted?: boolean
  empty?: boolean
}

/** Pageable object from paginated responses */
export interface PageableObject {
  sort?: SortObject
  paged?: boolean
  pageNumber?: number
  pageSize?: number
  unpaged?: boolean
  offset?: number
}

/** Generic page response wrapper */
export interface PageResponse<T> {
  totalPages?: number
  totalElements?: number
  sort?: SortObject
  numberOfElements?: number
  first?: boolean
  last?: boolean
  pageable?: PageableObject
  size?: number
  content?: T[]
  number?: number
  empty?: boolean
}

// --------------------------------------------------------------------------
// Audit Types
// --------------------------------------------------------------------------

export interface AuditAction {
  date?: string
  performedBy?: string
  performedByFullName?: string
  type?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  actionStatus?: 'COMPLETE' | 'STARTED'
}

export interface AuditResource {
  name?: string
  description?: string
}

export interface AuditOrigin {
  serviceName?: string
  sourceIP?: string
  host?: string
  remoteUser?: string
  country?: string
  timeZone?: string
  userAgent?: string
  operatingSystem?: string
  browser?: string
}

export interface Audit {
  id?: number
  dateCreated?: string
  action?: AuditAction
  resource?: AuditResource
  origin?: AuditOrigin
}

// --------------------------------------------------------------------------
// Error Types
// --------------------------------------------------------------------------

export interface ErrorMessage {
  message?: string
  path?: string
  exception?: string
  status?: string
  description?: string
}

// --------------------------------------------------------------------------
// Enums (from API spec)
// --------------------------------------------------------------------------

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type ProductStatus = 'ACTIVE' | 'DISABLED' | 'COMING_SOON'

export type InstitutionType = 
  | 'PRE_SCHOOL' 
  | 'PRIMARY_SCHOOL' 
  | 'SECONDARY_SCHOOL' 
  | 'TERTIARY_SCHOOL' 
  | 'COLLEGE' 
  | 'TRAINING_SCHOOL' 
  | 'NURSERY'

export type PaymentStatus = 
  | 'INITIATED' 
  | 'PROCESSING' 
  | 'PENDING' 
  | 'TERMINATED' 
  | 'FAILED' 
  | 'TIME_OUT' 
  | 'CLOSED' 
  | 'SUCCESS' 
  | 'INSUFFICIENT_FUNDS' 
  | 'CANCELLED' 
  | 'ERROR' 
  | 'DECLINED' 
  | 'AUTHORIZATION_FAILED' 
  | 'SERVICE_UNAVAILABLE'

export type ValueAvailabilityStatus = 'VALUE_AVAILABLE' | 'VALUE_USED' | 'VALUE_NOT_USED'

export type TransactionCompletionStatus = 'SUCCESS' | 'RETRY' | 'REFUND' | 'OPEN'

export type TuitionTransactionStatus = 'NOT_PAID' | 'PAID_BUT_NOT_SETTLED' | 'PAID_AND_SETTLED'

export type TuitionSettlementStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'DUE_FOR_SETTLEMENT' 
  | 'WAITING_FOR_DETERMINATION'

export type WhatsAppFlow = 
  | 'MAIN_MENU' 
  | 'ZESA_PURCHASE' 
  | 'AIRTIME_PURCHASE' 
  | 'BUNDLE_PURCHASE' 
  | 'PAY_BILLS' 
  | 'SUPPORT' 
  | 'ACCOUNT_MANAGEMENT' 
  | 'AGENT_WALLET' 
  | 'AGENT_WALLET_TOPUP'

export type WhatsAppSessionStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED'

export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND'

export type FieldType = 'TEXT' | 'EMAIL' | 'DATE' | 'NUMBER' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'FILE'

export type ProductFieldType = 'EMAIL' | 'NUMBER' | 'TEXT' | 'DATE' | 'SELECT' | 'FILE'

export type AgentWalletTransactionType = 'COMMISSION_EARNED' | 'TOP_UP'

export type EconetTransactionCategory = 'AIRTIME' | 'BUNDLE'

export type RequiredFieldType = 'TEXT' | 'EMAIL' | 'DATE' | 'NUMBER' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'FILE'

// --------------------------------------------------------------------------
// Common Field Types
// --------------------------------------------------------------------------

/** Required field for forms */
export interface RequiredField {
  fieldType?: RequiredFieldType
  name?: string
  displayName?: string
  optional?: boolean
  hint?: string
}

/** Basic customer details */
export interface BasicCustomerDetails {
  email?: string
  phoneNumber?: string
  name?: string
  address?: string
  accountNumber?: string
}

/** Token data from ZESA */
export interface TokenData {
  token?: string
  arrears?: string
  tokenCurrencyCode?: string
  tokenFixedCharges?: string
  tokenMiscellaneousData?: string
}

/** Token from ZESA */
export interface Token {
  tokenOrVoucher?: string
  units?: string
  rate?: string
  merchantReceiptNumber?: string
  netAmount?: number
  taxAmount?: number
  taxRate?: string
}

/** Arrears from ZESA */
export interface Arrears {
  description?: string
  receiptNumber?: string
  amount?: number
  tax?: string
  outstandingBalance?: string
}

/** Fixed charges */
export interface FixedCharges {
  description?: string
  merchantReceiptNumber?: string
  amount?: number
  taxAmount?: number
  rate?: string
}

// --------------------------------------------------------------------------
// Base Entity Type (common to all entities)
// --------------------------------------------------------------------------

/** Base entity with audit fields */
export interface BaseEntity {
  createdBy?: string
  lastModifiedBy?: string
  lastModifiedDate?: string
  createdDate?: string
  version?: number
  deleted?: boolean
  id?: number
}
