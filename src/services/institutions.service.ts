// ============================================================================
// Institutions Service - Based on API spec
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type {
  Institution,
  InstitutionSettlementAccount,
  InstitutionFeeType,
  TuitionSettlement,
  TuitionProcessingFee,
  TuitionSettlementFee,
  FeeType,
  PageResponse,
  InstitutionCommand,
  InstitutionSettlementAccountCommand,
  InstitutionFeeTypeCommand,
  CreateTuitionSettlementContext,
  TuitionSettlementCompletionContext,
  TuitionProcessingFeeCommand,
  TuitionSettlementFeeCommand,
} from '../types'

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface InstitutionQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
}

// Helper to build query string
function buildQueryString(params?: InstitutionQueryParams): string {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)
  return query.toString()
}

// --------------------------------------------------------------------------
// Institutions
// --------------------------------------------------------------------------

/** Get paginated institutions */
export async function getInstitutions(params?: InstitutionQueryParams): Promise<PageResponse<Institution>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<Institution>>(
    queryString ? `${API_ENDPOINTS.institutions.root}?${queryString}` : API_ENDPOINTS.institutions.root
  )
}

/** Get all institutions */
export async function getAllInstitutions(): Promise<Institution[]> {
  return apiFetch<Institution[]>(API_ENDPOINTS.institutions.all)
}

/** Get institution by ID */
export async function getInstitutionById(institutionId: string | number): Promise<Institution> {
  return apiFetch<Institution>(API_ENDPOINTS.institutions.byId(institutionId))
}

