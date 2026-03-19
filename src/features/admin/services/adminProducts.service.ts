import type { AdminProductDto, PageDto, QueryFilters } from '../dto/admin-api.dto'
import { adminJsonFetch, adminVoidFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function getPaginatedProducts(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminProductDto>>(ADMIN_ENDPOINTS.products.root, { filters })
}

export async function getProductById(productId: string | number) {
  return adminJsonFetch<AdminProductDto>(ADMIN_ENDPOINTS.products.byId(productId))
}

export async function createProduct(product: AdminProductDto) {
  return adminJsonFetch<AdminProductDto>(ADMIN_ENDPOINTS.products.root, {
    method: 'POST',
    body: product,
  })
}

export async function updateProduct(product: AdminProductDto) {
  if (!product.id) throw new Error('Cannot update product without id')
  return adminJsonFetch<AdminProductDto>(ADMIN_ENDPOINTS.products.byId(product.id), {
    method: 'PUT',
    body: product,
  })
}

export async function deleteProduct(productId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.products.byId(productId), { method: 'DELETE' })
}

// Product Fields
export async function createProductFields(productId: string | number, fields: Record<string, unknown>[]) {
  return adminJsonFetch<Record<string, unknown>[]>(ADMIN_ENDPOINTS.productFields.root, {
    method: 'POST',
    body: fields,
    filters: { productId },
  })
}

export async function updateProductField(fieldId: string | number, payload: Record<string, unknown>) {
  return adminJsonFetch<Record<string, unknown>>(ADMIN_ENDPOINTS.productFields.byId(fieldId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteProductFields(fieldIds: number[]) {
  return adminJsonFetch<void>(ADMIN_ENDPOINTS.productFields.root, {
    method: 'PATCH',
    body: fieldIds,
  })
}

// Product Categories
export async function getAllProductCategories() {
  return adminJsonFetch<Record<string, unknown>[]>(ADMIN_ENDPOINTS.productCategories.root)
}

export async function createProductCategory(payload: Record<string, unknown>) {
  return adminJsonFetch<Record<string, unknown>>(ADMIN_ENDPOINTS.productCategories.root, {
    method: 'POST',
    body: payload,
  })
}

export async function updateProductCategory(id: string | number, payload: Record<string, unknown>) {
  return adminJsonFetch<Record<string, unknown>>(ADMIN_ENDPOINTS.productCategories.byId(id), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteProductCategory(id: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.productCategories.byId(id), { method: 'DELETE' })
}

export async function reorderProductCategories(entries: Array<{ id: number; sortOrder: number }>) {
  return adminVoidFetch(ADMIN_ENDPOINTS.productCategories.reorder, {
    method: 'PUT',
    body: entries,
  })
}
