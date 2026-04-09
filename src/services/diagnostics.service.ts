// ============================================================================
// Diagnostics Service - /v1/test/*
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

export async function sendTestEmail(args: {
  to: string
  subject?: string
  body?: string
}): Promise<void> {
  const query = toQueryString({
    to: args.to,
    subject: args.subject,
    body: args.body,
  })

  await apiFetch<void>(`${API_ENDPOINTS.test.email}${query}`, { method: 'POST' })
}

