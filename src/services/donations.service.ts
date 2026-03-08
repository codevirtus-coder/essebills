// ============================================================================
// Donations Service - Donation Campaigns, Donations Management
// ============================================================================

import { apiFetch } from '../api/apiClient'
import { API_ENDPOINTS } from '../api/endpoints'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface Donation {
  id: string | number
  campaignId: string | number
  campaignName: string
  donorId?: string | number
  donorName: string
  donorEmail?: string
  donorPhone?: string
  amount: number
  currencyCode: string
  paymentMethod?: string
  paymentStatus: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
  transactionReference?: string
  message?: string
  isAnonymous: boolean
  createdDate: string
}

export interface DonationCampaign {
  id: string | number
  name: string
  description: string
  categoryId: string | number
  categoryName: string
  targetAmount: number
  raisedAmount: number
  currencyCode: string
  startDate: string
  endDate?: string
  imageUrl?: string
  isActive: boolean
  isFeatured: boolean
  donorCount: number
  createdDate: string
}

export interface DonationCategory {
  id: string | number
  name: string
  description: string
  icon?: string
  isActive: boolean
}

export interface DonationStats {
  totalRaised: number
  totalDonations: number
  activeCampaigns: number
  donorCount: number
}

export interface ProcessDonationRequest {
  campaignId: string | number
  amount: number
  currencyCode?: string
  donorName: string
  donorEmail?: string
  donorPhone?: string
  message?: string
  isAnonymous?: boolean
  paymentMethod?: string
}

export interface ProcessDonationResponse {
  id: string | number
  status: string
  amount: number
  transactionReference?: string
  message?: string
}

// Query Parameters
export interface DonationQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  status?: string
  fromDate?: string
  toDate?: string
  campaignId?: string | number
  donorId?: string | number
}

// --------------------------------------------------------------------------
// Public Donations (Customer facing)
// --------------------------------------------------------------------------

export async function getActiveCampaigns(): Promise<DonationCampaign[]> {
  return apiFetch<DonationCampaign[]>(`${API_ENDPOINTS.donationCampaigns.root}?status=active`)
}

export async function getDonationCampaignById(id: string | number): Promise<DonationCampaign> {
  return apiFetch<DonationCampaign>(API_ENDPOINTS.donationCampaigns.byId(id))
}

export async function getDonationCategories(): Promise<DonationCategory[]> {
  return apiFetch<DonationCategory[]>(API_ENDPOINTS.donationCategories.root)
}

export async function processDonation(donation: ProcessDonationRequest): Promise<ProcessDonationResponse> {
  return apiFetch<ProcessDonationResponse>(API_ENDPOINTS.donations.process, {
    method: 'POST',
    body: donation,
  })
}

export async function getMyDonations(params?: DonationQueryParams): Promise<{
  content: Donation[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.donations.root}?${queryString}` 
      : API_ENDPOINTS.donations.root
  )
}

// --------------------------------------------------------------------------
// Admin Donations Management
// --------------------------------------------------------------------------

export async function getAllDonations(params?: DonationQueryParams): Promise<{
  content: Donation[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.status) query.set('status', params.status)
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)
  if (params?.campaignId) query.set('campaignId', String(params.campaignId))

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.donations.root}?${queryString}` 
      : API_ENDPOINTS.donations.root
  )
}

export async function getDonationById(id: string | number): Promise<Donation> {
  return apiFetch<Donation>(API_ENDPOINTS.donations.byId(id))
}

export async function getDonationsByCampaign(
  campaignId: string | number,
  params?: DonationQueryParams
): Promise<{
  content: Donation[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.donations.byCampaign(campaignId)}?${queryString}` 
      : API_ENDPOINTS.donations.byCampaign(campaignId)
  )
}

export async function getDonationsByDonor(
  donorId: string | number,
  params?: DonationQueryParams
): Promise<{
  content: Donation[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.donations.byDonor(donorId)}?${queryString}` 
      : API_ENDPOINTS.donations.byDonor(donorId)
  )
}

export async function refundDonation(
  id: string | number,
  reason?: string
): Promise<{ success: boolean }> {
  return apiFetch(API_ENDPOINTS.donations.refund(id), {
    method: 'POST',
    body: { reason },
  })
}

// --------------------------------------------------------------------------
// Admin Donation Campaigns Management
// --------------------------------------------------------------------------

export async function getAllCampaigns(params?: {
  page?: number
  size?: number
  status?: string
}): Promise<{
  content: DonationCampaign[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.donationCampaigns.root}?${queryString}` 
      : API_ENDPOINTS.donationCampaigns.root
  )
}

export async function createCampaign(campaign: Partial<DonationCampaign>): Promise<DonationCampaign> {
  return apiFetch<DonationCampaign>(API_ENDPOINTS.donationCampaigns.root, {
    method: 'POST',
    body: campaign,
  })
}

export async function updateCampaign(
  id: string | number,
  campaign: Partial<DonationCampaign>
): Promise<DonationCampaign> {
  return apiFetch<DonationCampaign>(API_ENDPOINTS.donationCampaigns.byId(id), {
    method: 'PUT',
    body: campaign,
  })
}

export async function updateCampaignStatus(
  id: string | number,
  isActive: boolean
): Promise<{ success: boolean }> {
  return apiFetch(API_ENDPOINTS.donationCampaigns.updateStatus(id), {
    method: 'PUT',
    body: { isActive },
  })
}

export async function deleteCampaign(id: string | number): Promise<{ success: boolean }> {
  return apiFetch(API_ENDPOINTS.donationCampaigns.byId(id), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Admin Donation Categories Management
// --------------------------------------------------------------------------

export async function getAllDonationCategories(): Promise<DonationCategory[]> {
  return apiFetch<DonationCategory[]>(API_ENDPOINTS.donationCategories.root)
}

export async function createDonationCategory(category: Partial<DonationCategory>): Promise<DonationCategory> {
  return apiFetch<DonationCategory>(API_ENDPOINTS.donationCategories.root, {
    method: 'POST',
    body: category,
  })
}

export async function updateDonationCategory(
  id: string | number,
  category: Partial<DonationCategory>
): Promise<DonationCategory> {
  return apiFetch<DonationCategory>(API_ENDPOINTS.donationCategories.byId(id), {
    method: 'PUT',
    body: category,
  })
}

// --------------------------------------------------------------------------
// Donation Analytics
// --------------------------------------------------------------------------

export async function getDonationStats(params?: {
  fromDate?: string
  toDate?: string
}): Promise<DonationStats> {
  const query = new URLSearchParams()
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch<DonationStats>(
    queryString ? `${API_ENDPOINTS.donations.root}/stats?${queryString}` : `${API_ENDPOINTS.donations.root}/stats`
  )
}

export async function getTopCampaigns(limit = 5): Promise<{
  campaignId: string | number
  campaignName: string
  raisedAmount: number
  donorCount: number
}[]> {
  return apiFetch(`${API_ENDPOINTS.donations.root}/top-campaigns?limit=${limit}`)
}
