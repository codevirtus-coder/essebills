import type {
  AdminProductDto,
  PageDto,
  ProductVendorBalanceDto,
  QueryFilters,
} from '../dto/admin-api.dto'
import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function getPaginatedProducts(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminProductDto>>(ADMIN_ENDPOINTS.products.root, {
    filters,
  })
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
  if (!product.id) {
    throw new Error('Cannot update product without id')
  }

  return adminJsonFetch<AdminProductDto>(ADMIN_ENDPOINTS.products.byId(product.id), {
    method: 'PUT',
    body: product,
  })
}

export async function deleteProduct(productId: string | number) {
  return adminJsonFetch<void>(ADMIN_ENDPOINTS.products.byId(productId), {
    method: 'DELETE',
  })
}

export async function getAllProducts() {
  return adminJsonFetch<AdminProductDto[]>(ADMIN_ENDPOINTS.products.all)
}

export async function getAllActiveProducts() {
  return adminJsonFetch<AdminProductDto[]>(ADMIN_ENDPOINTS.products.allActive)
}

export async function getProductVendorBalance(productCode: string) {
  return adminJsonFetch<ProductVendorBalanceDto>(ADMIN_ENDPOINTS.products.vendorBalance, {
    filters: { productCode },
  })
}
