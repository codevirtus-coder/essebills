
import React, { useState } from 'react';
import { MOCK_AGENTS } from '../data/constants';
import { Agent } from '../data/types';

const Agents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agents] = useState<Agent[]>(MOCK_AGENTS);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    agent.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text">Agents Administration</h2>
          <p className="text-sm text-neutral-text">Manage retail partners, track float liquidity, and review agent earnings.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Onboard New Agent
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Shops', value: '428', icon: 'storefront', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Float', value: '$84,200', icon: 'account_balance_wallet', color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Unpaid Comm.', value: '$2,140', icon: 'payments', color: 'text-orange-500', bg: 'bg-orange-100' },
          { label: 'Avg Earnings', value: '$124.50', icon: 'analytics', color: 'text-blue-500', bg: 'bg-blue-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-neutral-light flex items-center gap-5 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-dark-text">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-neutral-light flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search agents by name, ID or shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8fafc] border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-dark-text"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-4 bg-[#f8fafc] text-neutral-text rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Status
          </button>
          <button className="p-4 bg-[#f8fafc] text-neutral-text rounded-2xl hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20 border-b border-neutral-light">
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Agent Partner</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Location</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Float Balance</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Total Comm.</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="group hover:bg-neutral-light/10 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xs">
                        {agent.initials}
                      </div>
                      <div>
                        <p className="text-sm font-black text-dark-text">{agent.name}</p>
                        <p className="text-[10px] text-neutral-text font-bold uppercase tracking-tight">{agent.shopName} &bull; {agent.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-bold text-neutral-text">{agent.location}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className={`text-sm font-black ${agent.floatBalance < 50 ? 'text-red-500' : 'text-dark-text'}`}>
                      ${agent.floatBalance.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className="text-sm font-black text-accent-green">${agent.totalEarnings.toFixed(2)}</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                      agent.status === 'Active' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                      agent.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-neutral-text transition-all" title="Manage Float">
                        <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-neutral-text transition-all" title="Edit Agent">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center hover:bg-neutral-light rounded-xl text-neutral-text transition-all">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-8 border-t border-neutral-light flex items-center justify-between bg-neutral-light/5">
           <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">
             Showing {filteredAgents.length} out of {agents.length} onboarded agents
           </p>
           <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download Registry CSV</button>
        </div>
      </div>
    </div>
  );
};

export default Agents;
