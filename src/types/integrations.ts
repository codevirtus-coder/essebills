// ============================================================================
// Integration Credentials Types - Derived from API spec
// ============================================================================

import type { BaseEntity } from './common'

// --------------------------------------------------------------------------
// Pesepay Integration
// --------------------------------------------------------------------------

/** Pesepay integration details */
export interface PesepayIntegrationDetails extends BaseEntity {
  encryptionKey?: string
  integrationKey?: string
}

/** Create Pesepay integration command */
export interface CreatePesepayIntegrationDetailsCommand {
  encryptionKey: string
  integrationKey: string
}

/** Update Pesepay integration command */
export interface UpdatePesepayIntegrationCommand {
  encryptionKey: string
  integrationKey: string
  id: number
}

// --------------------------------------------------------------------------
// Netone EVD Integration
// --------------------------------------------------------------------------

/** Netone EVD integration details */
export interface NetoneEvdIntegrationDetails extends BaseEntity {
  username?: string
}

/** Create Netone EVD integration command */
export interface CreateNetoneEvdIntegrationCommand {
  password: string
  username: string
}

/** Update Netone EVD integration command */
export interface UpdateNetoneEvdIntegrationDetailsCommand {
  password: string
  username: string
  id: number
}

// --------------------------------------------------------------------------
// Econet EVD Integration
// --------------------------------------------------------------------------

/** Econet EVD integration details */
export interface EconetEvdIntegrationDetails extends BaseEntity {
  username?: string
  accountTypeCode?: number
  accountTypeName?: string
}

/** Create Econet EVD integration command */
export interface CreateEconetEvdIntegrationCommand {
  password: string
  username: string
  accountTypeCode?: number
  accountTypeName?: string
}

/** Update Econet EVD integration command */
export interface UpdateEconetEvdIntegrationDetailsCommand {
  password: string
  username: string
  accountTypeCode?: number
  accountTypeName?: string
  id: number
}

// --------------------------------------------------------------------------
// Esolutions Airtime Integration
// --------------------------------------------------------------------------

/** Esolutions airtime provider integration details */
export interface EsolutionsAirtimeProviderIntegrationDetails extends BaseEntity {
  password?: string
  serviceId?: string
  username?: string
}

/** Create Esolutions airtime integration command */
export interface CreateEsolutionsAirtimeProviderIntegrationCommand {
  password: string
  serviceId: string
  username: string
}

/** Update Esolutions airtime integration command */
export interface UpdateEsolutionsAirtimeProviderIntegrationDetailsCommand {
  password: string
  serviceId: string
  username: string
  id: number
}

// --------------------------------------------------------------------------
// CGrate Integration
// --------------------------------------------------------------------------

/** CGrate integration details */
export interface CGrateIntegrationDetails extends BaseEntity {
  password?: string
  username?: string
}

/** CGrate integration command */
export interface CGrateIntegrationDetailsCommand {
  password: string
  username: string
}

// --------------------------------------------------------------------------
// Agent Commission Rate
// --------------------------------------------------------------------------

/** Agent commission rate */
export interface AgentCommissionRate extends BaseEntity {
  agent?: Record<string, unknown>
  productCategory?: string
  ratePercent?: number
}

// --------------------------------------------------------------------------
// Agent Wallet
// --------------------------------------------------------------------------

/** Agent wallet */
export interface AgentWallet extends BaseEntity {
  user?: Record<string, unknown>
  balance?: number
}

/** Agent wallet transaction */
export interface AgentWalletTransaction extends BaseEntity {
  agentWallet?: AgentWallet
  amount?: number
  transactionType?: 'COMMISSION_EARNED' | 'TOP_UP'
  description?: string
  paymentTransactionRef?: string
  productCode?: string
  runningBalance?: number
}

// --------------------------------------------------------------------------
// Customer Details Fetcher
// --------------------------------------------------------------------------

/** Customer details from external systems */
export interface CustomerDetails {
  name?: string
  address?: string
  accountNumber?: string
}

