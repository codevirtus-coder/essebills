import cors from 'cors'
import express from 'express'
import QRCode from 'qrcode'
import whatsAppWeb from 'whatsapp-web.js'

const { Client, LocalAuth } = whatsAppWeb

const app = express()
const port = Number(process.env.WHATSAPP_PORT ?? 4000)
const webOrigin = process.env.WHATSAPP_WEB_ORIGIN ?? 'http://localhost:5173'
const clientId = process.env.WHATSAPP_CLIENT_ID ?? 'esebills-admin'
const authDataPath = process.env.WHATSAPP_AUTH_PATH ?? '.wwebjs_auth'

app.use(cors({ origin: webOrigin }))
app.use(express.json())

let client = null
let isInitializing = false
let isConnected = false
let qrDataUrl = null
let lastError = null
let threads = []
let syncIntervalId = null

function normalizePhone(value) {
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly) return ''
  return digitsOnly.endsWith('@c.us') ? digitsOnly : `${digitsOnly}@c.us`
}

function toDigits(value) {
  return value.replace(/\D/g, '')
}

function chatIdToPhone(chatId) {
  return toDigits(String(chatId).replace('@c.us', ''))
}

function now() {
  return Date.now()
}

function getThreadName(phone) {
  return `Client ${phone.slice(-4)}`
}

function getOrCreateThread(phone) {
  let thread = threads.find((item) => item.phone === phone)
  if (!thread) {
    thread = {
      id: `TH-${phone}`,
      phone,
      name: getThreadName(phone),
      unreadCount: 0,
      updatedAt: now(),
      messages: [],
    }
    threads = [thread, ...threads]
  }
  return thread
}

function pushMessageToThread({
  phone,
  text,
  direction,
  status = 'sent',
  incrementUnread = false,
  externalId = null,
  createdAt = now(),
}) {
  const normalizedText = String(text ?? '').trim()
  if (!normalizedText) return

  const thread = getOrCreateThread(phone)
  const duplicate = thread.messages.some((item) => {
    if (externalId && item.externalId) return item.externalId === externalId
    return (
      item.text === normalizedText &&
      item.direction === direction &&
      Math.abs(item.createdAt - createdAt) < 2000
    )
  })
  if (duplicate) return

  const message = {
    id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    externalId,
    text: normalizedText,
    direction,
    status,
    createdAt,
  }

  thread.messages = [...thread.messages, message].slice(-250)
  thread.updatedAt = message.createdAt
  if (incrementUnread) {
    thread.unreadCount += 1
  }

  threads = [...threads]
}

function captureIncomingMessage(message) {
  const from = String(message.from ?? '')
  const text = String(message.body ?? '')
  const fromMe = Boolean(message.fromMe)
  const messageId = String(message.id?._serialized ?? '')
  const timestampMs = Number(message.timestamp ?? 0) * 1000

  if (fromMe) return
  if (!from.endsWith('@c.us')) return
  if (!text.trim()) return

  const phone = chatIdToPhone(from)
  if (!phone) return

  pushMessageToThread({
    phone,
    text,
    direction: 'incoming',
    incrementUnread: true,
    externalId: messageId || null,
    createdAt: timestampMs > 0 ? timestampMs : now(),
  })
}

async function syncThreadFromWhatsApp(phone) {
  if (!client || !isConnected) return

  const chatId = normalizePhone(phone)
  if (!chatId) return

  try {
    const chat = await client.getChatById(chatId)
    const messages = await chat.fetchMessages({ limit: 50 })
    messages.forEach((msg) => {
      const body = String(msg.body ?? '').trim()
      if (!body) return

      pushMessageToThread({
        phone,
        text: body,
        direction: msg.fromMe ? 'outgoing' : 'incoming',
        incrementUnread: !msg.fromMe,
        externalId: String(msg.id?._serialized ?? '') || null,
        createdAt: Number(msg.timestamp ?? 0) > 0 ? Number(msg.timestamp) * 1000 : now(),
      })
    })
  } catch {
    // Ignore per-chat errors.
  }
}

async function syncChatsFromWhatsApp() {
  if (!client || !isConnected) return
  const phones = new Set(threads.map((item) => item.phone))
  if (phones.size === 0) return

  for (const phone of phones) {
    // eslint-disable-next-line no-await-in-loop
    await syncThreadFromWhatsApp(phone)
  }
}

function startSyncLoop() {
  if (syncIntervalId) return
  syncIntervalId = setInterval(() => {
    void syncChatsFromWhatsApp()
  }, 5000)
}

function stopSyncLoop() {
  if (!syncIntervalId) return
  clearInterval(syncIntervalId)
  syncIntervalId = null
}

