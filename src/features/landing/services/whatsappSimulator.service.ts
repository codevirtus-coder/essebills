import { apiFetch } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type { WhatsAppWebhookPayload } from '../../../types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export type SimulatorTextPayload = {
  type: 'text'
  text: {
    body: string
  }
}

type SimulatorButtonAction = {
  buttons: Array<{
    type?: string
    reply: {
      id: string
      title: string
    }
  }>
}

type SimulatorListAction = {
  button?: string
  sections: Array<{
    title?: string
    rows: Array<{
      id: string
      title: string
      description?: string
    }>
  }>
}

type SimulatorInteractiveBody = {
  text?: string
}

type SimulatorInteractivePayload = {
  type: 'interactive'
  interactive:
    | {
        type: 'button'
        body: SimulatorInteractiveBody
        action: SimulatorButtonAction
      }
    | {
        type: 'list'
        body: SimulatorInteractiveBody
        action: SimulatorListAction
      }
    | {
        type: 'button_reply'
        button_reply: {
          id: string
          title: string
        }
      }
    | {
        type: 'list_reply'
        list_reply: {
          id: string
          title: string
        }
      }
}

type SimulatorImagePayload = {
  type: 'image'
  image: {
    link?: string
    caption?: string
    id?: string
  }
}

type SimulatorDocumentPayload = {
  type: 'document'
  document: {
    link?: string
    filename?: string
    caption?: string
    id?: string
  }
}

type SimulatorLocationPayload = {
  type: 'location'
  location: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
}

type SimulatorContactsPayload = {
  type: 'contacts'
  contacts: Array<{
    name: {
      formatted_name: string
      first_name?: string
      last_name?: string
    }
    phones?: Array<{
      phone: string
      type?: string
    }>
  }>
}

export type SimulatorUnsupportedPayload = {
  type: 'unsupported'
  unsupported: {
    summary: string
    raw?: unknown
  }
}

export type SimulatorMessagePayload =
  | SimulatorTextPayload
  | SimulatorInteractivePayload
  | SimulatorImagePayload
  | SimulatorDocumentPayload
  | SimulatorLocationPayload
  | SimulatorContactsPayload
  | SimulatorUnsupportedPayload

export type SimulatorInboundPayload = SimulatorTextPayload | SimulatorInteractivePayload

type OutboundText = {
  body?: string
}

type OutboundMessage = {
  id?: string
  to?: string
  type?: string
  interactive?: UnknownRecord
  text?: OutboundText
  image?: UnknownRecord
  document?: UnknownRecord
  location?: UnknownRecord
  contacts?: UnknownRecord[]
}

function unsupported(summary: string, raw?: unknown): SimulatorUnsupportedPayload {
  return {
    type: 'unsupported',
    unsupported: {
      summary,
      raw,
    },
  }
}

