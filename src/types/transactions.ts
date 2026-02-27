// ============================================================================
// Payment & Transaction Types - Derived from API spec
// ============================================================================

import type { BaseEntity, BasicCustomerDetails, Pageable, PaymentStatus, TransactionCompletionStatus } from './common'

// --------------------------------------------------------------------------
// Payment Transaction Types
// --------------------------------------------------------------------------

/** Payment transaction */
export interface PaymentTransaction extends BaseEntity {
  pesepayReferenceNumber?: string
  productReferenceNumber?: string
  paymentStatus?: PaymentStatus
  productId?: number
  productName?: string
  currencyCode?: string
  amount?: number
  serviceFees?: number
  amountInDefaultCurrency?: number
  defaultCurrencyCode?: string
  dateTimeOfTransaction?: string
  pollUrl?: string
  redirectUrl?: string
  productCode?: string
  pesepayTransactionStatusDescription?: string
  valueAvailabilityStatus?: 'VALUE_AVAILABLE' | 'VALUE_USED' | 'VALUE_NOT_USED'
  productTransactionId?: string
  customerEmail?: string
  customerPhoneNumber?: string
  paymentNotificationSms?: boolean
  productPaymentNotificationSms?: boolean
  totalAmount?: number
}

/** Payment transaction creation context */
export interface PaymentTransactionCreationContext {
  productReferenceNumber: string
  product?: Record<string, unknown>
  currency?: Record<string, unknown>
  amount: number
  defaultCurrencyCode?: string
  amountInDefaultCurrency?: number
  productTransactionId?: string
  customerEmail?: string
  customerPhoneNumber?: string
  serviceFees?: number
  paymentNotificationSms?: boolean
  productPaymentNotificationSms?: boolean
}

/** Product payment context */
export interface ProductPaymentContext {
  email?: string
  phoneNumber: string
  amount: number
  paymentNotificationSms?: boolean
  productPaymentNotificationSms?: boolean
  paymentMethodCode: string
  paymentMethodRequiredFields?: Record<string, string>
  productRequiredFields?: Record<string, string>
  currencyCode?: Record<string, unknown>
  productCode?: Record<string, unknown>
}

/** Product payment response */
export interface ProductPaymentResponse {
  paymentTransaction?: PaymentTransaction
  purchaseResults?: Record<string, unknown>
  productPaymentCompletionStatus?: 'SUCCESS' | 'FAILED' | 'NOT_COMPLETE'
  productCode?: string
  productPurchaseReferenceNumber?: string
}

/** Pesepay transaction for updates */
export interface PesepayTransaction {
  transactionStatus?: string
  transactionStatusDescription?: string
  pesepayReferenceNumber?: string
  merchantReference?: string
  amount?: number
  currencyCode?: string
  referenceNumber?: string
  pollUrl?: string
  redirectUrl?: string
}

// --------------------------------------------------------------------------
// Airtime Transaction Types
// --------------------------------------------------------------------------

/** Econet airtime transaction */
export interface EconetAirtimeTransaction extends BaseEntity {
  referenceNumber?: string
  email?: string
  resendReferenceNumber?: string
  amount?: number
  reasonOfTransaction?: string
  paymentReferenceNumber?: string
  receivingAccountNumber?: string
  amountPaid?: string
  paymentStatus?: string
  currency?: Record<string, unknown>
  dateTimeOfTransaction?: string
  pollUrl?: string
  redirectUrl?: string
  completionStatus?: TransactionCompletionStatus
  transactionStatus?: 'NOT_PAID' | 'PAID_BUT_NOT_CREDITED_YET' | 'PAID_AND_CREDITED' | 'PAID_AND_CREDIT_SENT_TO_CUSTOMER' | 'PAID_BUT_CREDIT_FAILED'
  responseCode?: string
  narrative?: string
  preVendorBalance?: number
  postVendorBalance?: number
  transmissionDate?: string
  numberOfBundles?: number
  dataBundleType?: Record<string, unknown>
  paymentTransaction?: PaymentTransaction
  bundleName?: string
  econetTransactionCategory?: 'AIRTIME' | 'BUNDLE'
  amountInDefaultCurrency?: number
  defaultCurrency?: Record<string, unknown>
}

