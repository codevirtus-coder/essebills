// Donations V1 Service - Based on gateway OpenAPI (/v1/donations/*)
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

export interface DonationCampaignV1 {
  id: number
  name: string
  description?: string
  targetAmount?: number
  active?: boolean
  createdDate?: string
  createdBy?: string
  product?: {
    id: number
    name?: string
    category?: { id: number; name?: string }
  }
}

export interface DonationV1 {
  id: number
  amount?: number
  currencyCode?: string
  donorName?: string
  donorEmail?: string
  donorPhoneNumber?: string
  message?: string
  createdDate?: string
}

export interface CreateDonationCampaignCommandV1 {
  name: string
  description?: string
  targetAmount?: number
  // Use a flat id to avoid nested payloads; backend should resolve the Product.
  // If backend requires `{ product: { id } }`, we can switch back.
  productId: number
}

export interface PageDonationV1 {
  content: DonationV1[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export async function getDonationCampaignsV1(): Promise<DonationCampaignV1[]> {
  return apiFetch<DonationCampaignV1[]>(API_ENDPOINTS.donationsV1.campaigns)
}

export async function createDonationCampaignV1(payload: CreateDonationCampaignCommandV1): Promise<DonationCampaignV1> {
  return apiFetch<DonationCampaignV1>(API_ENDPOINTS.donationsV1.campaigns, {
    method: 'POST',
    body: payload,
  })
}

export async function getDonationsByCampaignV1(
  campaignId: string | number,
  page = 0,
  size = 10
): Promise<PageDonationV1> {
  const qs = new URLSearchParams({ page: String(page), size: String(size) }).toString()
  return apiFetch<PageDonationV1>(`${API_ENDPOINTS.donationsV1.donationsByCampaign(campaignId)}?${qs}`)
}

export async function getDonationSummaryV1(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(API_ENDPOINTS.analytics.donations.summary)
}
