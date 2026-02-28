import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { getPayments } from '../../../services/payments.service';
import type { PaymentTransaction } from '../../../types';
import { DataTable, type TableColumn } from '../../../components/ui';

export function CustomerDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();

  const activeTab = urlTab || searchParams.get('tab') || 'overview';

  // Transactions state — null = not yet fetched
  const [transactions, setTransactions] = useState<PaymentTransaction[] | null>(null);

  const columns: TableColumn<PaymentTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (tx) => {
        const date = tx.dateTimeOfTransaction
          ? new Date(tx.dateTimeOfTransaction).toLocaleDateString()
          : '—';
        return <span className="text-sm font-bold text-dark-text">{date}</span>;
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (tx) => {
        const ref = tx.productReferenceNumber ?? tx.pesepayReferenceNumber ?? String(tx.id);
        return <span className="text-xs font-mono text-neutral-text">{ref}</span>;
      },
    },
    {
      key: 'service',
      header: 'Service',
      render: (tx) => <span className="text-sm text-neutral-text">{tx.productName ?? '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (tx) => <span className="font-black text-dark-text">${(Number(tx.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (tx) => {
        const status = tx.paymentStatus ?? '—';
        const isSuccess = String(status).toLowerCase().includes('success') || String(status).toLowerCase().includes('paid');
        const isPending = String(status).toLowerCase().includes('pending');
        return (
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            isSuccess
              ? 'bg-accent-green/10 text-accent-green'
              : isPending
              ? 'bg-yellow-50 text-yellow-600'
              : 'bg-red-50 text-red-500'
          }`}>
            {status}
          </span>
        );
      },
    },
  ];

  useEffect(() => {
    if (activeTab !== 'transactions' || transactions !== null) return;
    let mounted = true;
    getPayments({ size: 50 })
      .then((data) => {
        if (mounted) setTransactions(data.content ?? []);
      })
      .catch(() => { if (mounted) setTransactions([]); });
    return () => { mounted = false; };
  }, [activeTab, transactions]);

  if (activeTab === 'profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <UserProfile />
      </div>
    );
  }

  if (activeTab === 'transactions') {
    return (
      <div className="p-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-light overflow-hidden">
          <div className="p-8 border-b border-neutral-light flex items-center justify-between bg-[#f8fafc]">
            <div>
              <h3 className="text-xl font-black text-dark-text tracking-tight">My Transactions</h3>
              <p className="text-[10px] font-bold text-neutral-text uppercase tracking-widest mt-1">Payment history</p>
            </div>
          </div>
          {transactions === null ? (
            <div className="p-12 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined animate-spin text-neutral-text">sync</span>
              <span className="text-xs font-bold text-neutral-text uppercase tracking-widest">Loading transactions...</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              rowKey={(tx) => tx.id ?? Math.random()}
              loading={transactions === null}
              emptyMessage="No transactions found"
              emptyIcon="receipt_long"
              header={
                <div className="px-8 py-6">
                  <h3 className="text-xl font-black text-dark-text tracking-tight">My Transactions</h3>
                  <p className="text-[10px] font-bold text-neutral-text uppercase tracking-widest mt-1">Payment history</p>
                </div>
              }
            />
          )}
        </div>
      </div>
    );
  }

  // Default: overview/dashboard content
  return (
    <div className="p-8">
      <div className="bg-white border border-neutral-light rounded-3xl shadow-sm p-10">
        <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">Customer Portal</p>
        <h2 className="text-2xl font-extrabold text-dark-text mt-2">Dashboard Coming Soon</h2>
        <p className="text-sm text-neutral-text mt-3">This space is ready for your customer dashboard content.</p>
      </div>
    </div>
  );
}