function parseInteractivePayload(rawInteractive: unknown): SimulatorInteractivePayload['interactive'] | null {
  if (!isRecord(rawInteractive)) return null

  const interactiveType = asString(rawInteractive.type)
  if (!interactiveType) return null

  if (interactiveType === 'button') {
    const body = isRecord(rawInteractive.body) ? rawInteractive.body : {}
    const action = isRecord(rawInteractive.action) ? rawInteractive.action : null
    if (!action) return null

    const rawButtons = Array.isArray(action.buttons) ? action.buttons : []
    const buttons = rawButtons
      .map((rawButton) => {
        if (!isRecord(rawButton)) return null
        const reply = isRecord(rawButton.reply) ? rawButton.reply : null
        if (!reply) return null
        const id = asString(reply.id)
        const title = asString(reply.title)
        if (!id || !title) return null

        const buttonType = asString(rawButton.type)
        return {
          ...(buttonType ? { type: buttonType } : {}),
          reply: {
            id,
            title,
          },
        }
      })
      .filter((button): button is NonNullable<typeof button> => button !== null)

    if (buttons.length === 0) return null

    return {
      type: 'button',
      body: {
        text: asString(body.text),
      },
      action: { buttons },
    }
  }

  if (interactiveType === 'list') {
    const body = isRecord(rawInteractive.body) ? rawInteractive.body : {}
    const action = isRecord(rawInteractive.action) ? rawInteractive.action : null
    if (!action) return null

    const rawSections = Array.isArray(action.sections) ? action.sections : []
    const sections = rawSections
      .map((rawSection) => {
        if (!isRecord(rawSection)) return null

        const rawRows = Array.isArray(rawSection.rows) ? rawSection.rows : []
        const rows = rawRows
          .map((rawRow) => {
            if (!isRecord(rawRow)) return null
            const id = asString(rawRow.id)
            const title = asString(rawRow.title)
            if (!id || !title) return null
            const description = asString(rawRow.description)
            return {
              id,
              title,
              ...(description ? { description } : {}),
            }
          })
          .filter((row): row is NonNullable<typeof row> => row !== null)

        if (rows.length === 0) return null

        const sectionTitle = asString(rawSection.title)
        return {
          ...(sectionTitle ? { title: sectionTitle } : {}),
          rows,
        }
      })
      .filter((section): section is NonNullable<typeof section> => section !== null)

    if (sections.length === 0) return null

    const actionButton = asString(action.button)
    return {
      type: 'list',
      body: {
        text: asString(body.text),
      },
      action: {
        ...(actionButton ? { button: actionButton } : {}),
        sections,
      },
    }
  }

  if (interactiveType === 'button_reply') {
    const reply = isRecord(rawInteractive.button_reply) ? rawInteractive.button_reply : null
    if (!reply) return null
    const id = asString(reply.id)
    const title = asString(reply.title)
    if (!id || !title) return null
    return {
      type: 'button_reply',
      button_reply: { id, title },
    }
  }

  if (interactiveType === 'list_reply') {
    const reply = isRecord(rawInteractive.list_reply) ? rawInteractive.list_reply : null
    if (!reply) return null
    const id = asString(reply.id)
    const title = asString(reply.title)
    if (!id || !title) return null
    return {
      type: 'list_reply',
      list_reply: { id, title },
    }
  }

  return null
}

function parseContacts(rawContacts: unknown): SimulatorContactsPayload['contacts'] | null {
  if (!Array.isArray(rawContacts)) return null

  const contacts = rawContacts
    .map((rawContact) => {
      if (!isRecord(rawContact)) return null

      const rawName = isRecord(rawContact.name) ? rawContact.name : null
      const formattedName = asString(rawName?.formatted_name)
      if (!formattedName) return null

      const firstName = asString(rawName?.first_name)
      const lastName = asString(rawName?.last_name)

      const rawPhones = Array.isArray(rawContact.phones) ? rawContact.phones : []
      const phones = rawPhones
        .map((rawPhone) => {
          if (!isRecord(rawPhone)) return null
          const phone = asString(rawPhone.phone)
          if (!phone) return null
          const type = asString(rawPhone.type)
          return {
            phone,
            ...(type ? { type } : {}),
          }
        })
        .filter((phone): phone is NonNullable<typeof phone> => phone !== null)

      return {
        name: {
          formatted_name: formattedName,
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName ? { last_name: lastName } : {}),
        },
        ...(phones.length > 0 ? { phones } : {}),
      }
    })
    .filter((contact): contact is NonNullable<typeof contact> => contact !== null)

  return contacts.length > 0 ? contacts : null
}

function buildInboundWebhookPayload(phone: string, payload: SimulatorInboundPayload): WhatsAppWebhookPayload {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const eventId = `widget-${Date.now()}`

  const message: UnknownRecord = {
    id: eventId,
    from: phone,
    timestamp,
    type: payload.type,
  }

  if (payload.type === 'text') {
    message.text = { body: payload.text.body }
    message.textBody = payload.text.body
    message.content = payload.text.body
  } else {
    message.interactive = payload.interactive
    if (payload.interactive.type === 'button_reply') {
      message.interactiveId = payload.interactive.button_reply.id
      message.content = payload.interactive.button_reply.title
    }
    if (payload.interactive.type === 'list_reply') {
      message.interactiveId = payload.interactive.list_reply.id
      message.content = payload.interactive.list_reply.title
    }
  }

  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'landing-widget',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              contacts: [
                {
                  wa_id: phone,
                  profile: { name: 'Website Visitor' },
                },
              ],
              messages: [
                message,
              ],
            },
          },
        ],
      },
    ],
  }
}

