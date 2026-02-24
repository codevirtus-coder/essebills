import type { ReportRequestDto } from '../dto/admin-api.dto'
import { adminFileFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

function toReportFilters(payload: ReportRequestDto) {
  return {
    endDate: payload.endDate,
    startDate: payload.startDate,
    format: payload.format,
  }
}

export async function getEconetTransactionsReport(payload: ReportRequestDto) {
  return adminFileFetch(ADMIN_ENDPOINTS.reports.econetAirtime, toReportFilters(payload))
}

export async function getNetoneTransactionsReport(payload: ReportRequestDto) {
  return adminFileFetch(ADMIN_ENDPOINTS.reports.netoneAirtime, toReportFilters(payload))
}

export async function getZesaTransactionsReport(payload: ReportRequestDto) {
  return adminFileFetch(ADMIN_ENDPOINTS.reports.zesa, toReportFilters(payload))
}

export async function getTelecelTransactionsReport(payload: ReportRequestDto) {
  return adminFileFetch(ADMIN_ENDPOINTS.reports.telecelAirtime, toReportFilters(payload))
}

export async function getEsolutionsTransactionsReport(payload: ReportRequestDto) {
  return adminFileFetch(
    ADMIN_ENDPOINTS.reports.esolutionsAirtime(payload.format),
    toReportFilters(payload),
  )
}
