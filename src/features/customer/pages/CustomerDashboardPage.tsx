import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { getPayments } from '../../../services/payments.service';
import type { PaymentTransaction } from '../../../types';

export function CustomerDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();

  const activeTab = urlTab || searchParams.get('tab') || 'overview';

  // Transactions state — null = not yet fetched
  const [transactions, setTransactions] = useState<PaymentTransaction[] | null>(null);

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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-light/10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Reference</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Service</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-xs font-bold text-neutral-text uppercase tracking-widest">
                      No transactions found
                    </td>
                  </tr>
                ) : transactions.map((tx) => {
                  const date = tx.dateTimeOfTransaction
                    ? new Date(tx.dateTimeOfTransaction).toLocaleDateString()
                    : '—';
                  const ref = tx.productReferenceNumber ?? tx.pesepayReferenceNumber ?? String(tx.id);
                  const status = tx.paymentStatus ?? '—';
                  const isSuccess = String(status).toLowerCase().includes('success') || String(status).toLowerCase().includes('paid');
                  const isPending = String(status).toLowerCase().includes('pending');
                  return (
                    <tr key={tx.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-dark-text">{date}</td>
                      <td className="px-8 py-5 text-xs font-mono text-neutral-text">{ref}</td>
                      <td className="px-8 py-5 text-sm text-neutral-text">{tx.productName ?? '—'}</td>
                      <td className="px-8 py-5 text-right font-black text-dark-text">${(Number(tx.amount) || 0).toFixed(2)}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          isSuccess
                            ? 'bg-accent-green/10 text-accent-green'
                            : isPending
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
