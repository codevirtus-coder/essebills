// ============================================================================
// Products Service - Based on API spec
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type {
  Product,
  ProductCategory,
  ProductField,
  Currency,
  Country,
  Bank,
  FeeType,
  PageResponse,
  ProductVendorBalance,
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
}

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------

/** Get paginated products */
export async function getProducts(params?: ProductQueryParams): Promise<PageResponse<Product>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch<PageResponse<Product>>(`${API_ENDPOINTS.products.root}${query}`)
}

/** Get product by ID */
export async function getProductById(productId: string | number): Promise<Product> {
  return apiFetch<Product>(API_ENDPOINTS.products.byId(productId))
}

/** Get all products (non-paginated) */
export async function getAllProducts(): Promise<Product[]> {
  return apiFetch<Product[]>(API_ENDPOINTS.products.all)
}

/** Get active products */
export async function getActiveProducts(): Promise<Product[]> {
  return apiFetch<Product[]>(API_ENDPOINTS.products.allActive)
}

/** Get product vendor balance */
export async function getProductVendorBalance(productCode: string): Promise<ProductVendorBalance> {
  return apiFetch<ProductVendorBalance>(
    `${API_ENDPOINTS.products.vendorBalance}?productCode=${encodeURIComponent(productCode)}`
  )
}

/** Get required fields for a product */
export async function getProductRequiredFields(productCode: string): Promise<ProductField[]> {
  return apiFetch<ProductField[]>(
    `${API_ENDPOINTS.products.requiredFields}?productCode=${encodeURIComponent(productCode)}`
  )
}

/** Get required fields for a product by ID */
export async function getProductRequiredFieldsById(productId: string | number): Promise<ProductField[]> {
  return apiFetch<ProductField[]>(API_ENDPOINTS.products.requiredFieldsById(productId))
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

/** Get all product categories */
export async function getProductCategories(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>(API_ENDPOINTS.productCategories.all)
}

/** Get active product categories */
export async function getActiveProductCategories(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>(API_ENDPOINTS.productCategories.allActive)
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

/** Get all currencies */
export async function getCurrencies(): Promise<Currency[]> {
  return apiFetch<Currency[]>(API_ENDPOINTS.currencies.all)
}

/** Get active currencies */
export async function getActiveCurrencies(): Promise<Currency[]> {
  return apiFetch<Currency[]>(API_ENDPOINTS.currencies.allActive)
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

/** Get all countries */
export async function getCountries(): Promise<Country[]> {
  return apiFetch<Country[]>(API_ENDPOINTS.countries.all)
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

/** Get all banks */
export async function getBanks(): Promise<Bank[]> {
  return apiFetch<Bank[]>(API_ENDPOINTS.banks.all)
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

// --------------------------------------------------------------------------
// Fee Types
// --------------------------------------------------------------------------

/** Get all fee types */
export async function getFeeTypes(): Promise<FeeType[]> {
  return apiFetch<FeeType[]>(API_ENDPOINTS.feeTypes.all)
}

/** Get fee type by ID */
export async function getFeeTypeById(feeTypeId: string | number): Promise<FeeType> {
  return apiFetch<FeeType>(API_ENDPOINTS.feeTypes.byId(feeTypeId))
}

/** Create fee type */
export async function createFeeType(feeType: Partial<FeeType>): Promise<FeeType> {
  return apiFetch<FeeType>(API_ENDPOINTS.feeTypes.root, {
    method: 'POST',
    body: feeType,
  })
}

/** Update fee type */
export async function updateFeeType(
  feeTypeId: string | number,
  feeType: Partial<FeeType>
): Promise<FeeType> {
  return apiFetch<FeeType>(API_ENDPOINTS.feeTypes.byId(feeTypeId), {
    method: 'PUT',
    body: feeType,
  })
}

/** Delete fee type */
export async function deleteFeeType(feeTypeId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.feeTypes.byId(feeTypeId), {
    method: 'DELETE',
  })
}
