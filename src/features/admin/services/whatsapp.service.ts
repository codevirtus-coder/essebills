// WhatsApp sessions and messages are now served from the main gateway API.
// See adminModules.service.ts: getWhatsappSessions, getWhatsappMessages
// Legacy external WhatsApp API client removed — it pointed to a separate
// sidecar service (VITE_WHATSAPP_API_BASE_URL) that no longer exists.
export {}