/** Netone airtime transaction */
export interface NetoneAirtimeTransaction extends BaseEntity {
  referenceNumber?: string
  productCode?: string
  reasonOfTransaction?: string
  paymentTransaction?: PaymentTransaction
  targetPhoneNumber?: string
  dateTimeOfTransaction?: string
  customer?: BasicCustomerDetails
  responseCode?: string
  narrative?: string
  transmissionDate?: string
  transactionData?: Record<string, string>
  completionStatus?: TransactionCompletionStatus
  transactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_AIRTIME_YET' | 'PAID_AND_AIRTIME_SENT_TO_CUSTOMER'
  amount?: number
  currencyCode?: string
  amountInProductDefaultCurrency?: number
  productDefaultCurrencyCode?: string
  walletBalance?: number
  discount?: number
  initialBalance?: number
  finalBalance?: number
  window?: string
  data?: string
  agentReference?: string
  rechargeId?: number
  replyCode?: string
  replyMessage?: string
}

/** Esolutions airtime transaction */
export interface EsolutionsAirtimeTransaction extends BaseEntity {
  referenceNumber?: string
  amount?: number
  reasonOfTransaction?: string
  transactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_AIRTIME_YET' | 'PAID_AND_AIRTIME_SENT_TO_CUSTOMER'
  paymentTransaction?: PaymentTransaction
  receivingAccountNumber?: string
  currencyCode?: string
  dateTimeOfTransaction?: string
  customer?: BasicCustomerDetails
  productCode?: string
  responseCode?: string
  narrative?: string
  vendorBalance?: number
  amountInProductDefaultCurrency?: number
  transmissionDate?: string
  customerBalance?: string
  completionStatus?: TransactionCompletionStatus
  esolutionsAirtimeTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_AIRTIME_YET' | 'PAID_AND_AIRTIME_SENT_TO_CUSTOMER'
  productDefaultCurrencyCode?: string
  walletBalance?: number
  discount?: number
  initialBalance?: number
  finalBalance?: number
  window?: string
  data?: string
  agentReference?: string
  rechargeId?: number
  replyCode?: string
  replyMessage?: string
}

// --------------------------------------------------------------------------
// Voucher Transaction Types
// --------------------------------------------------------------------------

/** Base voucher type */
export interface BaseVoucher extends BaseEntity {
  serviceProvider?: string
  voucherType?: string
  voucherValue?: number
  vendorVoucherId?: string
  active?: boolean
  fixed?: boolean
}

/** DSTV voucher */
export type DstvVoucher = BaseVoucher
/** GOTV voucher */
export type GotvVoucher = BaseVoucher
/** MTN voucher */
export type MtnVoucher = BaseVoucher
/** Airtel voucher */
export type AirtelVoucher = BaseVoucher
/** ZESCO voucher */
export type ZescoVoucher = BaseVoucher
/** Zamtel voucher */
export type ZamtelVoucher = BaseVoucher
/** Vodafone voucher */
export type VodafoneVoucher = BaseVoucher
/** Topstar voucher */
export type TopstarVoucher = BaseVoucher
/** Madison Life voucher */
export type MadisonLifeVoucher = BaseVoucher
/** Liquid Telecom voucher */
export type LiquidTelecomVoucher = BaseVoucher
/** Afribus voucher */
export type AfribusVoucher = BaseVoucher

/** Base transaction with voucher */
export interface BaseVoucherTransaction extends BaseEntity {
  referenceNumber?: string
  retry?: boolean
  resendReferenceNumber?: string
  productCode?: string
  reasonOfTransaction?: string
  paymentTransaction?: PaymentTransaction
  dateTimeOfTransaction?: string
  customer?: BasicCustomerDetails
  responseCode?: string
  responseMessage?: string
  purchaseId?: string
  merchantVoucherValue?: number
  voucherPinNumber?: string
  voucherSerialNumber?: string
  transactionData?: Record<string, string>
  completionStatus?: TransactionCompletionStatus
  amount?: number
  currencyCode?: string
  amountInProductDefaultCurrency?: number
  productDefaultCurrencyCode?: string
}

/** DSTV transaction */
export interface DstvTransaction extends BaseVoucherTransaction {
  dstvVoucher?: DstvVoucher
  dstvTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
  dstvAccountNumber?: string
}

/** GOTV transaction */
export interface GotvTransaction extends BaseVoucherTransaction {
  gotvVoucher?: GotvVoucher
  gotvTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
  gotvAccountNumber?: string
}

/** MTN transaction */
export interface MtnTransaction extends BaseVoucherTransaction {
  mtnVoucher?: MtnVoucher
  mtnTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
}

