import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { getPayments } from '../../../services/payments.service';
import type { PaymentTransaction } from '../../../types';
import { NotificationsPage } from '../../../pages/NotificationsPage';
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout';

export function CustomerDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();

  const activeTab = urlTab || searchParams.get('tab') || 'overview';

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageable, setPageable] = useState<PageableState>({
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const columns: CRUDColumn<PaymentTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (tx) => {
        const date = tx.dateTimeOfTransaction
          ? new Date(tx.dateTimeOfTransaction).toLocaleDateString()
          : '—';
        return <span className="font-semibold text-slate-900 dark:text-slate-100">{date}</span>;
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (tx) => {
        const ref = tx.productReferenceNumber ?? tx.pesepayReferenceNumber ?? String(tx.id);
        return <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{ref}</span>;
      },
    },
    {
      key: 'service',
      header: 'Service',
      render: (tx) => <span className="text-slate-600 dark:text-slate-300">{tx.productName ?? '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (tx) => <span className="font-bold text-slate-900 dark:text-slate-100">${(Number(tx.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (tx) => {
        const status = tx.paymentStatus ?? '—';
        const statusLower = String(status).toLowerCase();
        const isSuccess = statusLower.includes('success') || statusLower.includes('paid');
        const isPending = statusLower.includes('pending');
        
        return (
          <span className={ `px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isSuccess
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
              : isPending
              ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50'
              : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
          }`}>
            {status}
          </span>
        );
      },
    },
  ];

  const fetchTransactions = (page = 1, size = 10) => {
    setLoading(true);
    getPayments({ page: page - 1, size })
      .then((data) => {
        setTransactions(data.content ?? []);
        setPageable({
          page: (data.number ?? 0) + 1,
          size: data.size ?? size,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
        });
      })
      .catch(() => { 
        setTransactions([]); 
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions(pageable.page, pageable.size);
    }
  }, [activeTab]);

  if (activeTab === 'profile') {
    return (
      <div>
        <UserProfile />
      </div>
    );
  }

  if (activeTab === 'transactions') {
    return (
      <div className="space-y-6">
        <CRUDLayout
          title="My Transactions"
          columns={columns}
          data={transactions}
          loading={loading}
          pageable={pageable}
          onPageChange={(page) => fetchTransactions(page, pageable.size)}
          onSizeChange={(size) => fetchTransactions(1, size)}
          onRefresh={() => fetchTransactions(pageable.page, pageable.size)}
        />
      </div>
    );
  }

  if (activeTab === 'notifications') {
    return <NotificationsPage />;
  }

  return (
    <div>
      <div className="glass-card p-10 border-slate-200 dark:border-slate-800">
        <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-500 font-bold">Customer Portal</p>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Welcome to your Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-lg leading-relaxed">
          Manage your payments, track your transaction history, and keep your profile up to date all in one place.
        </p>
      </div>
    </div>
  );
}
