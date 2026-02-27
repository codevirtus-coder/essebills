// ============================================================================
// Institution & Tuition Types - Derived from API spec
// ============================================================================

import type { BaseEntity, BasicCustomerDetails, RequiredField, InstitutionType } from './common'

// --------------------------------------------------------------------------
// Institution Types
// --------------------------------------------------------------------------

/** Institution */
export interface Institution extends BaseEntity {
  name?: string
  institutionType?: InstitutionType
  logoFileName?: string
  institutionTuitionPaymentRequiredFields?: RequiredField[]
  location?: string
  percentageSettlementDiscount?: number
  institutionCode?: string
  settlementNotificationEmail?: string
  paymentNotificationEmail?: string
}

/** Institution command for create/update */
export interface InstitutionCommand {
  name: string
  institutionType: InstitutionType
  logoFileName: string
  institutionCode: string
  location: string
  percentageSettlementDiscount?: number
  paymentRequiredFields?: RequiredField[]
  settlementNotificationEmail: string
  proofOfPaymentNotificationEmail: string
}

/** Institution settlement account */
export interface InstitutionSettlementAccount extends BaseEntity {
  name?: string
  bankName?: string
  branchName?: string
  branchCode?: string
  accountNumber?: string
  institution?: Institution
  currency?: Record<string, unknown>
  proofOfAccountFileName?: string
}

/** Institution settlement account command */
export interface InstitutionSettlementAccountCommand {
  name: string
  bankName: string
  branchName: string
  branchCode: string
  accountNumber: string
  proofOfAccountFileName: string
  institutionId: Institution
  currencyCode: Record<string, unknown>
}

/** Institution fee type */
export interface InstitutionFeeType extends BaseEntity {
  institution?: Institution
  feeType?: Record<string, unknown>
}

/** Institution fee type command */
export interface InstitutionFeeTypeCommand {
  institutionId: Institution
  feeTypeId: Record<string, unknown>
}

// --------------------------------------------------------------------------
// Tuition Transaction Types
// --------------------------------------------------------------------------

/** Tuition transaction */
export interface TuitionTransaction extends BaseEntity {
  referenceNumber?: string
  productCode?: string
  reasonOfTransaction?: string
  paymentTransaction?: Record<string, unknown>
  dateTimeOfTransaction?: string
  dateOfPayment?: string
  customer?: BasicCustomerDetails
  tuitionTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NOT_SETTLED' | 'PAID_AND_SETTLED'
  transmissionDate?: string
  amount?: number
  currencyCode?: string
  amountInProductDefaultCurrency?: number
  productDefaultCurrencyCode?: string
  beneficiaryName?: string
  beneficiaryReference?: string
  feeType?: Record<string, unknown>
  institutionTuitionPaymentAdditionalFields?: Record<string, string>
  institution?: Institution
  tuitionSettlementStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DUE_FOR_SETTLEMENT' | 'WAITING_FOR_DETERMINATION'
  tuitionSettlementTransactionReference?: string
}

/** Tuition payment context */
export interface TuitionPaymentContext {
  basicCustomerDetails?: BasicCustomerDetails
  amount?: number
  beneficiaryName: string
  beneficiaryReference?: string
  institutionTuitionPaymentRequiredFields?: Record<string, string>
  reasonForPayment: string
  paymentMethodCode: string
  paymentMethodRequiredFields?: Record<string, string>
  institutionId: Institution
  feeTypeId: Record<string, unknown>
  currencyCode: Record<string, unknown>
  productCode: Record<string, unknown>
}

// --------------------------------------------------------------------------
// Tuition Settlement Types
// --------------------------------------------------------------------------

/** Tuition settlement */
export interface TuitionSettlement extends BaseEntity {
  referenceNumber?: string
  description?: string
  dateTime?: string
  institution?: Institution
  institutionSettlementAccount?: InstitutionSettlementAccount
  totalAmountBeforeSettlement?: number
  totalAmountBeforeFees?: number
  totalServiceFees?: number
  settlementFees?: number
  netAmount?: number
  discountPercentage?: number
  discountAmount?: number
  currencyCode?: string
  payerAccount?: Record<string, unknown>
  tuitionSettlementReportFileName?: string
  completedBy?: string
  bankReference?: string
  dateMoneySettled?: string
  completedDate?: string
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DUE_FOR_SETTLEMENT' | 'WAITING_FOR_DETERMINATION'
  settlementNotificationEmailAddress?: string
}

/** Create tuition settlement context */
export interface CreateTuitionSettlementContext {
  description?: string
  institutionId: Institution
  eseBillsAccountId: Record<string, unknown>
}

/** Tuition settlement completion context */
export interface TuitionSettlementCompletionContext {
  completedBy: string
  bankReference: string
  settlementMethod: string
  dateMoneySettled: string
  recipientsOfReport?: string[]
  tuitionSettlementId: TuitionSettlement
}

// --------------------------------------------------------------------------
// Tuition Processing/Settlement Fee Types
// --------------------------------------------------------------------------

/** Tuition processing fee */
export interface TuitionProcessingFee extends BaseEntity {
  name?: string
  description?: string
  effectiveRangeMinimum?: number
  effectiveRangeMaximum?: number
  fixedChargeAmount?: number
  percentageIncrement?: number
  currency?: Record<string, unknown>
  currencyCode?: string
}

/** Tuition processing fee command */
export interface TuitionProcessingFeeCommand {
  name: string
  description?: string
  effectiveRangeMinimum: number
  effectiveRangeMaximum: number
  fixedChargeAmount?: number
  percentageIncrement?: number
  currencyCode: string
  fixedCharge?: boolean
}

/** Tuition settlement fee */
export interface TuitionSettlementFee extends BaseEntity {
  name?: string
  description?: string
  effectiveRangeMinimum?: number
  effectiveRangeMaximum?: number
  fixedChargeAmount?: number
  percentageIncrement?: number
  currency?: Record<string, unknown>
  currencyCode?: string
}

/** Tuition settlement fee command */
export interface TuitionSettlementFeeCommand {
  name: string
  description?: string
  effectiveRangeMinimum: number
  effectiveRangeMaximum: number
  fixedChargeAmount?: number
  percentageIncrement?: number
  currencyCode: string
  fixedCharge?: boolean
}

// --------------------------------------------------------------------------
// EseBills Account Types
// --------------------------------------------------------------------------

/** EseBills account */
export interface EseBillsAccount extends BaseEntity {
  bank?: string
  accountNumber?: string
  accountName?: string
}

/** Create EseBills account command */
export interface CreateEseBillsAccountCommand {
  bank: string
  accountNumber: string
  accountName: string
}

/** Update EseBills account command */
export interface UpdateEseBillsAccountCommand {
  bank: string
  accountNumber: string
  accountName: string
  id: number
}