function toSimulatorPayload(rawMessage: unknown): SimulatorMessagePayload {
  if (!isRecord(rawMessage)) {
    return unsupported('Malformed outbound message envelope', rawMessage)
  }

  const message = rawMessage as OutboundMessage
  const messageType = asString(message.type)
  if (!messageType) {
    return unsupported('Missing outbound message type', rawMessage)
  }

  if (messageType === 'text') {
    const textBody = asString(message.text?.body)?.trim()
    if (!textBody) {
      return unsupported('Malformed text payload', rawMessage)
    }
    return {
      type: 'text',
      text: { body: textBody },
    }
  }

  if (messageType === 'interactive') {
    const interactive = parseInteractivePayload(message.interactive)
    if (!interactive) {
      return unsupported('Malformed interactive payload', rawMessage)
    }
    return {
      type: 'interactive',
      interactive,
    }
  }

  if (messageType === 'image') {
    if (!isRecord(message.image)) {
      return unsupported('Malformed image payload', rawMessage)
    }

    const link = asString(message.image.link)
    const caption = asString(message.image.caption)
    const id = asString(message.image.id)

    if (!link && !caption && !id) {
      return unsupported('Malformed image payload', rawMessage)
    }

    return {
      type: 'image',
      image: {
        ...(link ? { link } : {}),
        ...(caption ? { caption } : {}),
        ...(id ? { id } : {}),
      },
    }
  }

  if (messageType === 'document') {
    if (!isRecord(message.document)) {
      return unsupported('Malformed document payload', rawMessage)
    }

    const link = asString(message.document.link)
    const filename = asString(message.document.filename)
    const caption = asString(message.document.caption)
    const id = asString(message.document.id)

    if (!link && !filename && !caption && !id) {
      return unsupported('Malformed document payload', rawMessage)
    }

    return {
      type: 'document',
      document: {
        ...(link ? { link } : {}),
        ...(filename ? { filename } : {}),
        ...(caption ? { caption } : {}),
        ...(id ? { id } : {}),
      },
    }
  }

  if (messageType === 'location') {
    if (!isRecord(message.location)) {
      return unsupported('Malformed location payload', rawMessage)
    }

    const latitude = asNumber(message.location.latitude)
    const longitude = asNumber(message.location.longitude)
    if (latitude === undefined || longitude === undefined) {
      return unsupported('Malformed location payload', rawMessage)
    }

    const name = asString(message.location.name)
    const address = asString(message.location.address)

    return {
      type: 'location',
      location: {
        latitude,
        longitude,
        ...(name ? { name } : {}),
        ...(address ? { address } : {}),
      },
    }
  }

  if (messageType === 'contacts') {
    const contacts = parseContacts(message.contacts)
    if (!contacts) {
      return unsupported('Malformed contacts payload', rawMessage)
    }
    return {
      type: 'contacts',
      contacts,
    }
  }

  return unsupported(`Unsupported outbound message type: ${messageType}`, rawMessage)
}

export async function postSimulatorInboundPayload(phone: string, payload: SimulatorInboundPayload): Promise<void> {
  const webhookPayload = buildInboundWebhookPayload(phone, payload)
  await apiFetch<void>(API_ENDPOINTS.whatsapp.simulator.inbound, {
    method: 'POST',
    body: webhookPayload,
  })
}

export async function postSimulatorInboundMessage(phone: string, message: string): Promise<void> {
  await postSimulatorInboundPayload(phone, {
    type: 'text',
    text: { body: message },
  })
}

export async function getSimulatorOutboundMessages(phone: string): Promise<SimulatorMessagePayload[]> {
  const query = new URLSearchParams({ phone })
  const response = await apiFetch<unknown>(`${API_ENDPOINTS.whatsapp.simulator.responses}?${query.toString()}`)

  if (!Array.isArray(response)) return []

  return response.map(toSimulatorPayload)
}
