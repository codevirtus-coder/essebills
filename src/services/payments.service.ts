// ============================================================================
// Payments Service - Based on API spec
// ============================================================================

import { apiFetch } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  PaymentTransaction,
  PageResponse,
  ProductPaymentContext,
  ProductPaymentResponse,
} from "../types";

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface PaymentQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  search?: string;
}

// --------------------------------------------------------------------------
// Payment Transactions
// --------------------------------------------------------------------------

/** Get paginated payment transactions */
export async function getPayments(
  params?: PaymentQueryParams,
): Promise<PageResponse<PaymentTransaction>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set("page", params.page.toString());
  if (params?.size !== undefined) query.set("size", params.size.toString());
  if (params?.sort) query.set("sort", params.sort);
  if (params?.order) query.set("order", params.order);
  if (params?.search) query.set("search", params.search);

  const queryString = query.toString();
  return apiFetch<PageResponse<PaymentTransaction>>(
    queryString
      ? `${API_ENDPOINTS.payments.root}?${queryString}`
      : API_ENDPOINTS.payments.root,
  );
}

/** Get all payment transactions (non-paginated) */
export async function getAllPayments(): Promise<PaymentTransaction[]> {
  return apiFetch<PaymentTransaction[]>(API_ENDPOINTS.payments.all);
}

/** Get payment transaction by ID */
export async function getPaymentById(
  paymentId: string | number,
): Promise<PaymentTransaction> {
  return apiFetch<PaymentTransaction>(API_ENDPOINTS.payments.byId(paymentId));
}

/** Create a new payment transaction */
export async function createPayment(
  payment: Partial<PaymentTransaction>,
): Promise<PaymentTransaction> {
  return apiFetch<PaymentTransaction>(API_ENDPOINTS.payments.root, {
    method: "POST",
    body: payment,
  });
}

/** Delete payment transaction */
export async function deletePayment(paymentId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.payments.byId(paymentId), {
    method: "DELETE",
  });
}

/** Process product payment */
export async function processProductPayment(
  context: ProductPaymentContext,
): Promise<ProductPaymentResponse> {
  return apiFetch<ProductPaymentResponse>(
    API_ENDPOINTS.payments.productPayment,
    {
      method: "POST",
      body: context,
    },
  );
}

/** Poll payment transaction status by ID (public, no auth required) */
export async function getPaymentStatus(
  transactionId: string | number,
): Promise<PaymentTransaction> {
  return apiFetch<PaymentTransaction>(
    API_ENDPOINTS.payments.byId(transactionId),
  );
}

export interface ServiceChargeRate {
  userGroup: string;
  ratePercent: number;
}

/** Fetch the applicable service charge rate for the given user group (public) */
export async function getApplicableServiceCharge(
  group?: string,
): Promise<ServiceChargeRate> {
  return apiFetch<ServiceChargeRate>(
    API_ENDPOINTS.payments.serviceChargeApplicable(group),
  );
}
