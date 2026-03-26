import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { getPaymentStatus } from "../../../services/payments.service";
import type { PaymentTransaction } from "../../../types/transactions";

interface PaymentStatusModalProps {
  transactionId: number;
  paymentMethod: "pesepay" | "ecocash_seamless" | "wallet";
  billerName: string;
  amount: number;
  currencyCode: string;
  onSuccess: (tx: PaymentTransaction) => void;
  onFailure: (tx: PaymentTransaction) => void;
  onClose: () => void;
}

type Phase =
  | "waiting_approval"   // PROCESSING — customer hasn't approved yet
  | "payment_confirmed"  // SUCCESS but product not yet delivered
  | "fulfilled"          // SUCCESS + VALUE_USED
  | "failed";            // FAILED / CANCELLED / CLOSED

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 60; // 3 min timeout

function derivePhase(tx: PaymentTransaction): Phase {
  const status = tx.paymentStatus;
  const availability = tx.valueAvailabilityStatus;

  if (status === "SUCCESS") {
    return availability === "VALUE_USED" ? "fulfilled" : "payment_confirmed";
  }
  if (status === "PROCESSING" || status === "PENDING" || status === "INITIATED") {
    return "waiting_approval";
  }
  return "failed";
}

export default function PaymentStatusModal({
  transactionId,
  paymentMethod,
  billerName,
  amount,
  currencyCode,
  onSuccess,
  onFailure,
  onClose,
}: PaymentStatusModalProps) {
  const [phase, setPhase] = useState<Phase>("waiting_approval");
  const [tx, setTx] = useState<PaymentTransaction | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const poll = async () => {
      try {
        const latest = await getPaymentStatus(transactionId);
        setTx(latest);
        const newPhase = derivePhase(latest);
        setPhase(newPhase);

        if (newPhase === "fulfilled") {
          stopPolling();
          setTimeout(() => onSuccess(latest), 1500);
        } else if (newPhase === "failed") {
          stopPolling();
          setTimeout(() => onFailure(latest), 1500);
        }
      } catch {
        // network error — keep polling
      }

      setPollCount((c) => {
        const next = c + 1;
        if (next >= MAX_POLLS) {
          stopPolling();
          setPhase("failed");
        }
        return next;
      });
    };

    // immediate first poll, then interval
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return stopPolling;
  }, [transactionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEcoCash = paymentMethod === "ecocash_seamless";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          {phase === "waiting_approval" && (
            <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center">
              {isEcoCash ? (
                <Smartphone size={36} className="text-amber-500 animate-pulse" />
              ) : (
                <Loader2 size={36} className="text-amber-500 animate-spin" />
              )}
            </div>
          )}
          {phase === "payment_confirmed" && (
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
              <Loader2 size={36} className="text-emerald-500 animate-spin" />
            </div>
          )}
          {phase === "fulfilled" && (
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
          )}
          {phase === "failed" && (
            <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-rose-200 flex items-center justify-center">
              <XCircle size={36} className="text-rose-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          {phase === "waiting_approval" && (
            <>
              <h2 className="text-xl font-black text-slate-900">
                {isEcoCash ? "Approve on Your Phone" : "Processing Payment"}
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {isEcoCash
                  ? "A payment request has been sent to your EcoCash. Open your EcoCash app or dial *151# and approve the payment."
                  : "Your payment is being processed. Please wait…"}
              </p>
            </>
          )}
          {phase === "payment_confirmed" && (
            <>
              <h2 className="text-xl font-black text-slate-900">Payment Confirmed!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Delivering your {billerName}…
              </p>
            </>
          )}
          {phase === "fulfilled" && (
            <>
              <h2 className="text-xl font-black text-emerald-700">All Done!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Your {billerName} of{" "}
                <span className="font-black text-slate-900">
                  {currencyCode} {amount.toFixed(2)}
                </span>{" "}
                has been delivered successfully.
              </p>
            </>
          )}
          {phase === "failed" && (
            <>
              <h2 className="text-xl font-black text-rose-600">Payment Failed</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {tx?.pesepayTransactionStatusDescription
                  ? tx.pesepayTransactionStatusDescription
                  : pollCount >= MAX_POLLS
                  ? "The payment timed out. Please try again."
                  : "The payment could not be completed. Please try again."}
              </p>
            </>
          )}
        </div>

        {/* Progress dots while waiting */}
        {(phase === "waiting_approval" || phase === "payment_confirmed") && (
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        {/* EcoCash tip */}
        {phase === "waiting_approval" && isEcoCash && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 font-medium">
              Tip: Dial <strong>*151*2*5#</strong> or open the EcoCash app → Approvals to find pending requests.
            </p>
          </div>
        )}

        {/* Amount summary */}
        <div className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
          <p className="text-2xl font-black text-slate-900">
            {currencyCode} {amount.toFixed(2)}
          </p>
        </div>

        {/* Close button — only shown on terminal states */}
        {(phase === "failed") && (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-slate-700 transition-all"
          >
            Try Again
          </button>
        )}

        {phase === "waiting_approval" && (
          <button
            onClick={() => { stopPolling(); onClose(); }}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            Cancel payment
          </button>
        )}
      </div>
    </div>
  );
}
