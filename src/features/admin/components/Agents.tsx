
import React, { useState } from 'react';
import { MOCK_AGENTS } from '../data/constants';
import { Agent } from '../data/types';
import { DataTable, type TableColumn } from '../../../components/ui/DataTable';

const Agents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agents] = useState<Agent[]>(MOCK_AGENTS);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.includes(searchTerm)
  );

  const columns: TableColumn<Agent>[] = [
    {
      key: 'partner',
      header: 'Agent Partner',
      render: (agent) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xs">
            {agent.initials}
          </div>
          <div>
            <p className="text-sm font-black text-dark-text dark:text-gray-200">{agent.name}</p>
            <p className="text-[10px] text-neutral-text font-bold uppercase tracking-tight">{agent.shopName} &bull; {agent.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (agent) => (
        <span className="text-xs font-bold text-neutral-text">{agent.location}</span>
      ),
    },
    {
      key: 'float',
      header: 'Float Balance',
      align: 'right',
      render: (agent) => (
        <p className={`text-sm font-black ${agent.floatBalance < 50 ? 'text-red-500' : 'text-dark-text dark:text-white'}`}>
          ${agent.floatBalance.toFixed(2)}
        </p>
      ),
    },
    {
      key: 'commission',
      header: 'Total Comm.',
      align: 'right',
      render: (agent) => (
        <p className="text-sm font-black text-accent-green">${agent.totalEarnings.toFixed(2)}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (agent) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
          agent.status === 'Active' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
          agent.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
          'bg-red-50 text-red-600 border-red-100'
        }`}>
          {agent.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-neutral-text transition-all" title="Manage Float">
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-xl text-neutral-text transition-all" title="Edit Agent">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-neutral-light dark:hover:bg-white/10 rounded-xl text-neutral-text transition-all">
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Agents Administration</h2>
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
          <div key={i} className="bg-white  p-8 rounded-[2rem] border border-neutral-light dark:border-white/5 flex items-center gap-5 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-dark-text dark:text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white  p-4 rounded-[2rem] border border-neutral-light dark:border-white/5 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input
            type="text"
            placeholder="Search agents by name, ID or shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8fafc] dark:bg-white/5 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-dark-text dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-4 bg-[#f8fafc] dark:bg-white/5 text-neutral-text rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Status
          </button>
          <button className="p-4 bg-[#f8fafc] dark:bg-white/5 text-neutral-text rounded-2xl hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredAgents}
        rowKey={(a) => a.id}
        emptyMessage="No agents found"
        emptyIcon="storefront"
      />

      {/* Footer info */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">
          Showing {filteredAgents.length} out of {agents.length} onboarded agents
        </p>
        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download Registry CSV</button>
      </div>
    </div>
  );
};

export default Agents;
