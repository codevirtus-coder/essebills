import React, { useState } from "react";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import { Search, HelpCircle, Ticket as TicketIcon, MessageSquare, Mail, MessageCircle, Phone, BookOpen, Clock, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { cn } from "../../../lib/utils";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Pending" | "Resolved";
  lastUpdate: string;
}

const Support: React.FC = () => {
  const [activeView, setActiveView] = useState<"faqs" | "tickets" | "contact">("faqs");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpeningTicket, setIsOpeningTicket] = useState(false);

  const [tickets] = useState<Ticket[]>([
    {
      id: "TKT-1042",
      subject: "ZESA Settlement Delay",
      category: "Settlements",
      priority: "High",
      status: "Open",
      lastUpdate: "2 hours ago",
    },
    {
      id: "TKT-1039",
      subject: "API Key Verification Failed",
      category: "Technical",
      priority: "Medium",
      status: "Pending",
      lastUpdate: "1 day ago",
    },
    {
      id: "TKT-1035",
      subject: "Update Biller Commission Rate",
      category: "Account",
      priority: "Low",
      status: "Resolved",
      lastUpdate: "3 days ago",
    },
  ]);

  const faqs = [
    {
      q: "How long do settlements take?",
      a: "Standard settlements are processed within 24 hours. Premium billers can opt for real-time or 4-hour settlement cycles.",
    },
    {
      q: "How do I onboard a new utility biller?",
      a: 'Go to the Billers module and click "Onboard New Biller". You will need the biller official documentation and settlement account details.',
    },
    {
      q: "What are the supported currencies?",
      a: "We currently support ZiG (Zimbabwe Gold) and USD. You can set the default currency in your System Settings.",
    },
    {
      q: "How to handle a failed transaction?",
      a: 'Navigate to the Transactions tab, locate the failed entry, and check the "Error Log" in the more options menu for specific failure reasons.',
    },
  ];

  const columns: CRUDColumn<Ticket>[] = [
    {
      key: "id",
      header: "Ticket ID",
      render: (ticket) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {ticket.id}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (ticket) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {ticket.subject}
          </p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
            {ticket.category}
          </p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      className: "text-center",
      render: (ticket) => (
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
            ticket.priority === "High"
              ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
              : ticket.priority === "Medium"
                ? "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                : "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
          )}
        >
          {ticket.priority}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      render: (ticket) => (
        <div className="flex items-center justify-center gap-1.5">
          {ticket.status === 'Resolved' ? <CheckCircle2 size={14} className="text-emerald-500" /> : 
           ticket.status === 'Open' ? <AlertTriangle size={14} className="text-amber-500" /> : 
           <Circle size={14} className="text-slate-400" />}
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{ticket.status}</span>
        </div>
      ),
    },
    {
      key: "lastUpdate",
      header: "Last Update",
      className: "text-right",
      render: (ticket) => (
        <div className="flex items-center justify-end gap-1.5 text-slate-500 text-xs font-medium">
          <Clock size={12} />
          {ticket.lastUpdate}
        </div>
      ),
    },
  ];

  const handleOpenTicket = () => {
    setIsOpeningTicket(true);
    setTimeout(() => {
      setIsOpeningTicket(false);
      alert("Support request initiated. A new ticket will be available in your dashboard shortly.");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 p-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Support Center
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
          Find answers to common questions or reach out to our dedicated support team for personalized assistance.
        </p>

        <div className="relative max-w-xl mx-auto pt-4">
          <Search size={18} className="absolute left-4 top-[calc(50%+8px)] -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help topics, guides, or ticket IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-lg shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: "faqs", label: "Frequently Asked Questions", icon: HelpCircle },
          { id: "tickets", label: "My Support Tickets", icon: TicketIcon },
          { id: "contact", label: "Contact Channels", icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeView === tab.id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeView === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeView === "faqs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HelpCircle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeView === "tickets" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tickets</h3>
              <button
                onClick={handleOpenTicket}
                disabled={isOpeningTicket}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isOpeningTicket ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                {isOpeningTicket ? "Opening..." : "Open New Ticket"}
              </button>
            </div>

            <CRUDLayout
              title=""
              columns={columns}
              data={tickets}
              loading={false}
              pageable={{ page: 1, size: 10, totalElements: tickets.length, totalPages: 1 }}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              searchable={false}
            />
          </div>
        )}

        {activeView === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Email Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium px-4">
                Send us a detailed message. We aim to reply within 4 business hours.
              </p>
              <a href="mailto:support@esebills.com" className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest hover:underline">
                support@esebills.com
              </a>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-emerald-500/20 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-emerald-900/5 transition-all relative">
              <div className="absolute top-6 right-6 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold rounded uppercase tracking-widest">
                Active Now
              </div>
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Live Chat</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium px-4">
                Chat with one of our support agents in real-time for quick resolutions.
              </p>
              <button onClick={handleOpenTicket} className="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
                Start Chat
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Phone Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium px-4">
                Available Mon-Fri, 8AM - 5PM CAT for urgent corporate inquiries.
              </p>
              <a href="tel:+263123456789" className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest hover:underline">
                +263 123 456 789
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-10 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-2xl">
        <div className="relative z-10 space-y-2">
          <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="text-emerald-400" /> Technical Documentation
          </h3>
          <p className="text-slate-400 text-sm max-w-md font-medium">
            Looking for API references or integration guides? Visit our developer portal for comprehensive documentation.
          </p>
        </div>
        <button className="relative z-10 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg">
          Go to Dev Portal
        </button>
      </div>
    </div>
  );
};

export default Support;
