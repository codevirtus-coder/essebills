// ============================================================================
// Products Service - Based on API spec
// ============================================================================

import { apiFetch, multipartFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/+$/, '') : ''

/** Construct a public URL for a product logo (suitable for use as <img src>). */
export function getProductLogoUrl(productId: number | string): string {
  return `${API_BASE_URL}${API_ENDPOINTS.products.logo(productId)}`
}
import type {
  Product,
  ProductCategory,
  ProductField,
  Currency,
  Country,
  Bank,
  PageResponse,
} from '../types'

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface ProductQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
  categoryId?: string | number
  codePrefix?: string
}

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------

/** Get paginated products */
export async function getProducts(params?: ProductQueryParams): Promise<PageResponse<Product>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch<PageResponse<Product>>(`${API_ENDPOINTS.products.root}${query}`)
}

/** Get products by category */
export async function getProductsByCategory(
  categoryId: string | number,
  params?: Omit<ProductQueryParams, 'categoryId'>
): Promise<PageResponse<Product>> {
  const queryParams: ProductQueryParams = {
    ...(params ?? {}),
    categoryId,
  }

  try {
    // Prefer query-based filtering to align with the main products endpoint contract.
    return await getProducts(queryParams)
  } catch {
    // Fallback for environments that still expose a dedicated by-category route.
    const query = params ? toQueryString(params) : ''
    return apiFetch<PageResponse<Product>>(`${API_ENDPOINTS.products.byCategory(categoryId)}${query}`)
  }
}

/** Get active variants (children) of a product, ordered by price asc. Empty array if none. */
export async function getProductVariants(productId: string | number): Promise<Product[]> {
  return apiFetch<Product[]>(API_ENDPOINTS.products.variants(productId))
}

/** Get product by ID */
export async function getProductById(productId: string | number): Promise<Product> {
  return apiFetch<Product>(API_ENDPOINTS.products.byId(productId))
}

/** Get required fields for a product */
export async function getProductFields(productId: string | number): Promise<ProductField[]> {
  return apiFetch<ProductField[]>(API_ENDPOINTS.products.requiredFields(productId))
}

export interface ProductAvailability {
  available: boolean
  reason?: string
  lowStock?: boolean
}

export interface ProductPreCheckRequest {
  requiredFields: Record<string, string>
  amount?: number
  currencyCode?: string
  phoneNumber?: string
  email?: string
}

export interface ProductPreCheckResult {
  valid: boolean
  accountNarrative?: string
  settlementCurrencyCode?: string
  errorMessage?: string
  supportsPreCheck: boolean
}

/** Check if a product is currently available (public, no auth). */
export async function checkProductAvailability(productId: string | number): Promise<ProductAvailability> {
  return apiFetch<ProductAvailability>(API_ENDPOINTS.products.availability(productId))
}

/** Validate account/meter fields against the provider without charging (public, no auth). */
export async function preCheckProduct(
  productId: string | number,
  data: ProductPreCheckRequest
): Promise<ProductPreCheckResult> {
  return apiFetch<ProductPreCheckResult>(API_ENDPOINTS.products.preCheck(productId), {
    method: 'POST',
    body: data,
  })
}

/** Upload a logo image for a product (admin). Returns the updated product. */
export async function uploadProductLogo(productId: string | number, file: File): Promise<unknown> {
  const form = new FormData()
  form.append('file', file)
  return multipartFetch(API_ENDPOINTS.products.uploadLogo(productId), form, { method: 'POST' })
}

/** Admin: delete a product logo. */
export async function deleteProductLogo(productId: string | number): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.products.deleteLogo(productId), { method: 'DELETE' })
}

/** Admin: resolve a product logo URL (often returns a map containing a URL). */
export async function resolveProductLogoUrl(productId: string | number): Promise<Record<string, string>> {
  return apiFetch<Record<string, string>>(API_ENDPOINTS.products.logoUrl(productId))
}

/** Admin: vendor/provider balance snapshot for a product code. */
export async function getProductVendorBalance(productCode: string): Promise<unknown> {
  const query = toQueryString({ productCode })
  return apiFetch<unknown>(`${API_ENDPOINTS.products.vendorBalance}${query}`)
}

/** Admin: global required-fields catalogue. */
export async function getAllRequiredProductFields(): Promise<ProductField[]> {
  return apiFetch<ProductField[]>(API_ENDPOINTS.products.requiredFieldsAll)
}

/** Public: list products available in current country context. */
export async function getCountryProducts(): Promise<PageResponse<Product>> {
  return apiFetch<PageResponse<Product>>(API_ENDPOINTS.products.countryProducts)
}

/** Public: list all country products (admin/public ops). */
export async function getCountryProductsAll(): Promise<PageResponse<Product>> {
  return apiFetch<PageResponse<Product>>(API_ENDPOINTS.products.countryProductsAll)
}


