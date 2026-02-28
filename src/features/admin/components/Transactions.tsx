
import React, { useState, useMemo } from 'react';
import { MOCK_TRANSACTIONS } from '../data/constants';
import { TransactionStatus, Transaction } from '../data/types';
import { DataTable, TableColumn } from '../../../components/ui/DataTable';

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

  const columns: TableColumn<Transaction>[] = useMemo(() => [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (tx) => <span className="text-xs font-mono font-bold text-primary">#EB-{tx.id.padStart(6, '0')}</span>,
    },
    {
      key: 'datetime',
      header: 'Date & Time',
      render: (tx) => (
        <>
          <p className="text-sm font-bold text-dark-text dark:text-gray-200">{tx.date}</p>
          <p className="text-[10px] text-neutral-text uppercase tracking-tighter">{tx.time}</p>
        </>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (tx) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-inner ${
            tx.status === TransactionStatus.SUCCESS ? 'bg-primary/10 text-primary' :
            tx.status === TransactionStatus.PENDING ? 'bg-yellow-50 text-yellow-600' :
            'bg-red-50 text-red-600'
          }`}>
            {tx.customerInitials}
          </div>
          <p className="text-sm font-bold text-dark-text dark:text-gray-200">{tx.customerName}</p>
        </div>
      ),
    },
    {
      key: 'biller',
      header: 'Biller',
      render: (tx) => <span className="text-xs font-bold text-neutral-text">{tx.biller}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (tx) => <p className="text-sm font-black text-dark-text dark:text-white">${tx.amount.toFixed(2)}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (tx) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border ${
          tx.status === TransactionStatus.SUCCESS ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
          tx.status === TransactionStatus.PENDING ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
          'bg-red-50 text-red-600 border-red-100'
        } uppercase tracking-tighter`}>
          {tx.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (tx) => (
        <div className="flex items-center justify-end gap-2">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg text-neutral-text transition-colors">
            <span className="material-symbols-outlined text-lg">receipt_long</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg text-neutral-text transition-colors">
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Transactions History</h2>
          <p className="text-sm text-neutral-text">Monitor and manage all customer payments across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white  border border-neutral-light dark:border-white/5 rounded-xl text-sm font-bold text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 transition-all">
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
        <div className="bg-white  p-6 rounded-3xl border border-neutral-light dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-green/10 text-accent-green rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Successful</p>
            <h4 className="text-xl font-extrabold text-dark-text dark:text-white">94.2%</h4>
          </div>
        </div>
        <div className="bg-white  p-6 rounded-3xl border border-neutral-light dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">pending</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Processing</p>
            <h4 className="text-xl font-extrabold text-dark-text dark:text-white">124</h4>
          </div>
        </div>
        <div className="bg-white  p-6 rounded-3xl border border-neutral-light dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined">error</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Failures</p>
            <h4 className="text-xl font-extrabold text-dark-text dark:text-white">2.8%</h4>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white  p-4 rounded-3xl border border-neutral-light dark:border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search by customer, biller or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text dark:text-white"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-40 bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl py-3 px-4 text-sm font-bold text-neutral-text focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Status</option>
            <option value={TransactionStatus.SUCCESS}>Successful</option>
            <option value={TransactionStatus.PENDING}>Pending</option>
            <option value={TransactionStatus.FAILED}>Failed</option>
          </select>
          <button className="p-3 bg-neutral-light/30 dark:bg-white/5 text-neutral-text rounded-xl hover:bg-neutral-light/50 transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTransactions}
        rowKey={(r) => r.id}
        emptyMessage="No transactions found matching your filters."
        className="rounded-3xl"
      />

      {/* Pagination */}
      <div className="p-8 border-t border-neutral-light dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-light/5">
        <p className="text-xs text-neutral-text font-bold">
          Showing <span className="text-dark-text dark:text-white">{filteredTransactions.length}</span> of 12,450 results
        </p>
        <div className="flex items-center gap-1">
          <button className="p-2 text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg disabled:opacity-30" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[1, 2, 3, '...', 45].map((page, i) => (
            <button 
              key={i} 
              className={`w-9 h-9 text-xs font-black rounded-lg transition-all ${
                page === 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

