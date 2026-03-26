// ============================================================================
// Product & Category Types - Derived from API spec
// ============================================================================

import type { BaseEntity, RequiredField } from './common'

// --------------------------------------------------------------------------
// Product Types
// --------------------------------------------------------------------------

/** Product category */
export interface ProductCategory extends BaseEntity {
  name?: string
  displayName?: string
  emoji?: string
  sortOrder?: number
  active?: boolean
}

/** Product category command for create/update */
export interface ProductCategoryCommand {
  name: string
  displayName: string
  emoji?: string
  sortOrder?: number
  active?: boolean
}

/** Currency */
export interface Currency extends BaseEntity {
  name?: string
  description?: string
  code?: string
  defaultCurrency?: boolean
  rateToDefault?: number
  active?: boolean
}

/** Create currency command */
export interface CreateCurrencyCommand {
  name: string
  description: string
  code: string
  rateToDefault: number
  active?: boolean
  defaultCurrency?: boolean
}

/** Update currency command */
export interface UpdateCurrencyCommand {
  name: string
  description: string
  code: string
  rateToDefault: number
  active?: boolean
  defaultCurrency?: boolean
  id: number
}

/** Country */
export interface Country extends BaseEntity {
  name?: string
  code?: string
}

/** Create country command */
export interface CreateCountryCommand {
  name: string
  code: string
}

/** Update country command */
export interface UpdateCountryCommand {
  name: string
  code: string
  id: number
}

/** Bank */
export interface Bank extends BaseEntity {
  name?: string
  code?: string
}

/** Bank command for create/update */
export interface BankCommand {
  name: string
  code?: string
}

/** Product field */
export interface ProductField extends BaseEntity {
  name?: string
  displayName?: string
  hint?: string
  optional?: boolean
  fieldType?: ProductFieldType
  productId?: number
  productCode?: string
}

/** Product field creation context */
export interface ProductFieldCreationContext {
  name: string
  displayName: string
  hint?: string
  optional?: boolean
  fieldType: ProductFieldType
}

/** Product */
export interface Product extends BaseEntity {
  name?: string
  code?: string
  description?: string
  productLogoFileName?: string
  status?: ProductStatus
  category?: ProductCategory
  returnUrl?: string
  minimumDisablingBalance?: number
  countryCode?: string
  countryId?: number
  defaultCurrency?: Currency
  minimumPurchaseAmount?: number
  parentProductId?: number
}

/** Product creation context */
export interface ProductCreationContext {
  name: string
  code: string
  description?: string
  productLogoFileName?: string
  returnUrl: string
  minimumDisablingBalance?: number
  categoryId: number
  countryId: number
  currencyId: number
}

/** Product update context */
export interface ProductUpdateContext {
  name: string
  code: string
  description?: string
  productLogoFileName?: string
  returnUrl: string
  minimumDisablingBalance?: number
  categoryId: number
  countryId: number
  currencyId: number
}

/** Product vendor balance */
export interface ProductVendorBalance {
  amount?: number
  minimumThresholdSetAmount?: number
  requiresReplenishing?: boolean
}

// --------------------------------------------------------------------------
// Fee Types
// --------------------------------------------------------------------------

/** Fee type */
export interface FeeType extends BaseEntity {
  name?: string
}

/** Fee type command */
export interface FeeTypeCommand {
  name: string
}

// --------------------------------------------------------------------------
// Bundle Plan Types (Econet, Netone)
// --------------------------------------------------------------------------

/** Bundle plan type */
export interface BundlePlanType extends BaseEntity {
  name?: string
  active?: boolean
}

/** Create bundle plan type command */
export interface CreateEconetBundlePlanCommand {
  name: string
  active?: boolean
}

/** Update bundle plan type command */
export interface UpdateEconetBundlePlanTypeCommand {
  name: string
  active?: boolean
}

/** Econet data bundle type */
export interface EconetDataBundleType extends BaseEntity {
  bundleName?: string
  price?: number
  productCode?: string
  validity?: string
  bundlePlanType?: BundlePlanType
  active?: boolean
  currency?: Currency
}

/** Create econet data bundle type command */
export interface CreateEconetDataBundleTypeCommand {
  bundleName: string
  price: number
  productCode: string
  active?: boolean
  validity: string
  currencyCode: string
  bundlePlanTypeId: BundlePlanType
}

/** Update econet data bundle type command */
export interface UpdateEconetDataBundleTypeCommand {
  id: number
  bundleName: string
  price: number
  productCode: string
  active?: boolean
  validity?: string
  currencyCode: string
  bundlePlanTypeId: BundlePlanType
}

/** Netone bundle plan */
export interface NetoneBundlePlan extends BaseEntity {
  name?: string
  active?: boolean
}

/** Create netone bundle plan command */
export interface CreateNetoneBundlePlanCommand {
  name: string
  active?: boolean
}

/** Update netone bundle plan command */
export interface UpdateNetoneBundlePlanCommand {
  name: string
  active?: boolean
}

/** Netone data bundle type */
export interface NetoneDataBundleType extends BaseEntity {
  bundleName?: string
  price?: number
  productCode?: string
  validity?: string
  bundlePlan?: NetoneBundlePlan
  active?: boolean
  currency?: Currency
}

/** Create netone data bundle type command */
export interface CreateNetoneDataBundleTypeCommand {
  bundleName: string
  price: number
  productCode: string
  active?: boolean
  validity: string
  currencyCode: string
  bundlePlanTypeId: NetoneBundlePlan
}

/** Update netone data bundle type command */
export interface UpdateNetoneDataBundleTypeCommand {
  id: number
  bundleName: string
  price: number
  productCode: string
  active?: boolean
  validity?: string
  currencyCode: string
  bundlePlanTypeId: NetoneBundlePlan
}
