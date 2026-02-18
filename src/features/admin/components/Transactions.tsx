
import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../data/constants';
import { TransactionStatus, Transaction } from '../data/types';

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => {
    const matchesSearch = 
      tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.biller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text">Transactions History</h2>
          <p className="text-sm text-neutral-text">Monitor and manage all customer payments across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-light rounded-xl text-sm font-bold text-neutral-text hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Transaction Summary Mini-Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-light flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-green/10 text-accent-green rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Successful</p>
            <h4 className="text-xl font-extrabold text-dark-text">94.2%</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-light flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">pending</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Processing</p>
            <h4 className="text-xl font-extrabold text-dark-text">124</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-light flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">error</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Failures</p>
            <h4 className="text-xl font-extrabold text-dark-text">2.8%</h4>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-light flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search by customer, biller or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-light/30 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-40 bg-neutral-light/30 border-none rounded-xl py-3 px-4 text-sm font-bold text-neutral-text focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Status</option>
            <option value={TransactionStatus.SUCCESS}>Successful</option>
            <option value={TransactionStatus.PENDING}>Pending</option>
            <option value={TransactionStatus.FAILED}>Failed</option>
          </select>
          <button className="p-3 bg-neutral-light/30 text-neutral-text rounded-xl hover:bg-neutral-light/50 transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20 border-b border-neutral-light">
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Biller</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-light/10 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono font-bold text-primary">#EB-{tx.id.padStart(6, '0')}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-dark-text">{tx.date}</p>
                    <p className="text-[10px] text-neutral-text uppercase tracking-tighter">{tx.time}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-inner ${
                        tx.status === TransactionStatus.SUCCESS ? 'bg-primary/10 text-primary' : 
                        tx.status === TransactionStatus.PENDING ? 'bg-yellow-50 text-yellow-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        {tx.customerInitials}
                      </div>
                      <p className="text-sm font-bold text-dark-text">{tx.customerName}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-neutral-text">{tx.biller}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-sm font-black text-dark-text">${tx.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border ${
                      tx.status === TransactionStatus.SUCCESS ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                      tx.status === TransactionStatus.PENDING ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    } uppercase tracking-tighter`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-light rounded-lg text-neutral-text transition-colors">
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-light rounded-lg text-neutral-text transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <span className="material-symbols-outlined text-5xl text-neutral-text">search_off</span>
                      <p className="text-sm font-bold text-neutral-text">No transactions found matching your filters.</p>
                      <button 
                        onClick={() => {setSearchTerm(''); setStatusFilter('ALL');}}
                        className="text-xs text-primary font-black uppercase tracking-widest hover:underline"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-8 border-t border-neutral-light flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-light/5">
          <p className="text-xs text-neutral-text font-bold">
            Showing <span className="text-dark-text">{filteredTransactions.length}</span> of 12,450 results
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-neutral-text hover:bg-neutral-light rounded-lg disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {[1, 2, 3, '...', 45].map((page, i) => (
              <button 
                key={i} 
                className={`w-9 h-9 text-xs font-black rounded-lg transition-all ${
                  page === 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-neutral-text hover:bg-neutral-light'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 text-neutral-text hover:bg-neutral-light rounded-lg">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
