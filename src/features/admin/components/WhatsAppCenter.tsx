import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import { getWhatsappSessions, getWhatsappMessages, getWhatsappMessagesByPhone, getWhatsappMessagesBySession, getWhatsappSessionById } from "../services";
import { MessageSquare, Smartphone, Clock, RefreshCw, Hash, FileText, Search, Eye, X } from "lucide-react";

type UnknownRecord = Record<string, unknown>;

function getStr(record: UnknownRecord, key: string): string {
  const val = record[key];
  return val !== null && val !== undefined ? String(val) : "-";
}

export default function WhatsAppCenter() {
  const [sessions, setSessions] = useState<UnknownRecord[]>([]);
  const [messages, setMessages] = useState<UnknownRecord[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<UnknownRecord | null>(null);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [phonePage, setPhonePage] = useState(1);

  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const page = await getWhatsappSessions({ size: 50 });
      setSessions(Array.isArray(page?.content) ? page.content : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const page = await getWhatsappMessages({ size: 50 });
      setMessages(Array.isArray(page?.content) ? page.content : []);
      setSelectedSessionId('');
      setSelectedSession(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const loadMessagesBySession = useCallback(async (sessionId: string | number) => {
    setIsLoadingMessages(true);
    try {
      const [session, list] = await Promise.all([
        getWhatsappSessionById(sessionId),
        getWhatsappMessagesBySession(sessionId),
      ])
      setSelectedSessionId(String(sessionId))
      setSelectedSession(session)
      setMessages(Array.isArray(list) ? list : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load session messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [])

  const loadMessagesByPhone = useCallback(async (phone: string, page = 1) => {
    setIsLoadingMessages(true)
    try {
      const p = await getWhatsappMessagesByPhone(phone, { page: page - 1, size: 50 })
      setMessages(Array.isArray(p?.content) ? p.content : [])
      setSelectedSessionId('')
      setSelectedSession(null)
      setPhonePage(page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load phone messages");
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    void loadSessions();
    void loadMessages();
  }, [loadSessions, loadMessages]);

  const sessionColumns: CRUDColumn<UnknownRecord>[] = [
    {
      key: "id",
      header: "Session ID",
      render: (s) => (
        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <Hash size={12} />
          {getStr(s, "id")}
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "Phone Number",
      render: (s) => (
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Smartphone size={14} className="text-emerald-500" />
          {getStr(s, "phoneNumber")}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      render: (s) => (
        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
          {getStr(s, "status")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (s) => (
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Clock size={12} />
          {getStr(s, "createdAt")}
        </div>
      ),
    },
  ];

  const messageColumns: CRUDColumn<UnknownRecord>[] = [
    {
      key: "id",
      header: "Message ID",
      render: (m) => (
        <span className="font-mono text-xs text-slate-500">{getStr(m, "id")}</span>
      ),
    },
    {
      key: "from",
      header: "From",
      render: (m) => <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{getStr(m, "from")}</span>,
    },
    {
      key: "to",
      header: "To",
      render: (m) => <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{getStr(m, "to")}</span>,
    },
    {
      key: "content",
      header: "Content",
      render: (m) => (
        <div className="flex items-center gap-2 max-w-xs">
          <FileText size={14} className="text-slate-400 shrink-0" />
          <span className="truncate text-sm text-slate-600 dark:text-slate-400">{getStr(m, "content")}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (m) => <span className="text-xs text-slate-500 font-medium">{getStr(m, "createdAt")}</span>,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">WhatsApp Center</h2>
            <p className="text-sm text-slate-500 font-medium">Monitor active sessions and message logs.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Smartphone size={16} /> Active Sessions
            </h3>
            <button 
              onClick={() => void loadSessions()} 
              disabled={isLoadingSessions}
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoadingSessions ? "animate-spin" : ""} />
            </button>
          </div>
          <CRUDLayout
            title=""
            columns={sessionColumns}
            data={sessions}
            loading={isLoadingSessions}
            pageable={{ page: 1, size: 50, totalElements: sessions.length, totalPages: 1 }}
            onPageChange={() => {}}
            onSizeChange={() => {}}
            searchable={false}
            actions={{
              onView: (s) => {
                const id = (s as any)?.id
                if (id === null || id === undefined) return
                void loadMessagesBySession(id)
              },
              renderCustom: () => (
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="View messages"
                >
                  <Eye size={16} />
                </button>
              ),
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} /> {selectedSessionId ? `Session ${selectedSessionId}` : phoneFilter.trim() ? `Phone ${phoneFilter.trim()}` : 'Recent Messages'}
            </h3>
            <div className="flex items-center gap-2">
              {(selectedSessionId || phoneFilter.trim()) && (
                <button
                  onClick={() => {
                    setPhoneFilter('')
                    setPhonePage(1)
                    void loadMessages()
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Clear filter"
                >
                  <X size={16} />
                </button>
              )}
              <button 
                onClick={() => void loadMessages()} 
                disabled={isLoadingMessages}
                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                title="Refresh recent messages"
              >
                <RefreshCw size={16} className={isLoadingMessages ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="glass-card p-4 border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              placeholder="Search messages by phone number…"
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => {
                const p = phoneFilter.trim()
                if (!p) return
                void loadMessagesByPhone(p, 1)
              }}
              disabled={!phoneFilter.trim() || isLoadingMessages}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Search
            </button>
          </div>

          {selectedSession && (
            <div className="px-1 text-xs text-slate-500 font-medium">
              Session phone: <span className="font-mono text-slate-600">{getStr(selectedSession, 'phoneNumber')}</span>
              {' · '}
              Status: <span className="font-mono text-slate-600">{getStr(selectedSession, 'status')}</span>
            </div>
          )}

          <CRUDLayout
            title=""
            columns={messageColumns}
            data={messages}
            loading={isLoadingMessages}
            pageable={{ page: 1, size: 50, totalElements: messages.length, totalPages: 1 }}
            onPageChange={() => {}}
            onSizeChange={() => {}}
            searchable={false}
          />

          {phoneFilter.trim() && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void loadMessagesByPhone(phoneFilter.trim(), Math.max(1, phonePage - 1))}
                disabled={phonePage <= 1 || isLoadingMessages}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => void loadMessagesByPhone(phoneFilter.trim(), phonePage + 1)}
                disabled={isLoadingMessages}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
