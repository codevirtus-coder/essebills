
import React, { useState } from 'react';

interface MessageLog {
  id: string;
  recipient: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
  subject: string;
  status: 'Delivered' | 'Failed' | 'Pending';
  timestamp: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
}

const MOCK_LOGS: MessageLog[] = [
  { id: 'MSG-001', recipient: '+263 771 223 994', type: 'SMS', subject: 'ZESA Token Purchase', status: 'Delivered', timestamp: '2 mins ago' },
  { id: 'MSG-002', recipient: 'alex.m@gmail.com', type: 'Email', subject: 'Login Alert', status: 'Delivered', timestamp: '15 mins ago' },
  { id: 'MSG-003', recipient: '+263 783 987 654', type: 'WhatsApp', subject: 'Receipt #EB-1029', status: 'Pending', timestamp: '1 hour ago' },
  { id: 'MSG-004', recipient: '+263 712 555 333', type: 'SMS', subject: 'Low Float Warning', status: 'Failed', timestamp: '3 hours ago' },
];

const MOCK_TEMPLATES: Template[] = [
  { id: 'T-1', name: 'Standard Receipt', category: 'Transactional', content: 'Dear {{customer}}, your payment of {{amount}} to {{biller}} was successful. Token: {{token}}.' },
  { id: 'T-2', name: 'Low Float Alert', category: 'Agent', content: 'Alert: Your shop float is below {{limit}}. Please top up to avoid service interruption.' },
  { id: 'T-3', name: 'OTP Verification', category: 'Security', content: 'Your EseBills verification code is {{code}}. Valid for 5 minutes.' },
];

const Messaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'config'>('logs');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSendTest = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }, 1500);
  };

  const renderLogs = () => (
    <div className="bg-white rounded-[2.5rem] border border-neutral-light overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="p-8 border-b border-neutral-light flex items-center justify-between bg-neutral-light/5">
        <h3 className="text-xl font-black text-dark-text">Communication Logs</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-neutral-light rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-text hover:text-primary transition-all">Filter: All Channels</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-light/20">
              <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Recipient</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Channel</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Message Focus</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-light/10 transition-colors">
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-dark-text">{log.recipient}</p>
                  <p className="text-[10px] font-mono text-primary">{log.id}</p>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-lg ${
                        log.type === 'SMS' ? 'text-blue-500' : log.type === 'WhatsApp' ? 'text-green-500' : 'text-primary'
                      }`}>{log.type === 'SMS' ? 'sms' : log.type === 'WhatsApp' ? 'chat' : 'mail'}</span>
                      <span className="text-xs font-black text-neutral-text">{log.type}</span>
                   </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-neutral-text">{log.subject}</td>
                <td className="px-8 py-5 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                    log.status === 'Delivered' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                    log.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right text-xs font-bold text-neutral-text">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {MOCK_TEMPLATES.map((tmpl) => (
        <div key={tmpl.id} className="bg-white p-8 rounded-[2.5rem] border border-neutral-light hover:border-primary/30 transition-all group flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-6">
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-widest">{tmpl.category}</span>
                 <button className="text-neutral-text opacity-30 hover:opacity-100"><span className="material-symbols-outlined">edit</span></button>
              </div>
              <h4 className="text-xl font-black text-dark-text mb-4">{tmpl.name}</h4>
              <p className="text-sm text-neutral-text leading-relaxed font-medium bg-neutral-light/20 p-4 rounded-2xl border border-dashed border-neutral-light italic">
                "{tmpl.content}"
              </p>
           </div>
           <button className="mt-8 w-full py-4 text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">copy_all</span> Duplicate Template
           </button>
        </div>
      ))}
      <button className="bg-white border-2 border-dashed border-neutral-light rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 text-neutral-text hover:border-primary hover:text-primary transition-all">
         <span className="material-symbols-outlined text-4xl">add_circle</span>
         <span className="text-sm font-black uppercase tracking-widest">New Template</span>
      </button>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-dark-text tracking-tight">Messaging Center</h2>
          <p className="text-sm text-neutral-text font-medium">Control the SMS, Email, and WhatsApp notification ecosystem.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-neutral-light flex flex-col">
             <span className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Monthly Quota</span>
             <span className="text-lg font-black text-primary">84% Used</span>
          </div>
          <button 
            onClick={handleSendTest}
            disabled={isSendingTest}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${
              testSuccess ? 'bg-accent-green text-dark-text shadow-accent-green/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105'
            }`}
          >
            {isSendingTest ? (
               <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : testSuccess ? (
               <span className="material-symbols-outlined text-sm">check_circle</span>
            ) : (
               <span className="material-symbols-outlined text-sm">send</span>
            )}
            {isSendingTest ? 'Firing Test...' : testSuccess ? 'Message Dispatched' : 'Send Test Broadcast'}
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { l: 'Total Dispatched', v: '14,205', i: 'outbox', c: 'text-primary', bg: 'bg-primary/10' },
           { l: 'Delivery Rate', v: '98.2%', i: 'task_alt', c: 'text-accent-green', bg: 'bg-accent-green/10' },
           { l: 'Failed Count', v: '12', i: 'error', c: 'text-red-500', bg: 'bg-red-50' },
           { l: 'Avg Cost/Msg', v: '$0.02', i: 'monetization_on', c: 'text-blue-500', bg: 'bg-blue-100' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-neutral-light flex items-center gap-4 shadow-sm">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.c}`}>
                 <span className="material-symbols-outlined">{stat.i}</span>
              </div>
              <div>
                 <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">{stat.l}</p>
                 <h4 className="text-xl font-black text-dark-text">{stat.v}</h4>
              </div>
           </div>
         ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-neutral-light pb-px">
        {[
          { id: 'logs', label: 'Message History', icon: 'history' },
          { id: 'templates', label: 'Content Templates', icon: 'description' },
          { id: 'config', label: 'Gateway Config', icon: 'settings_ethernet' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id 
                ? 'text-primary' 
                : 'text-neutral-text hover:text-dark-text'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      <div className="mt-8 pb-12">
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'config' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
             <div className="bg-white p-10 rounded-[3rem] border border-neutral-light space-y-8">
                <div className="flex items-center gap-4 border-b border-neutral-light pb-4">
                   <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">sms</span></div>
                   <h4 className="text-lg font-black">SMS Provider (Twilio)</h4>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-text">Account SID</label>
                      <input type="password" value="AC8821*****************" className="w-full bg-neutral-light/20 border-none rounded-xl p-3 text-sm font-mono" readOnly />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-text">Auth Token</label>
                      <input type="password" value="*********" className="w-full bg-neutral-light/20 border-none rounded-xl p-3 text-sm font-mono" readOnly />
                   </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                   <span className="text-[10px] font-black text-accent-green uppercase">Service Online</span>
                   <button className="text-primary text-[10px] font-black uppercase hover:underline">Update Credentials</button>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[3rem] border border-neutral-light space-y-8">
                <div className="flex items-center gap-4 border-b border-neutral-light pb-4">
                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">mail</span></div>
                   <h4 className="text-lg font-black">Email Provider (SendGrid)</h4>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-text">API Key</label>
                      <input type="password" value="SG.vV*****************" className="w-full bg-neutral-light/20 border-none rounded-xl p-3 text-sm font-mono" readOnly />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-text">Verified Sender</label>
                      <input type="text" value="noreply@esebills.com" className="w-full bg-neutral-light/20 border-none rounded-xl p-3 text-sm font-bold" readOnly />
                   </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                   <span className="text-[10px] font-black text-accent-green uppercase">Service Online</span>
                   <button className="text-primary text-[10px] font-black uppercase hover:underline">Update Credentials</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