/** Create a new product */
export async function createProduct(product: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(API_ENDPOINTS.products.root, {
    method: 'POST',
    body: product,
  })
}

/** Update product */
export async function updateProduct(productId: string | number, product: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(API_ENDPOINTS.products.byId(productId), {
    method: 'PUT',
    body: product,
  })
}

/** Delete product */
export async function deleteProduct(productId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.products.byId(productId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Product Categories
// --------------------------------------------------------------------------

/** Get active product categories sorted by sortOrder (for public pages) */
export async function getProductCategories(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>(API_ENDPOINTS.productCategories.all)
}

/** Get all product categories sorted by sortOrder (for admin) */
export async function getAllProductCategoriesSorted(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>(API_ENDPOINTS.productCategories.root)
}

/** Bulk-reorder categories. Sends [{id, sortOrder}] pairs. */
export async function reorderProductCategories(
  entries: Array<{ id: number; sortOrder: number }>
): Promise<void> {
  return apiFetch(API_ENDPOINTS.productCategories.reorder, {
    method: 'PUT',
    body: entries,
  })
}

/** Get product category by ID */
export async function getProductCategoryById(categoryId: string | number): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(API_ENDPOINTS.productCategories.byId(categoryId))
}

/** Create product category */
export async function createProductCategory(
  category: Partial<ProductCategory>
): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(API_ENDPOINTS.productCategories.root, {
    method: 'POST',
    body: category,
  })
}

/** Update product category */
export async function updateProductCategory(
  categoryId: string | number,
  category: Partial<ProductCategory>
): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(API_ENDPOINTS.productCategories.byId(categoryId), {
    method: 'PUT',
    body: category,
  })
}

/** Delete product category */
export async function deleteProductCategory(categoryId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.productCategories.byId(categoryId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Currencies
// --------------------------------------------------------------------------

/** Get paginated currencies */
export async function getCurrencies(): Promise<PageResponse<Currency>> {
  return apiFetch<PageResponse<Currency>>(API_ENDPOINTS.currencies.root)
}

/** Get currency by ID */
export async function getCurrencyById(currencyId: string | number): Promise<Currency> {
  return apiFetch<Currency>(API_ENDPOINTS.currencies.byId(currencyId))
}

/** Create currency */
export async function createCurrency(currency: Partial<Currency>): Promise<Currency> {
  return apiFetch<Currency>(API_ENDPOINTS.currencies.root, {
    method: 'POST',
    body: currency,
  })
}

/** Update currency */
export async function updateCurrency(
  currencyId: string | number,
  currency: Partial<Currency>
): Promise<Currency> {
  return apiFetch<Currency>(API_ENDPOINTS.currencies.byId(currencyId), {
    method: 'PUT',
    body: currency,
  })
}

/** Delete currency */
export async function deleteCurrency(currencyId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.currencies.byId(currencyId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Countries
// --------------------------------------------------------------------------

/** Get paginated countries */
export async function getCountries(): Promise<PageResponse<Country>> {
  return apiFetch<PageResponse<Country>>(API_ENDPOINTS.countries.root)
}

/** Get country by ID */
export async function getCountryById(countryId: string | number): Promise<Country> {
  return apiFetch<Country>(API_ENDPOINTS.countries.byId(countryId))
}

/** Create country */
export async function createCountry(country: Partial<Country>): Promise<Country> {
  return apiFetch<Country>(API_ENDPOINTS.countries.root, {
    method: 'POST',
    body: country,
  })
}

/** Update country */
export async function updateCountry(
  countryId: string | number,
  country: Partial<Country>
): Promise<Country> {
  return apiFetch<Country>(API_ENDPOINTS.countries.byId(countryId), {
    method: 'PUT',
    body: country,
  })
}

/** Delete country */
export async function deleteCountry(countryId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.countries.byId(countryId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Banks
// --------------------------------------------------------------------------

/** Get paginated banks */
export async function getBanks(): Promise<PageResponse<Bank>> {
  return apiFetch<PageResponse<Bank>>(API_ENDPOINTS.banks.root)
}

/** Get bank by ID */
export async function getBankById(bankId: string | number): Promise<Bank> {
  return apiFetch<Bank>(API_ENDPOINTS.banks.byId(bankId))
}

/** Create bank */
export async function createBank(bank: Partial<Bank>): Promise<Bank> {
  return apiFetch<Bank>(API_ENDPOINTS.banks.root, {
    method: 'POST',
    body: bank,
  })
}

/** Update bank */
export async function updateBank(bankId: string | number, bank: Partial<Bank>): Promise<Bank> {
  return apiFetch<Bank>(API_ENDPOINTS.banks.byId(bankId), {
    method: 'PUT',
    body: bank,
  })
}

/** Delete bank */
export async function deleteBank(bankId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.banks.byId(bankId), {
    method: 'DELETE',
  })
}

