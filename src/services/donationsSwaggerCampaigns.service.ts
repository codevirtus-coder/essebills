// ============================================================================
// Donations Campaigns (Swagger endpoints) - /v1/donations/campaigns*
// ============================================================================

import { apiFetch } from '../api/client'

type UnknownRecord = Record<string, unknown>

export async function getDonationSwaggerCampaigns(): Promise<UnknownRecord[]> {
  return apiFetch<UnknownRecord[]>('/v1/donations/campaigns')
}

export async function createDonationSwaggerCampaign(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>('/v1/donations/campaigns', { method: 'POST', body: payload })
}

export async function getDonationSwaggerCampaignById(campaignId: string | number): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(`/v1/donations/campaign/${campaignId}`)
}

export async function getDonationSwaggerCampaignStats(campaignId: string | number): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(`/v1/donations/campaigns/${campaignId}/stats`)
}

export async function liquidateDonationSwaggerCampaign(campaignId: string | number): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(`/v1/donations/campaigns/${campaignId}/liquidate`, { method: 'POST' })
}

