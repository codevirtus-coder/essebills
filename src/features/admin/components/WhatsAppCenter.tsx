import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppChats,
  getWhatsAppStatus,
  markWhatsAppChatRead,
  openWhatsAppChat,
  sendWhatsAppMessage,
  type ChatThreadDto,
} from "../services/whatsapp.service";

function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function toDisplayTime(value: number): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDisplayDate(value: number): string {
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function WhatsAppCenter() {
  const [connected, setConnected] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThreadDto[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newClientPhone, setNewClientPhone] = useState("");
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const composerFormRef = useRef<HTMLFormElement | null>(null);

  const refreshStatus = async () => {
    try {
      const status = await getWhatsAppStatus();
      setConnected(status.connected);
      setInitializing(status.initializing);
      setQrDataUrl(status.qrDataUrl);
      setStatusError(status.lastError);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to load status");
    }
  };

  const refreshChats = async () => {
    try {
      const payload = await getWhatsAppChats();
      setThreads(payload.threads);
      setStatusError(null);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to load chats");
    }
  };

  useEffect(() => {
    void refreshStatus();
    void refreshChats();

    const interval = window.setInterval(() => {
      void refreshStatus();
      void refreshChats();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (threads.length === 0) {
      setActiveThreadId(null);
      return;
    }

    const exists = activeThreadId
      ? threads.some((thread) => thread.id === activeThreadId)
      : false;

    if (!exists) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads]);

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => b.updatedAt - a.updatedAt),
    [threads],
  );

  const activeThread = useMemo(
    () => sortedThreads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, sortedThreads],
  );

  const totalUnread = useMemo(
    () => sortedThreads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    [sortedThreads],
  );

  const statusLabel = useMemo(
    () => (connected ? "Connected" : initializing ? "Initializing..." : "Disconnected"),
    [connected, initializing],
  );

  const handleConnect = async () => {
    try {
      await connectWhatsApp();
      toast.success("WhatsApp session started. Scan QR to connect.");
      await refreshStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect WhatsApp");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsApp();
      setConnected(false);
      setQrDataUrl(null);
      toast("WhatsApp disconnected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect WhatsApp");
    }
  };

  const handleOpenThread = async (threadId: string) => {
    setActiveThreadId(threadId);
    const selected = threads.find((thread) => thread.id === threadId);
    if (!selected) return;

    try {
      await markWhatsAppChatRead(selected.phone);
      await refreshChats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark chat as read");
    }
  };

  const handleAddClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedPhone = formatPhone(newClientPhone);

    if (!cleanedPhone) {
      toast.error("Enter a valid client number.");
      return;
    }

    const existing = threads.find((thread) => thread.phone === cleanedPhone);
    if (existing) {
      await handleOpenThread(existing.id);
      setNewClientPhone("");
      toast("Opened existing chat");
      return;
    }

    try {
      const payload = await openWhatsAppChat(cleanedPhone);
      setActiveThreadId(payload.thread.id);
      setNewClientPhone("");
      await refreshChats();
      toast.success("Client chat added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open chat");
    }
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeThread) {
      toast.error("Select or add a client first.");
      return;
    }

    if (!connected) {
      toast.error("Connect WhatsApp first");
      return;
    }

    const text = composerText.trim();
    if (!text) {
      toast.error("Type a message.");
      return;
    }

    setSending(true);

    try {
      await sendWhatsAppMessage({ to: activeThread.phone, message: text });
      setComposerText("");
      await refreshChats();
      toast.success("Message sent");
    } catch (error) {
      await refreshChats();
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <section className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-dark-text">
              WhatsApp Call Center
            </h3>
            <p className="text-xs font-bold text-neutral-text mt-2">
              Open chats per client, send updates, and monitor unread conversations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
              {totalUnread} Unread
            </span>
            <span
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                connected
                  ? "bg-accent-green/10 text-accent-green"
                  : initializing
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-600"
              }`}
            >
              {statusLabel}
            </span>
            {connected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="button button-outline"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="button button-primary"
              >
                Connect WhatsApp
              </button>
            )}
          </div>
        </div>
        {statusError ? (
          <p className="mt-4 text-xs font-bold text-red-600">{statusError}</p>
        ) : null}
        {!connected && qrDataUrl ? (
          <div className="mt-6 rounded-2xl border border-neutral-light p-5 max-w-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-text mb-3">
              Scan QR in WhatsApp
            </p>
            <img src={qrDataUrl} alt="WhatsApp QR code" className="w-full rounded-lg" />
          </div>
        ) : null}
      </section>

      <section className="bg-white rounded-[3rem] border border-neutral-light shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[330px_1fr] min-h-[620px]">
          <aside className="border-r border-neutral-light p-6 space-y-5 bg-[#fbfbfe]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest text-dark-text">
                Clients
              </h4>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                {sortedThreads.length}
              </span>
            </div>

            <form onSubmit={handleAddClient} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
                New Client Chat
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(event) => setNewClientPhone(event.target.value)}
                  placeholder="26377xxxxxxx"
                  className="w-full bg-white border border-neutral-light rounded-xl px-3 py-2.5 text-sm font-semibold"
                />
                <button type="submit" className="button button-primary !px-4 !h-[42px]">
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-[470px] overflow-y-auto hide-scrollbar pr-1">
              {sortedThreads.length === 0 ? (
                <div className="p-5 rounded-2xl border border-dashed border-neutral-light text-center">
                  <p className="text-xs font-bold text-neutral-text">
                    Add a client number to start a chat.
                  </p>
                </div>
              ) : (
                sortedThreads.map((thread) => {
                  const lastMessage = thread.messages.at(-1);
                  const isActive = thread.id === activeThread?.id;

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleOpenThread(thread.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-primary/5 shadow-lg"
                          : "border-neutral-light bg-white hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-dark-text truncate">
                            {thread.name}
                          </p>
                          <p className="text-[11px] font-bold text-neutral-text mt-0.5 truncate">
                            +{thread.phone}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-neutral-text">
                            {toDisplayDate(thread.updatedAt)}
                          </span>
                          {thread.unreadCount > 0 ? (
                            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-[10px] font-black grid place-items-center">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-neutral-text line-clamp-2">
                        {lastMessage?.text ?? "No messages yet."}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className="flex flex-col min-h-[620px]">
            {!activeThread ? (
              <div className="flex-1 grid place-items-center p-8">
                <div className="text-center max-w-sm">
                  <span className="material-symbols-outlined text-6xl text-neutral-text/50">
                    mark_chat_unread
                  </span>
                  <p className="mt-4 text-sm font-bold text-neutral-text">
                    Select a client chat from the left to start messaging.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <header className="border-b border-neutral-light px-8 py-5 flex items-center justify-between">
                  <div>
                    <h5 className="text-lg font-black text-dark-text">{activeThread.name}</h5>
                    <p className="text-xs font-bold text-neutral-text mt-0.5">
                      +{activeThread.phone}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      connected
                        ? "bg-accent-green/10 text-accent-green"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {connected ? "Live Session" : "Offline"}
                  </span>
                </header>

                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#f9f9fd] space-y-4">
                  {activeThread.messages.length === 0 ? (
                    <div className="h-full grid place-items-center">
                      <p className="text-xs font-bold text-neutral-text">
                        No conversation yet. Send the first message.
                      </p>
                    </div>
                  ) : (
                    activeThread.messages.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${
                          chat.direction === "outgoing" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                            chat.direction === "outgoing"
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-white text-dark-text border border-neutral-light rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm font-medium leading-relaxed">{chat.text}</p>
                          <div className="mt-2 flex items-center gap-2 justify-end">
                            <span
                              className={`text-[10px] font-bold ${
                                chat.direction === "outgoing"
                                  ? "text-white/80"
                                  : "text-neutral-text"
                              }`}
                            >
                              {toDisplayTime(chat.createdAt)}
                            </span>
                            {chat.direction === "outgoing" ? (
                              <span
                                className={`text-[10px] font-black uppercase ${
                                  chat.status === "failed"
                                    ? "text-red-200"
                                    : "text-accent-green"
                                }`}
                              >
                                {chat.status === "failed" ? "failed" : "sent"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form
                  ref={composerFormRef}
                  onSubmit={handleSend}
                  className="border-t border-neutral-light p-5"
                >
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
                        Message
                      </label>
                      <textarea
                        value={composerText}
                        onChange={(event) => setComposerText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            if (!sending) {
                              composerFormRef.current?.requestSubmit();
                            }
                          }
                        }}
                        placeholder="Type your message..."
                        className="w-full min-h-24 bg-[#f8fafc] border border-neutral-light rounded-2xl px-4 py-3 text-sm font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="button button-primary !h-[50px] !px-6"
                      disabled={sending || !connected}
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
