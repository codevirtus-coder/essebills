import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Loader2, ShieldCheck, ArrowLeft, Home, Receipt } from "lucide-react";
import { getPaymentStatus } from "../../../services/payments.service";
import type { PaymentTransaction } from "../../../types/transactions";
import esebillsLogo from "../../../assets/esebills_logo.png";
import { ROUTE_PATHS } from "../../../router/paths";

type Phase = "polling" | "success" | "failed" | "timeout";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 80; // ~4 minutes

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");

  const [phase, setPhase] = useState<Phase>("polling");
  const [tx, setTx] = useState<PaymentTransaction | null>(null);
  const pollCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!transactionId) {
      setPhase("failed");
      return;
    }

    const poll = async () => {
      pollCount.current += 1;
      try {
        const data = await getPaymentStatus(transactionId);
        setTx(data);

        const status = data.paymentStatus;
        const fulfilled = data.valueAvailabilityStatus === "VALUE_USED";

        if (status === "SUCCESS" && fulfilled) {
          stopPolling();
          setPhase("success");
          return;
        }

        if (status === "SUCCESS" && !fulfilled) {
          // Paid but delivery still pending — keep polling briefly
        }

        // Terminal failure statuses
        const terminal = ["FAILED", "CANCELLED", "ERROR", "REVERSED"].includes(status ?? "");
        if (terminal) {
          stopPolling();
          setPhase("failed");
          return;
        }
      } catch {
        // swallow — keep polling
      }

      if (pollCount.current >= MAX_POLLS) {
        stopPolling();
        setPhase("timeout");
      }
    };

    // Poll immediately then on interval
    void poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 sm:px-10 border-b border-slate-200 bg-slate-900 text-white">
        <Link to={ROUTE_PATHS.home}>
          <img src={esebillsLogo} alt="EseBills" className="h-12 w-auto brightness-0 invert" />
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          <ShieldCheck size={16} />
          Secure Payment
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* ── Polling ── */}
          {phase === "polling" && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Loader2 size={36} className="text-emerald-600 animate-spin" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checking Payment</h1>
                <p className="text-slate-500 text-sm mt-2">
                  We're confirming your payment and delivering your product. This may take a moment.
                </p>
              </div>
              {tx && (
                <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-2 border border-slate-100">
                  <TxRow label="Status" value={<StatusBadge status={tx.paymentStatus} />} />
                  {tx.productName && <TxRow label="Product" value={tx.productName} />}
                  {(tx.totalAmount ?? tx.amount) != null && tx.currencyCode && (
                    <TxRow label="Amount" value={`${tx.currencyCode} ${Number(tx.totalAmount ?? tx.amount).toFixed(2)}`} />
                  )}
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Clock size={12} />
                Checking every 3 seconds…
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {phase === "success" && (
            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-200/30 p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={44} className="text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful</h1>
                <p className="text-slate-500 text-sm mt-2">
                  Your payment has been confirmed and your product has been delivered.
                </p>
              </div>
              {tx && (
                <div className="bg-emerald-50/60 rounded-2xl p-5 text-left space-y-2 border border-emerald-100">
                  {tx.productName && <TxRow label="Product" value={tx.productName} />}
                  {(tx.totalAmount ?? tx.amount) != null && tx.currencyCode && (
                    <TxRow label="Amount Paid" value={`${tx.currencyCode} ${Number(tx.totalAmount ?? tx.amount).toFixed(2)}`} />
                  )}
                  {tx.productReferenceNumber && (
                    <TxRow label="Reference" value={<span className="font-mono text-xs">{tx.productReferenceNumber}</span>} />
                  )}
                  {tx.pesepayReferenceNumber && (
                    <TxRow label="Pesepay Ref" value={<span className="font-mono text-xs">{tx.pesepayReferenceNumber}</span>} />
                  )}
                  {(tx as any).token && (
                    <TxRow label="Token" value={<span className="font-mono text-base font-black text-emerald-700">{(tx as any).token}</span>} />
                  )}
                </div>
              )}
              {tx?.productPaymentNotificationSms && (
                <p className="text-xs text-slate-400">A confirmation SMS has been sent to your phone.</p>
              )}
              <div className="flex gap-3">
                <Link
                  to={ROUTE_PATHS.home}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                >
                  <Home size={16} />
                  Home
                </Link>
                <Link
                  to={ROUTE_PATHS.checkout}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 text-sm font-black uppercase tracking-widest hover:border-slate-400 transition-all"
                >
                  <Receipt size={16} />
                  Pay Another
                </Link>
              </div>
            </div>
          )}

          {/* ── Failed ── */}
          {(phase === "failed" || phase === "timeout") && (
            <div className="bg-white rounded-[2rem] border border-rose-100 shadow-xl shadow-rose-200/20 p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
                  <XCircle size={44} className="text-rose-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {phase === "timeout" ? "Still Processing" : "Payment Unsuccessful"}
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  {phase === "timeout"
                    ? "We couldn't confirm your payment in time. If you were charged, check your transaction history or contact support."
                    : tx?.pesepayTransactionStatusDescription
                      ? tx.pesepayTransactionStatusDescription
                      : "Your payment could not be completed. No funds have been deducted."}
                </p>
              </div>
              {tx && (
                <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-2 border border-slate-100">
                  <TxRow label="Status" value={<StatusBadge status={tx.paymentStatus} />} />
                  {tx.productName && <TxRow label="Product" value={tx.productName} />}
                  {tx.pesepayReferenceNumber && (
                    <TxRow label="Reference" value={<span className="font-mono text-xs">{tx.pesepayReferenceNumber}</span>} />
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <Link
                  to={ROUTE_PATHS.home}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 text-sm font-black uppercase tracking-widest hover:border-slate-400 transition-all"
                >
                  <ArrowLeft size={16} />
                  Home
                </Link>
                <Link
                  to={ROUTE_PATHS.checkout}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}

          {/* No transactionId */}
          {!transactionId && phase === "failed" && (
            <div className="mt-4 text-center text-xs text-slate-400">
              No transaction ID found in the URL. Return to{" "}
              <Link to={ROUTE_PATHS.home} className="underline text-slate-600">home</Link>.
            </div>
          )}
        </div>
      </div>

      <footer className="py-4 text-center text-[10px] text-slate-400 font-medium">
        © {new Date().getFullYear()} EseBills Payment Platform · All transactions are encrypted and secure.
      </footer>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function TxRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-sm font-bold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "UNKNOWN";
  const styles: Record<string, string> = {
    SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    FAILED: "bg-rose-50 text-rose-700 border-rose-100",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const cls = styles[s] ?? "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cls}`}>
      {s}
    </span>
  );
}

export default PaymentReturnPage;
