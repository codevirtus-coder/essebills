
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import { MOCK_STATS, MOCK_TRANSACTIONS, BILLER_PERFORMANCE, REVENUE_DATA, MOCK_AGENTS } from '../data/constants';
import { TransactionStatus } from '../data/types';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue"
          value={`$${MOCK_STATS.totalRevenue.toLocaleString()}.00`}
          change={MOCK_STATS.revenueChange}
          icon="payments"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#7e56c2"
        />
        <StatCard 
          label="Total Transactions"
          value={MOCK_STATS.totalTransactions.toLocaleString()}
          change={MOCK_STATS.transactionsChange}
          icon="sync_alt"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          chartPath="M0 20 Q 25 25, 50 10 T 100 5"
          strokeColor="#7e56c2"
        />
        <StatCard 
          label="Active Users"
          value={MOCK_STATS.activeUsers.toLocaleString()}
          change={MOCK_STATS.usersChange}
          icon="person_check"
          iconBg="bg-accent-green/10"
          iconColor="text-accent-green"
          chartPath="M0 25 L 20 15 L 40 22 L 60 8 L 80 12 L 100 2"
          strokeColor="#a3e635"
        />
        <StatCard 
          label="Agent Earnings"
          value={`$${MOCK_AGENTS.reduce((acc, curr) => acc + curr.totalEarnings, 0).toLocaleString()}`}
          change="+8.4% vs ytd"
          icon="storefront"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          chartPath="M0 15 Q 50 5, 100 25"
          strokeColor="#7e56c2"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0 bg-white  p-8 rounded-3xl shadow-sm border border-neutral-light dark:border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-dark-text dark:text-white">Revenue Pulse</h4>
              <p className="text-xs font-bold text-neutral-text uppercase tracking-widest mt-1">Global performance metrics</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-neutral-light/50 dark:bg-white/5 p-2 rounded-xl text-neutral-text hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
              </button>
              <select className="bg-neutral-light/50 dark:bg-white/5 border-none rounded-xl text-[10px] font-black uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary">
                <option>Last 6 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>
          {/* Fixed height container for Recharts to prevent width/height -1 error */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7e56c2" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7e56c2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eceaf1" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#6d5d89' }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#7e56c2" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Billers List */}
        <div className="bg-white  p-8 rounded-3xl shadow-sm border border-neutral-light dark:border-white/5 flex flex-col min-w-0">
          <h4 className="text-xl font-black text-dark-text dark:text-white mb-8">Top Billers</h4>
          <div className="space-y-6 flex-1">
            {BILLER_PERFORMANCE.map((biller) => (
              <div key={biller.name} className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-neutral-text uppercase tracking-tighter group-hover:text-primary transition-colors">{biller.name}</span>
                  <span className="text-xs font-black text-dark-text dark:text-white">${biller.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-neutral-light/50 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:bg-accent-green" 
                    style={{ width: `${biller.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full bg-neutral-light/30 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-primary hover:text-white transition-all">
            Full Biller Audit
          </button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white  rounded-[32px] shadow-sm border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="p-8 border-b border-neutral-light dark:border-white/5 flex items-center justify-between">
          <h4 className="text-xl font-black text-dark-text dark:text-white">Live Transactions</h4>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
               <span className="material-symbols-outlined text-sm">download</span>
               Export Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-neutral-light/20 dark:bg-white/5">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Transaction Time</th>
                <th className="px-8 py-5 text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Customer Account</th>
                <th className="px-8 py-5 text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Service Biller</th>
                <th className="px-8 py-5 text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Settled Amount</th>
                <th className="px-8 py-5 text-[9px] font-black text-neutral-text uppercase tracking-[0.2em]">Fulfillment Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-neutral-text uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light dark:divide-white/5">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-dark-text dark:text-gray-200">{tx.date}</p>
                    <p className="text-[10px] font-bold text-neutral-text uppercase tracking-tighter">{tx.time}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-[10px] font-black">
                        {tx.customerInitials}
                      </div>
                      <p className="text-sm font-bold text-dark-text dark:text-gray-300">{tx.customerName}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-neutral-text">{tx.biller}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-dark-text dark:text-white">${tx.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                      tx.status === TransactionStatus.SUCCESS ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                      tx.status === TransactionStatus.PENDING ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-xl transition-all text-neutral-text">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

