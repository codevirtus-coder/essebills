import { useCallback, useEffect, useRef, useState } from 'react';
import { X, MessageCircle, Send, Loader2, FileText, MapPin, User, Image as ImageIcon } from 'lucide-react';
import {
  getSimulatorOutboundMessages,
  postSimulatorInboundPayload,
  type SimulatorInboundPayload,
  type SimulatorMessagePayload,
} from '../services/whatsappSimulator.service';

type MsgRole = 'bot' | 'user';

type Message = {
  id: number;
  role: MsgRole;
  payload: SimulatorMessagePayload;
  time: string;
};

type InteractivePayload = Extract<SimulatorMessagePayload, { type: 'interactive' }>['interactive'];
type ButtonInteractivePayload = Extract<InteractivePayload, { type: 'button' }>;
type ListInteractivePayload = Extract<InteractivePayload, { type: 'list' }>;

const SIMULATOR_PHONE = import.meta.env.VITE_WHATSAPP_SIMULATOR_PHONE?.trim() || '263777000001';

function previewRawPayload(raw: unknown): string | null {
  if (raw === undefined) return null;

  try {
    const serialized = JSON.stringify(raw);
    if (!serialized) return null;
    return serialized.length > 180 ? `${serialized.slice(0, 177)}...` : serialized;
  } catch {
    return '[Unable to serialize payload]';
  }
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function textPayload(body: string): SimulatorMessagePayload {
  return {
    type: 'text',
    text: { body },
  };
}

function botMsg(payload: SimulatorMessagePayload, id: number): Message {
  return { id, role: 'bot', payload, time: now() };
}

function userMsg(payload: SimulatorMessagePayload, id: number): Message {
  return { id, role: 'user', payload, time: now() };
}

function ListOptions({
  interactive,
  canReply,
  onListReply,
}: {
  interactive: ListInteractivePayload;
  canReply: boolean;
  onListReply: (id: string, title: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm whitespace-pre-wrap break-words">{interactive.body?.text || ''}</p>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-xs w-full text-center py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
      >
        {interactive.action?.button || 'View options'}
      </button>
      {open ? (
        <div className="border border-slate-200 rounded overflow-hidden bg-white">
          {(interactive.action?.sections || []).map((section, sectionIndex) => (
            <div key={`${section.title || 'section'}-${sectionIndex}`}>
              {section.title ? (
                <div className="px-3 py-1 bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase">
                  {section.title}
                </div>
              ) : null}
              {(section.rows || []).map((row) => (
                <button
                  type="button"
                  key={row.id}
                  disabled={!canReply}
                  onClick={() => {
                    if (!canReply) return;
                    onListReply(row.id, row.title);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <p className="text-sm font-medium text-slate-800">{row.title}</p>
                  {row.description ? <p className="text-xs text-slate-500">{row.description}</p> : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PayloadView({
  payload,
  canReply,
  onButtonReply,
  onListReply,
}: {
  payload: SimulatorMessagePayload;
  canReply: boolean;
  onButtonReply: (id: string, title: string) => void;
  onListReply: (id: string, title: string) => void;
}) {
  if (payload.type === 'text') {
    return <p className="text-sm whitespace-pre-wrap break-words">{payload.text.body}</p>;
  }

  if (payload.type === 'image') {
    return (
      <div className="space-y-1">
        {payload.image.link ? (
          <img src={payload.image.link} alt="image" className="rounded max-w-[230px] max-h-[180px] object-cover" />
        ) : (
          <div className="flex items-center gap-2 p-2 rounded bg-slate-100 text-slate-500 text-xs">
            <ImageIcon size={16} />
            Image
          </div>
        )}
        {payload.image.caption ? <p className="text-sm">{payload.image.caption}</p> : null}
      </div>
    );
  }

  if (payload.type === 'document') {
    return (
      <div className="flex items-center gap-2 p-2 rounded bg-slate-100">
        <FileText size={16} className="text-slate-500" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{payload.document.filename || 'Document'}</p>
          {payload.document.caption ? <p className="text-xs text-slate-500">{payload.document.caption}</p> : null}
        </div>
      </div>
    );
  }

  if (payload.type === 'location') {
    return (
      <div className="rounded bg-slate-100 p-2 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin size={14} className="text-rose-500" />
          {payload.location.name || 'Location'}
        </div>
        {payload.location.address ? <p className="text-xs text-slate-500">{payload.location.address}</p> : null}
      </div>
    );
  }

  if (payload.type === 'contacts') {
    return (
      <div className="space-y-1">
        {payload.contacts.map((contact, index) => (
          <div key={`${contact.name.formatted_name}-${index}`} className="flex items-center gap-2 p-2 rounded bg-slate-100">
            <User size={14} className="text-slate-500" />
            <div>
              <p className="text-sm font-medium">{contact.name.formatted_name}</p>
              {(contact.phones || []).map((phone, phoneIndex) => (
                <p key={`${phone.phone}-${phoneIndex}`} className="text-xs text-slate-500">{phone.phone}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (payload.type === 'interactive') {
    const interactive = payload.interactive;

    if (interactive.type === 'button') {
      const buttonPayload = interactive as ButtonInteractivePayload;
      return (
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap break-words">{buttonPayload.body?.text || ''}</p>
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-200">
            {(buttonPayload.action?.buttons || []).map((button) => (
              <button
                type="button"
                key={button.reply.id}
                disabled={!canReply}
                onClick={() => onButtonReply(button.reply.id, button.reply.title)}
                className="text-xs py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {button.reply.title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (interactive.type === 'list') {
      return (
        <ListOptions
          interactive={interactive as ListInteractivePayload}
          canReply={canReply}
          onListReply={onListReply}
        />
      );
    }

    if (interactive.type === 'button_reply') {
      return (
        <div>
          <p className="text-sm font-medium">{interactive.button_reply.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">id: {interactive.button_reply.id}</p>
        </div>
      );
    }

    if (interactive.type === 'list_reply') {
      return (
        <div>
          <p className="text-sm font-medium">{interactive.list_reply.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">id: {interactive.list_reply.id}</p>
        </div>
      );
    }
  }

  if (payload.type === 'unsupported') {
    const rawPreview = previewRawPayload(payload.unsupported.raw);
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2">
        <p className="text-xs font-semibold text-amber-800">Unsupported response payload</p>
        <p className="mt-1 text-xs text-amber-700">{payload.unsupported.summary}</p>
        {rawPreview ? <p className="mt-1 text-[10px] text-amber-700 break-all">{rawPreview}</p> : null}
      </div>
    );
  }

  return <p className="text-sm text-slate-500">[Unsupported message type]</p>;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const isSyncingRef = useRef(false);
  const seenResponseCountRef = useRef(0);
  const nextId = () => idRef.current++;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const syncSimulatorReplies = useCallback(async () => {
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    try {
      const outbound = await getSimulatorOutboundMessages(SIMULATOR_PHONE);

      if (outbound.length < seenResponseCountRef.current) {
        seenResponseCountRef.current = 0;
      }

      const start = seenResponseCountRef.current;
      const nextReplies = outbound.slice(start);
      seenResponseCountRef.current = outbound.length;

      if (nextReplies.length === 0) return;

      setMessages((prev) => [
        ...prev,
        ...nextReplies.map((payload) => botMsg(payload, nextId())),
      ]);
      setErrorText('');
    } catch {
      setErrorText('Unable to sync simulator replies right now.');
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const interval = window.setInterval(() => {
      void syncSimulatorReplies();
    }, 3500);

    void syncSimulatorReplies();

    return () => {
      window.clearInterval(interval);
    };
  }, [open, syncSimulatorReplies]);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    setMessages([
      {
        id: idRef.current++,
        role: 'bot',
        payload: textPayload('Hi! I am connected to the WhatsApp simulator inbound route. Type your message to continue.'),
        time: now(),
      },
    ]);
  }, [open, messages.length]);

  async function sendInboundPayload(payload: SimulatorInboundPayload, optimisticPayload: SimulatorMessagePayload) {
    if (sending) return;

    setSending(true);
    setTyping(true);
    setErrorText('');
    setMessages((prev) => [...prev, userMsg(optimisticPayload, nextId())]);

    try {
      await postSimulatorInboundPayload(SIMULATOR_PHONE, payload);
      await syncSimulatorReplies();
    } catch {
      setMessages((prev) => [
        ...prev,
        botMsg(
          textPayload('Sorry, I could not reach the WhatsApp simulator inbound route. Please try again.'),
          nextId(),
        ),
      ]);
      setErrorText('Simulator inbound request failed. Check API availability.');
    } finally {
      setTyping(false);
      setSending(false);
    }
  }

  async function submitTextMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');

    const payload: SimulatorInboundPayload = {
      type: 'text',
      text: { body: text },
    };

    await sendInboundPayload(payload, payload);
  }

  function handleButtonReply(id: string, title: string) {
    const payload: SimulatorInboundPayload = {
      type: 'interactive',
      interactive: {
        type: 'button_reply',
        button_reply: { id, title },
      },
    };

    void sendInboundPayload(payload, payload);
  }

  function handleListReply(id: string, title: string) {
    const payload: SimulatorInboundPayload = {
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id, title },
      },
    };

    void sendInboundPayload(payload, payload);
  }

  function reset() {
    setMessages([]);
    setInput('');
    setTyping(false);
    setSending(false);
    setErrorText('');
    seenResponseCountRef.current = 0;
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen((value) => !value);
          if (!open) reset();
        }}
        aria-label={open ? 'Close chat' : 'Open EseBot chat'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-slate-800 hover:bg-slate-700'
            : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105'
        }`}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white text-[9px] font-bold text-slate-900 flex items-center justify-center">
              AI
            </span>
          </>
        )}
      </button>

      {open ? (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden bg-white"
          style={{ maxHeight: 'min(560px, calc(100vh - 120px))' }}
        >
          <div className="bg-emerald-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none mb-0.5">EseBot</p>
              <p className="text-emerald-100 text-xs">WhatsApp simulator inbound</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-emerald-100 text-xs">Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-1 mr-2">
                    <MessageCircle size={12} className="text-white" />
                  </div>
                ) : null}
                <div className="max-w-[78%]">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    <PayloadView
                      payload={msg.payload}
                      canReply={msg.role === 'bot' && !sending}
                      onButtonReply={handleButtonReply}
                      onListReply={handleListReply}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}

            {typing ? (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle size={12} className="text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                placeholder="Type a message"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void submitTextMessage();
                  }
                }}
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                onClick={() => void submitTextMessage()}
                disabled={!input.trim() || sending}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">SIM: {SIMULATOR_PHONE}</span>
              {errorText ? <span className="text-[11px] text-rose-500">{errorText}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