/** Create institution */
export async function createInstitution(data: InstitutionCommand): Promise<Institution> {
  return apiFetch<Institution>(API_ENDPOINTS.institutions.root, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update institution */
export async function updateInstitution(institutionId: string | number, data: InstitutionCommand): Promise<Institution> {
  return apiFetch<Institution>(API_ENDPOINTS.institutions.byId(institutionId), {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete institution */
export async function deleteInstitution(institutionId: string | number): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.institutions.byId(institutionId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Institution Settlement Accounts
// --------------------------------------------------------------------------

/** Get settlement accounts by institution */
export async function getSettlementAccountsByInstitution(institutionId: string | number): Promise<InstitutionSettlementAccount[]> {
  return apiFetch<InstitutionSettlementAccount[]>(
    `/v1/institutions/${institutionId}/settlement-accounts`
  )
}

/** Get settlement account by ID */
export async function getSettlementAccountById(accountId: string | number): Promise<InstitutionSettlementAccount> {
  return apiFetch<InstitutionSettlementAccount>(
    `/v1/institution-settlement-accounts/${accountId}`
  )
}

/** Create settlement account */
export async function createSettlementAccount(data: InstitutionSettlementAccountCommand): Promise<InstitutionSettlementAccount> {
  return apiFetch<InstitutionSettlementAccount>('/v1/institution-settlement-accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update settlement account */
export async function updateSettlementAccount(accountId: string | number, data: InstitutionSettlementAccountCommand): Promise<InstitutionSettlementAccount> {
  return apiFetch<InstitutionSettlementAccount>(`/v1/institution-settlement-accounts/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete settlement account */
export async function deleteSettlementAccount(accountId: string | number): Promise<void> {
  return apiFetch<void>(`/v1/institution-settlement-accounts/${accountId}`, {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Institution Fee Types
// --------------------------------------------------------------------------

/** Get fee types by institution */
export async function getInstitutionFeeTypes(institutionId: string | number): Promise<InstitutionFeeType[]> {
  return apiFetch<InstitutionFeeType[]>(
    `/v1/institutions/${institutionId}/institution-fee-types`
  )
}

/** Create institution fee type */
export async function createInstitutionFeeType(data: InstitutionFeeTypeCommand): Promise<InstitutionFeeType> {
  return apiFetch<InstitutionFeeType>('/v1/institution-fee-types', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Delete institution fee type */
export async function deleteInstitutionFeeType(feeTypeId: string | number): Promise<void> {
  return apiFetch<void>(`/v1/institution-fee-types/${feeTypeId}`, {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Fee Types (Global)
// --------------------------------------------------------------------------

/** Get paginated global fee types */
export async function getGlobalFeeTypes(params?: InstitutionQueryParams): Promise<PageResponse<FeeType>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<FeeType>>(
    queryString ? `${API_ENDPOINTS.feeTypes.root}?${queryString}` : API_ENDPOINTS.feeTypes.root
  )
}

/** Get all global fee types */
export async function getAllGlobalFeeTypes(): Promise<FeeType[]> {
  return apiFetch<FeeType[]>(API_ENDPOINTS.feeTypes.all)
}

/** Get global fee type by ID */
export async function getGlobalFeeTypeById(feeTypeId: string | number): Promise<FeeType> {
  return apiFetch<FeeType>(API_ENDPOINTS.feeTypes.byId(feeTypeId))
}

/** Create global fee type */
export async function createGlobalFeeType(name: string): Promise<FeeType> {
  return apiFetch<FeeType>(API_ENDPOINTS.feeTypes.root, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

/** Update global fee type */
export async function updateGlobalFeeType(feeTypeId: string | number, name: string): Promise<FeeType> {
  return apiFetch<FeeType>(API_ENDPOINTS.feeTypes.byId(feeTypeId), {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

/** Delete global fee type */
export async function deleteGlobalFeeType(feeTypeId: string | number): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.feeTypes.byId(feeTypeId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Tuition Settlements
// --------------------------------------------------------------------------

/** Get paginated tuition settlements */
export async function getTuitionSettlements(params?: InstitutionQueryParams): Promise<PageResponse<TuitionSettlement>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<TuitionSettlement>>(
    queryString ? `${API_ENDPOINTS.tuitionSettlements.root}?${queryString}` : API_ENDPOINTS.tuitionSettlements.root
  )
}

/** Get tuition settlements by institution */
export async function getTuitionSettlementsByInstitution(
  institutionId: string | number,
  params?: InstitutionQueryParams
): Promise<PageResponse<TuitionSettlement>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<TuitionSettlement>>(
    queryString 
      ? `/v1/institutions/${institutionId}/tuition-settlements?${queryString}` 
      : `/v1/institutions/${institutionId}/tuition-settlements`
  )
}

/** Create tuition settlement */
export async function createTuitionSettlement(data: CreateTuitionSettlementContext): Promise<TuitionSettlement> {
  return apiFetch<TuitionSettlement>(API_ENDPOINTS.tuitionSettlements.root, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Complete tuition settlement */
export async function completeTuitionSettlement(data: TuitionSettlementCompletionContext): Promise<TuitionSettlement> {
  return apiFetch<TuitionSettlement>(API_ENDPOINTS.tuitionSettlements.complete, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// --------------------------------------------------------------------------
// Tuition Processing Fees
// --------------------------------------------------------------------------

/** Get paginated tuition processing fees */
export async function getTuitionProcessingFees(params?: InstitutionQueryParams): Promise<PageResponse<TuitionProcessingFee>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<TuitionProcessingFee>>(
    queryString ? `${API_ENDPOINTS.tuitionProcessingFees.root}?${queryString}` : API_ENDPOINTS.tuitionProcessingFees.root
  )
}

/** Get all tuition processing fees */
export async function getAllTuitionProcessingFees(): Promise<TuitionProcessingFee[]> {
  return apiFetch<TuitionProcessingFee[]>(API_ENDPOINTS.tuitionProcessingFees.all)
}

/** Get tuition processing fee by ID */
export async function getTuitionProcessingFeeById(feeId: string | number): Promise<TuitionProcessingFee> {
  return apiFetch<TuitionProcessingFee>(API_ENDPOINTS.tuitionProcessingFees.byId(feeId))
}

/** Create tuition processing fee */
export async function createTuitionProcessingFee(data: TuitionProcessingFeeCommand): Promise<TuitionProcessingFee> {
  return apiFetch<TuitionProcessingFee>(API_ENDPOINTS.tuitionProcessingFees.root, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update tuition processing fee */
export async function updateTuitionProcessingFee(feeId: string | number, data: TuitionProcessingFeeCommand): Promise<TuitionProcessingFee> {
  return apiFetch<TuitionProcessingFee>(API_ENDPOINTS.tuitionProcessingFees.byId(feeId), {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete tuition processing fee */
export async function deleteTuitionProcessingFee(feeId: string | number): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.tuitionProcessingFees.byId(feeId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Tuition Settlement Fees
// --------------------------------------------------------------------------

/** Get paginated tuition settlement fees */
export async function getTuitionSettlementFees(params?: InstitutionQueryParams): Promise<PageResponse<TuitionSettlementFee>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<TuitionSettlementFee>>(
    queryString ? `/v1/tuition-settlement-processing-fees?${queryString}` : '/v1/tuition-settlement-processing-fees'
  )
}

/** Get all tuition settlement fees */
export async function getAllTuitionSettlementFees(): Promise<TuitionSettlementFee[]> {
  return apiFetch<TuitionSettlementFee[]>('/v1/tuition-settlement-processing-fees/all')
}

/** Get tuition settlement fee by ID */
export async function getTuitionSettlementFeeById(feeId: string | number): Promise<TuitionSettlementFee> {
  return apiFetch<TuitionSettlementFee>(`/v1/tuition-settlement-processing-fees/${feeId}`)
}

/** Create tuition settlement fee */
export async function createTuitionSettlementFee(data: TuitionSettlementFeeCommand): Promise<TuitionSettlementFee> {
  return apiFetch<TuitionSettlementFee>('/v1/settlement-processing-fees', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update tuition settlement fee */
export async function updateTuitionSettlementFee(feeId: string | number, data: TuitionSettlementFeeCommand): Promise<TuitionSettlementFee> {
  return apiFetch<TuitionSettlementFee>(`/v1/settlement-processing-fees/${feeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete tuition settlement fee */
export async function deleteTuitionSettlementFee(feeId: string | number): Promise<void> {
  return apiFetch<void>(`/v1/tuition-settlement-processing-fees/${feeId}`, {
    method: 'DELETE',
  })
}
