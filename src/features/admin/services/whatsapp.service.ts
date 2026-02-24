const WHATSAPP_API_BASE_URL =
  import.meta.env.VITE_WHATSAPP_API_BASE_URL ?? 'http://localhost:4000'

type StatusResponse = {
  connected: boolean
  initializing: boolean
  qrDataUrl: string | null
  lastError: string | null
}

export type ChatMessageDto = {
  id: string
  text: string
  direction: 'outgoing' | 'incoming'
  status?: 'sent' | 'failed'
  createdAt: number
}

export type ChatThreadDto = {
  id: string
  phone: string
  name: string
  unreadCount: number
  updatedAt: number
  messages: ChatMessageDto[]
}

type ChatsResponse = {
  threads: ChatThreadDto[]
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallbackMessage = `Request failed (${response.status})`
    const payload = await response
      .json()
      .catch(() => null as { message?: string } | null)

    throw new Error(payload?.message ?? fallbackMessage)
  }

  return response.json() as Promise<T>
}

async function whatsappFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${WHATSAPP_API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  return parseJsonOrThrow<T>(response)
}

export async function getWhatsAppStatus(): Promise<StatusResponse> {
  return whatsappFetch<StatusResponse>('/api/whatsapp/status')
}

export async function connectWhatsApp(): Promise<void> {
  await whatsappFetch('/api/whatsapp/connect', { method: 'POST' })
}

export async function disconnectWhatsApp(): Promise<void> {
  await whatsappFetch('/api/whatsapp/disconnect', { method: 'POST' })
}

export async function sendWhatsAppMessage(payload: { to: string; message: string }): Promise<void> {
  await whatsappFetch('/api/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getWhatsAppChats(): Promise<ChatsResponse> {
  return whatsappFetch<ChatsResponse>('/api/whatsapp/chats')
}

export async function openWhatsAppChat(phone: string): Promise<{
  thread: ChatThreadDto
}> {
  return whatsappFetch<{ thread: ChatThreadDto }>('/api/whatsapp/chats/open', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export async function markWhatsAppChatRead(phone: string): Promise<void> {
  await whatsappFetch(`/api/whatsapp/chats/${encodeURIComponent(phone)}/read`, {
    method: 'POST',
  })
}
