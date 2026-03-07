import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Send, ArrowRight, Loader2 } from 'lucide-react';
import { ROUTE_PATHS } from '../../../router/paths';

// ─── Conversation engine ───────────────────────────────────────────────────────

type MsgRole = 'bot' | 'user';

type Message = {
  id: number;
  role: MsgRole;
  text: string;
  time: string;
};

type QuickReply = {
  label: string;
  value: string;
};

type Step =
  | 'greeting'
  | 'main-menu'
  | 'category-select'
  | 'biller-select'
  | 'amount'
  | 'confirm'
  | 'done';

const CATEGORIES = [
  { key: 'utilities',  label: '⚡ Utilities' },
  { key: 'airtime',    label: '📱 Airtime & Bundles' },
  { key: 'education',  label: '🎓 School Fees' },
  { key: 'insurance',  label: '🛡️ Insurance' },
  { key: 'water',      label: '💧 Water Bills' },
  { key: 'internet',   label: '🌐 Internet' },
];

const BILLERS_BY_CATEGORY: Record<string, string[]> = {
  utilities:  ['ZESA Prepaid', 'ZESA Postpaid', 'City of Harare', 'City of Bulawayo'],
  airtime:    ['Econet Airtime', 'NetOne Airtime', 'Telecel Airtime', 'Econet Bundles'],
  education:  ['University of Zimbabwe', 'NUST', 'Midlands State University', 'HEXCO'],
  insurance:  ['CIMAS Medical', 'Nyaradzo Life', 'First Mutual Life'],
  water:      ['ZINWA', 'City of Harare Water', 'City of Bulawayo Water'],
  internet:   ['Liquid Home', 'TelOne ADSL', 'ZOL Zimbabwe', 'PowerTel'],
};

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function botMsg(text: string, id: number): Message {
  return { id, role: 'bot', text, time: now() };
}

function userMsg(text: string, id: number): Message {
  return { id, role: 'user', text, time: now() };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatbotWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>('greeting');
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBiller, setSelectedBiller] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const nextId = () => idRef.current++;

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Initialize on open
  useEffect(() => {
    if (!open || messages.length > 0) return;
    addBotMessage(
      "Hi! 👋 I'm EseBot. I can help you pay bills instantly.\n\nWhat would you like to do?",
      [
        { label: '💳 Pay a bill', value: 'pay' },
        { label: '📋 View services', value: 'services' },
        { label: '❓ Get help', value: 'help' },
      ],
      'main-menu',
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function addBotMessage(text: string, replies: QuickReply[], nextStep: Step) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, botMsg(text, nextId())]);
      setQuickReplies(replies);
      setStep(nextStep);
    }, 700);
  }

  function handleQuickReply(reply: QuickReply) {
    // Add user bubble
    setMessages((prev) => [...prev, userMsg(reply.label, nextId())]);
    setQuickReplies([]);

    if (step === 'main-menu') {
      if (reply.value === 'pay') {
        addBotMessage(
          'Great! What type of bill would you like to pay?',
          CATEGORIES.map((c) => ({ label: c.label, value: c.key })),
          'category-select',
        );
      } else if (reply.value === 'services') {
        addBotMessage(
          'Sure! Opening the services marketplace for you. 🚀',
          [],
          'done',
        );
        setTimeout(() => navigate(ROUTE_PATHS.services), 1000);
      } else {
        addBotMessage(
          "I can help you:\n• Pay utility bills (ZESA, water, council)\n• Buy airtime & data bundles\n• Pay school fees\n• Buy insurance\n\nYou can also visit our full services page or call us on *XXX*.\n\nWhat would you like to do?",
          [
            { label: '💳 Pay a bill', value: 'pay' },
            { label: '📋 All services', value: 'services' },
          ],
          'main-menu',
        );
      }
      return;
    }

    if (step === 'category-select') {
      setSelectedCategory(reply.value);
      const billers = BILLERS_BY_CATEGORY[reply.value] ?? [];
      addBotMessage(
        `Which biller would you like to pay under ${reply.label}?`,
        billers.map((b) => ({ label: b, value: b })),
        'biller-select',
      );
      return;
    }

    if (step === 'biller-select') {
      setSelectedBiller(reply.value);
      addBotMessage(
        `How much would you like to pay to **${reply.label}**?\n\nType the amount below (e.g. 10.00):`,
        [],
        'amount',
      );
      return;
    }

    if (step === 'confirm') {
      if (reply.value === 'yes') {
        addBotMessage('Taking you to checkout now... 🚀', [], 'done');
        setTimeout(() => {
          const query = new URLSearchParams({
            biller: selectedBiller,
            account: '',
            amount: amountInput || '0',
          });
          navigate(`${ROUTE_PATHS.checkout}?${query.toString()}`);
        }, 800);
      } else {
        setSelectedBiller('');
        setSelectedCategory('');
        setAmountInput('');
        addBotMessage(
          'No problem! What would you like to do instead?',
          [
            { label: '💳 Pay a different bill', value: 'pay' },
            { label: '📋 View all services', value: 'services' },
          ],
          'main-menu',
        );
      }
    }
  }

  function handleAmountSubmit() {
    const trimmed = amountInput.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) return;

    setMessages((prev) => [...prev, userMsg(`$${trimmed}`, nextId())]);
    setQuickReplies([]);

    addBotMessage(
      `Got it! Here's your payment summary:\n\n🏷 Biller: ${selectedBiller}\n💵 Amount: $${trimmed}\n\nShall I proceed to checkout?`,
      [
        { label: '✅ Yes, proceed', value: 'yes' },
        { label: '✏️ Change details', value: 'no' },
      ],
      'confirm',
    );
  }

  function reset() {
    setMessages([]);
    setStep('greeting');
    setQuickReplies([]);
    setSelectedCategory('');
    setSelectedBiller('');
    setAmountInput('');
    setTyping(false);
  }

  return (
    <>
      {/* ── Floating button ──────────────────────────────────────────────── */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) reset(); }}
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

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden bg-white"
          style={{ maxHeight: 'min(560px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="bg-emerald-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none mb-0.5">EseBot</p>
              <p className="text-emerald-100 text-xs">Bill payments assistant</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-emerald-100 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-1 mr-2">
                    <MessageCircle size={12} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? '' : ''}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
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
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {quickReplies.length > 0 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-2">
              {quickReplies.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleQuickReply(r)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Amount input (only when in amount step) */}
          {step === 'amount' && quickReplies.length === 0 && (
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2">
              <div className="flex-1 flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm rounded-l-lg">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAmountSubmit()}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-r-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  autoFocus
                />
              </div>
              <button
                onClick={handleAmountSubmit}
                disabled={!amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {/* Footer link */}
          {step === 'done' && (
            <div className="px-4 py-3 bg-white border-t border-slate-100 text-center">
              <Loader2 size={16} className="animate-spin text-emerald-600 mx-auto" />
            </div>
          )}

          {step !== 'amount' && step !== 'done' && quickReplies.length === 0 && (
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Powered by EseBills</span>
              <button
                onClick={() => navigate(ROUTE_PATHS.services)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View all services
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