/** Airtel transaction */
export interface AirtelTransaction extends BaseVoucherTransaction {
  airtelVoucher?: AirtelVoucher
  airtelTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
}

/** ZESCO transaction */
export interface ZescoTransaction extends BaseVoucherTransaction {
  zescoVoucher?: ZescoVoucher
  zesaTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
  zescoMeterNumber?: string
  customerAccountNumber?: string
  customerAddress?: string
  customerName?: string
  debtBalBfwd?: string
  debtBalance?: string
  elecSerial?: string
  exciseDuty?: string
  fixedCharge?: string
  receiptNumber?: string
  serviceNumber?: string
  tariff?: string
  tariffIndex?: string
  totalVAT?: string
  tvLicence?: string
  units?: string
  kwhAmount?: string
  tokenData?: Record<string, string>
  arrears?: Record<string, unknown>[]
  fixedCharges?: Record<string, unknown>[]
  tokens?: Record<string, unknown>[]
}

/** Zamtel transaction */
export interface ZamtelTransaction extends BaseVoucherTransaction {
  zamtelVoucher?: ZamtelVoucher
  zamtelTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
}

/** Vodafone transaction */
export interface VodafoneTransaction extends BaseVoucherTransaction {
  vodafoneVoucher?: VodafoneVoucher
  vodafoneTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
}

/** Topstar transaction */
export interface TopstarTransaction extends BaseVoucherTransaction {
  topstarVoucher?: TopstarVoucher
  topstarTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
  topstarAccountNumber?: string
}

/** Madison Life transaction */
export interface MadisonLifeTransaction extends BaseVoucherTransaction {
  madisonLifeVoucher?: MadisonLifeVoucher
  madisonLifeTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
  madisonLifeAccountNumber?: string
}

/** Liquid Telecom transaction */
export interface LiquidTelecomTransaction extends BaseVoucherTransaction {
  liquidTelecomVoucher?: LiquidTelecomVoucher
  liquidTelecomTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
  liquidTelecomAccountNumber?: string
}

/** Afribus transaction */
export interface AfribusTransaction extends BaseVoucherTransaction {
  afribusVoucher?: AfribusVoucher
  afribusTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_VOUCHER_YET' | 'PAID_AND_VOUCHER_PRESENT' | 'PAID_BUT_VOUCHER_FAILED'
}

// --------------------------------------------------------------------------
// ZESA Transaction Types
// --------------------------------------------------------------------------

/** ZESA transaction (electricity) */
export interface ZesaTransaction extends BaseEntity {
  referenceNumber?: string
  retry?: boolean
  resendReferenceNumber?: string
  productCode?: string
  reasonOfTransaction?: string
  paymentTransaction?: PaymentTransaction
  meterNumber?: string
  dateTimeOfTransaction?: string
  customer?: BasicCustomerDetails
  zesaTransactionStatus?: 'NOT_PAID' | 'PAID_BUT_NO_TOKEN_YET' | 'PAID_AND_TOKEN_PRESENT' | 'PAID_AND_TOKEN_SENT_TO_CUSTOMER' | 'PAID_BUT_TOKEN_FAILED'
  responseCode?: string
  narrative?: string
  transmissionDate?: string
  transactionData?: Record<string, string>
  tokenData?: Record<string, string>
  arrears?: Record<string, unknown>[]
  fixedCharges?: Record<string, unknown>[]
  tokens?: Record<string, unknown>[]
  completionStatus?: TransactionCompletionStatus
  amount?: number
  currencyCode?: string
  amountInProductDefaultCurrency?: number
  productDefaultCurrencyCode?: string
}

/** ZESA integration details */
export interface ZesaEsolutionsIntegrationDetails extends BaseEntity {
  password?: string
  vendorNumber?: string
  username?: string
  vendorTerminalId?: string
  merchantName?: string
  accountNumber?: string
  productName?: string
  currencyCode?: string
}

/** Create ZESA integration command */
export interface CreateEsolutionsIntegrationDetailsCommand {
  password: string
  vendorNumber: string
  username: string
  vendorTerminalId: string
  merchantName: string
  accountNumber: string
  productName: string
  currencyCode: string
}

/** Update ZESA integration command */
export interface UpdateEsolutionsIntegrationDetailsDetailsCommand {
  password: string
  vendorNumber: string
  username: string
  vendorTerminalId: string
  merchantName: string
  accountNumber: string
  productName: string
  currencyCode: string
  id: number
}