function ensureClient() {
  if (client || isInitializing) return

  isInitializing = true
  lastError = null

  const nextClient = new Client({
    authStrategy: new LocalAuth({ clientId, dataPath: authDataPath }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })

  nextClient.on('qr', async (qr) => {
    qrDataUrl = await QRCode.toDataURL(qr)
    isConnected = false
  })

  nextClient.on('ready', () => {
    isConnected = true
    qrDataUrl = null
    isInitializing = false
    startSyncLoop()
  })

  nextClient.on('authenticated', () => {
    isConnected = true
    lastError = null
  })

  nextClient.on('auth_failure', (message) => {
    isConnected = false
    lastError = `Authentication failed: ${message}`
    stopSyncLoop()
  })

  nextClient.on('disconnected', (reason) => {
    isConnected = false
    qrDataUrl = null
    lastError = `Disconnected: ${reason}`
    stopSyncLoop()
  })

  nextClient.on('message', captureIncomingMessage)
  nextClient.on('message_create', captureIncomingMessage)

  nextClient
    .initialize()
    .then(() => {
      client = nextClient
      isInitializing = false
    })
    .catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize client'
      lastError = `${errorMessage}. If browser lock exists, stop old process or use a different WHATSAPP_CLIENT_ID.`
      isInitializing = false
      client = null
      stopSyncLoop()
    })
}

async function cleanupAndExit(signal) {
  try {
    if (client) {
      await client.destroy()
      client = null
    }
    stopSyncLoop()
  } finally {
    process.exit(signal === 'SIGINT' ? 130 : 0)
  }
}

app.get('/api/whatsapp/status', (_req, res) => {
  res.json({
    connected: isConnected,
    initializing: isInitializing,
    qrDataUrl,
    lastError,
  })
})

app.post('/api/whatsapp/connect', (_req, res) => {
  ensureClient()
  res.json({ ok: true })
})

app.post('/api/whatsapp/disconnect', async (_req, res) => {
  try {
    if (client) {
      await client.destroy()
      client = null
    }
    stopSyncLoop()
    isConnected = false
    isInitializing = false
    qrDataUrl = null
    threads = []
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Disconnect failed',
    })
  }
})

app.get('/api/whatsapp/chats', (_req, res) => {
  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt)
  res.json({ threads: sorted })
})

app.post('/api/whatsapp/chats/open', async (req, res) => {
  const phone = toDigits(String(req.body?.phone ?? ''))
  if (!phone) {
    res.status(400).json({ message: 'Phone is required' })
    return
  }

  const thread = getOrCreateThread(phone)
  thread.updatedAt = now()
  threads = [...threads]
  await syncThreadFromWhatsApp(phone)
  res.json({ thread: getOrCreateThread(phone) })
})

app.post('/api/whatsapp/chats/:phone/read', (req, res) => {
  const phone = toDigits(String(req.params.phone ?? ''))
  const thread = threads.find((item) => item.phone === phone)

  if (!thread) {
    res.status(404).json({ message: 'Chat not found' })
    return
  }

  thread.unreadCount = 0
  threads = [...threads]
  res.json({ ok: true })
})

app.post('/api/whatsapp/sync', async (_req, res) => {
  await syncChatsFromWhatsApp()
  res.json({ ok: true })
})

app.post('/api/whatsapp/send', async (req, res) => {
  if (!isConnected || !client) {
    res.status(400).json({ message: 'WhatsApp is not connected' })
    return
  }

  const to = String(req.body?.to ?? '')
  const message = String(req.body?.message ?? '')

  if (!to.trim() || !message.trim()) {
    res.status(400).json({ message: 'Recipient and message are required' })
    return
  }

  try {
    const chatId = normalizePhone(to)
    if (!chatId) {
      res.status(400).json({ message: 'Invalid recipient number' })
      return
    }

    await client.sendMessage(chatId, message)
    const phone = chatIdToPhone(chatId)
    pushMessageToThread({
      phone,
      text: message.trim(),
      direction: 'outgoing',
      status: 'sent',
    })
    res.json({ ok: true })
  } catch (error) {
    const phone = toDigits(to)
    if (phone) {
      pushMessageToThread({
        phone,
        text: message.trim(),
        direction: 'outgoing',
        status: 'failed',
      })
    }
    res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Failed to send message',
    })
  }
})

app.listen(port, () => {
  console.log(`WhatsApp server running on http://localhost:${port} (clientId: ${clientId})`)
})

process.on('SIGINT', () => {
  void cleanupAndExit('SIGINT')
})

process.on('SIGTERM', () => {
  void cleanupAndExit('SIGTERM')
})