// --------------------------------------------------------------------------
// WhatsApp Types
// --------------------------------------------------------------------------

/** WhatsApp profile */
export interface WhatsAppProfile {
  name?: string
}

/** WhatsApp contact */
export interface WhatsAppContact {
  profile?: WhatsAppProfile
  wa_id?: string
}

/** WhatsApp metadata */
export interface WhatsAppMetadata {
  display_phone_number?: string
  phone_number_id?: string
}

/** WhatsApp text content */
export interface WhatsAppTextContent {
  body?: string
}

/** WhatsApp button reply */
export interface WhatsAppButtonReply {
  id?: string
  title?: string
}

/** WhatsApp interactive reply */
export interface WhatsAppInteractiveReply {
  id?: string
  title?: string
}

/** WhatsApp interactive */
export interface WhatsAppInteractive {
  type?: string
  button_reply?: WhatsAppInteractiveReply
  list_reply?: WhatsAppInteractiveReply
}

/** WhatsApp message */
export interface WhatsAppMessage {
  interactiveId?: string
  textBody?: string
  content?: string
  id?: string
  from?: string
  timestamp?: string
  type?: string
  text?: WhatsAppTextContent
  interactive?: WhatsAppInteractive
}

/** WhatsApp webhook entry */
export interface WhatsAppWebhookEntry {
  id?: string
  changes?: Array<{
    value?: {
      messaging_product?: string
      metadata?: WhatsAppMetadata
      contacts?: WhatsAppContact[]
      messages?: WhatsAppMessage[]
    }
    field?: string
  }>
}

/** WhatsApp webhook payload */
export interface WhatsAppWebhookPayload {
  object?: string
  entry?: WhatsAppWebhookEntry[]
}

// --------------------------------------------------------------------------
// WhatsApp Session & Messages
// --------------------------------------------------------------------------

/** WhatsApp session */
export interface WhatsAppSession extends BaseEntity {
  phoneNumber?: string
  currentFlow?: 'MAIN_MENU' | 'ZESA_PURCHASE' | 'AIRTIME_PURCHASE' | 'BUNDLE_PURCHASE' | 'PAY_BILLS' | 'SUPPORT' | 'ACCOUNT_MANAGEMENT' | 'AGENT_WALLET' | 'AGENT_WALLET_TOPUP'
  currentStep?: string
  sessionData?: string
  linkedUserId?: number
  status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  lastInteractionAt?: string
}

/** WhatsApp message entity */
export interface WhatsAppMessageEntity extends BaseEntity {
  phoneNumber?: string
  direction?: 'INBOUND' | 'OUTBOUND'
  waMessageId?: string
  content?: string
  messageType?: string
  sessionId?: number
}

// --------------------------------------------------------------------------
// Holiday
// --------------------------------------------------------------------------

/** Holiday */
export interface Holiday extends BaseEntity {
  date?: string
}

// --------------------------------------------------------------------------
// Employee
// --------------------------------------------------------------------------

/** Employee */
export interface Employee extends BaseEntity {
  firstName?: string
  lastName?: string
  address?: string
  salary?: number
}

/** Employee command */
export interface EmployeeCommand {
  firstName?: string
  lastName?: string
  address?: string
  salary?: number
}

// --------------------------------------------------------------------------
// SMS
// --------------------------------------------------------------------------

/** Sent SMS */
export interface SentSMS extends BaseEntity {
  destination?: string
  originator?: string
  messageText?: string
  deliveryStatus?: string
  messageDate?: string
  smsReference?: string
  providerReference?: string
  updateCount?: number
}

// --------------------------------------------------------------------------
// Country Currency
// --------------------------------------------------------------------------

/** Country currency mapping */
export interface CountryCurrency extends BaseEntity {
  countryCode?: string
  currencyCode?: string
}

/** Create country currency command */
export interface CreateCountryCurrencyCommand {
  countryCode: string
  currencyCode: string
}
