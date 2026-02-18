
import React, { useState } from 'react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Resolved';
  lastUpdate: string;
}

const Support: React.FC = () => {
  const [activeView, setActiveView] = useState<'faqs' | 'tickets' | 'contact'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpeningTicket, setIsOpeningTicket] = useState(false);

  const [tickets] = useState<Ticket[]>([
    { id: 'TKT-1042', subject: 'ZESA Settlement Delay', category: 'Settlements', priority: 'High', status: 'Open', lastUpdate: '2 hours ago' },
    { id: 'TKT-1039', subject: 'API Key Verification Failed', category: 'Technical', priority: 'Medium', status: 'Pending', lastUpdate: '1 day ago' },
    { id: 'TKT-1035', subject: 'Update Biller Commission Rate', category: 'Account', priority: 'Low', status: 'Resolved', lastUpdate: '3 days ago' },
  ]);

  const faqs = [
    { q: 'How long do settlements take?', a: 'Standard settlements are processed within 24 hours. Premium billers can opt for real-time or 4-hour settlement cycles.' },
    { q: 'How do I onboard a new utility biller?', a: 'Go to the Billers module and click "Onboard New Biller". You will need the biller official documentation and settlement account details.' },
    { q: 'What are the supported currencies?', a: 'We currently support ZiG (Zimbabwe Gold) and USD. You can set the default currency in your System Settings.' },
    { q: 'How to handle a failed transaction?', a: 'Navigate to the Transactions tab, locate the failed entry, and check the "Error Log" in the more options menu for specific failure reasons.' },
  ];

  const handleOpenTicket = () => {
    setIsOpeningTicket(true);
    setTimeout(() => {
      setIsOpeningTicket(false);
      alert("Support request initiated. A new ticket will be available in your dashboard shortly.");
    }, 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-black text-dark-text dark:text-white tracking-tight">Support Center</h2>
        <p className="text-neutral-text max-w-xl mx-auto">Find answers to common questions or reach out to our dedicated support team for personalized assistance.</p>
        
        <div className="relative max-w-2xl mx-auto pt-4">
          <span className="material-symbols-outlined absolute left-4 top-[calc(50%+8px)] -translate-y-1/2 text-neutral-text">search</span>
          <input 
            type="text" 
            placeholder="Search for help topics, guides, or ticket IDs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white  border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-xl shadow-neutral-light/50 dark:shadow-none focus:ring-2 focus:ring-primary/20 text-dark-text dark:text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 border-b border-neutral-light dark:border-white/5 pb-px">
        {[
          { id: 'faqs', label: 'Frequently Asked Questions', icon: 'quiz' },
          { id: 'tickets', label: 'My Support Tickets', icon: 'confirmation_number' },
          { id: 'contact', label: 'Contact Channels', icon: 'forum' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeView === tab.id 
                ? 'text-primary' 
                : 'text-neutral-text hover:text-dark-text dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
            {activeView === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {activeView === 'faqs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white  p-8 rounded-3xl border border-neutral-light dark:border-white/5 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">help</span>
                </div>
                <h3 className="text-lg font-bold text-dark-text dark:text-white mb-3">{faq.q}</h3>
                <p className="text-sm text-neutral-text leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        )}

        {activeView === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-dark-text dark:text-white">Recent Tickets</h3>
              <button 
                onClick={handleOpenTicket}
                disabled={isOpeningTicket}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isOpeningTicket ? (
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">add</span>
                )}
                {isOpeningTicket ? 'Opening...' : 'Open New Ticket'}
              </button>
            </div>
            
            <div className="bg-white  rounded-3xl border border-neutral-light dark:border-white/5 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-light/20 dark:bg-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Ticket ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Subject</th>
                    <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light dark:divide-white/5">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="px-8 py-5 font-mono text-xs font-bold text-primary">{ticket.id}</td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-dark-text dark:text-white">{ticket.subject}</p>
                        <p className="text-[10px] text-neutral-text uppercase font-black">{ticket.category}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded ${
                          ticket.priority === 'High' ? 'bg-red-100 text-red-600' : 
                          ticket.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase ${
                          ticket.status === 'Open' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                          ticket.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                          'bg-neutral-light/50 text-neutral-text border-neutral-light'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            ticket.status === 'Open' ? 'bg-accent-green' : 
                            ticket.status === 'Pending' ? 'bg-yellow-600' : 'bg-neutral-text'
                          }`}></div>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-xs font-bold text-neutral-text">{ticket.lastUpdate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="bg-white  p-10 rounded-[2.5rem] border border-neutral-light dark:border-white/5 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-primary/5 transition-all">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">mail</span>
              </div>
              <h4 className="text-xl font-black text-dark-text dark:text-white mb-2">Email Support</h4>
              <p className="text-sm text-neutral-text mb-6">Send us a detailed message. We aim to reply within 4 business hours.</p>
              <a href="mailto:support@esebills.com" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">support@esebills.com</a>
            </div>

            <div className="bg-white  p-10 rounded-[2.5rem] border border-primary/20 dark:border-white/5 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-primary/5 transition-all relative">
              <div className="absolute top-6 right-6 px-3 py-1 bg-accent-green text-dark-text text-[9px] font-black rounded uppercase tracking-widest">Active Now</div>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <h4 className="text-xl font-black text-dark-text dark:text-white mb-2">Live Chat</h4>
              <p className="text-sm text-neutral-text mb-6">Chat with one of our support agents in real-time for quick resolutions.</p>
              <button 
                onClick={handleOpenTicket}
                className="bg-primary text-white w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-opacity-90 transition-all"
              >
                Start Chat
              </button>
            </div>

            <div className="bg-white  p-10 rounded-[2.5rem] border border-neutral-light dark:border-white/5 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-primary/5 transition-all">
              <div className="w-16 h-16 bg-accent-green/10 text-accent-green rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">call</span>
              </div>
              <h4 className="text-xl font-black text-dark-text dark:text-white mb-2">Phone Support</h4>
              <p className="text-sm text-neutral-text mb-6">Available Mon-Fri, 8AM - 5PM CAT for urgent corporate inquiries.</p>
              <a href="tel:+263123456789" className="text-accent-green font-black uppercase text-xs tracking-widest hover:underline">+263 123 456 789</a>
            </div>
          </div>
        )}
      </div>

      {/* Useful Resources */}
      <div className="bg-[#221c35] p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12 overflow-hidden relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         <div className="relative z-10">
           <h3 className="text-2xl font-black tracking-tight mb-2">Technical Documentation</h3>
           <p className="text-white/60 text-sm max-w-md">Looking for API references or integration guides? Visit our developer portal for comprehensive documentation.</p>
         </div>
         <button className="relative z-10 bg-white text-dark-text px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
           Go to Dev Portal
         </button>
      </div>
    </div>
  );
};

export default Support;

