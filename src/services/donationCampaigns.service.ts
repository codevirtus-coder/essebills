import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

export interface DonationCampaignDto {
  id: number
  name: string
  description?: string
  categoryId?: number
  categoryName?: string
  targetAmount?: number
  raisedAmount?: number
  donorCount?: number
  currencyCode?: string
  startDate?: string
  endDate?: string
  imageUrl?: string
  isActive?: boolean
  isFeatured?: boolean
  createdDate?: string
}

export interface CreateDonationCampaignCommand {
  name: string
  description?: string
  targetAmount?: number
  currencyCode?: string
}

export interface UpdateDonationCampaignCommand {
  name: string
  description?: string
  targetAmount?: number
  currencyCode?: string
  imageUrl?: string
  startDate?: string
  endDate?: string
  active?: boolean
  featured?: boolean
}

export async function getDonationCampaigns(): Promise<DonationCampaignDto[]> {
  return apiFetch<DonationCampaignDto[]>(API_ENDPOINTS.donationCampaigns.root)
}

export async function getDonationCampaignById(id: number): Promise<DonationCampaignDto> {
  return apiFetch<DonationCampaignDto>(API_ENDPOINTS.donationCampaigns.byId(id))
}

export async function createDonationCampaign(payload: CreateDonationCampaignCommand): Promise<DonationCampaignDto> {
  return apiFetch<DonationCampaignDto>(API_ENDPOINTS.donationCampaigns.root, {
    method: 'POST',
    body: payload,
  })
}

export async function updateDonationCampaign(id: number, payload: UpdateDonationCampaignCommand): Promise<DonationCampaignDto> {
  return apiFetch<DonationCampaignDto>(API_ENDPOINTS.donationCampaigns.byId(id), {
    method: 'PUT',
    body: payload,
  })
}

export async function setDonationCampaignStatus(id: number, isActive: boolean): Promise<void> {
  return apiFetch(API_ENDPOINTS.donationCampaigns.updateStatus(id), {
    method: 'PUT',
    body: { isActive },
  })
}

export async function deleteDonationCampaign(id: number): Promise<void> {
  return apiFetch(API_ENDPOINTS.donationCampaigns.byId(id), { method: 'DELETE' })
}
