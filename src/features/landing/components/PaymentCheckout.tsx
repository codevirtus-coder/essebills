import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
  Verified
} from "lucide-react";
import type { ProductPreCheckResult } from "../../../services/products.service";
import esebillsLogo from "../../../assets/esebills_logo.png";
import { ROUTE_PATHS } from "../../../router/paths";
import type { ProductField } from "../../../types/products";

interface PaymentCheckoutProps {
  billerName: string;
  accountNumber: string;
  amount: string;
  categoryLabel?: string;
  currencyCode?: string;
  minimumAmount?: number;
  serviceChargeRate?: number;
  onBack: () => void;
  onConfirm: (method: PaymentOption, email: string, phone: string, requiredFields: Record<string, string>, amount: number) => void;
  isLoading?: boolean;
  embedded?: boolean;
  isAuthenticated?: boolean;
  walletBalance?: number;
  onLoginRequired?: () => void;
  productFields?: ProductField[];
  onPreCheck?: (requiredFields: Record<string, string>, amount?: number) => void;
  preCheckResult?: ProductPreCheckResult | null;
  isPreChecking?: boolean;
}

export type PaymentOption = "wallet" | "card" | "mobile_money" | "pesepay" | "ecocash_seamless";

/** Maps backend FieldType enum to HTML input type */
function fieldInputType(fieldType?: string): string {
  switch (fieldType) {
    case 'NUMBER':   return 'number';
    case 'DATE':     return 'date';
    case 'PASSWORD': return 'password';
    case 'EMAIL':    return 'email';
    case 'PHONE_NUMBER': return 'tel';
    default:         return 'text';
  }
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  billerName = "ZESA Prepaid",
  accountNumber: initialAccountNumber = "",
  amount = "0",
  categoryLabel,
  currencyCode = "USD",
  minimumAmount,
  serviceChargeRate = 0.01,
  onBack,
  onConfirm,
  isLoading = false,
  embedded = false,
  isAuthenticated = false,
  walletBalance,
  onLoginRequired,
  productFields = [],
  onPreCheck,
  preCheckResult,
  isPreChecking = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("pesepay");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amountInput, setAmountInput] = useState(
    parseFloat(amount) > 0 ? String(parseFloat(amount)) : ""
  );

  // Dynamic field values keyed by field.name (e.g. "meterNumber", "targetMobile", "accountNumber")
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // When productFields load, initialise state (and pre-fill first field from accountNumber prop if provided)
  useEffect(() => {
    if (productFields.length === 0) return;
    setFieldValues((prev) => {
      const next: Record<string, string> = {};
      productFields.forEach((f, idx) => {
        // Keep existing value if already entered; pre-fill first field from prop
        next[f.name!] = prev[f.name!] ?? (idx === 0 ? initialAccountNumber : '');
      });
      return next;
    });
  }, [productFields, initialAccountNumber]);

  // Fallback when no product fields are defined — generic account number field
  const showFallbackField = productFields.length === 0;
  const [fallbackAccount, setFallbackAccount] = useState(initialAccountNumber);

  // The full set of field values to pass to backend / pre-check
  const effectiveRequiredFields = useMemo<Record<string, string>>(() => {
    if (showFallbackField) {
      return fallbackAccount ? { accountNumber: fallbackAccount } : {};
    }
    return fieldValues;
  }, [showFallbackField, fallbackAccount, fieldValues]);

  const baseAmount = parseFloat(amountInput) || 0;
  const isWallet = paymentMethod === "wallet";
  const serviceFee = isWallet ? 0 : baseAmount * serviceChargeRate;
  const totalAmount = baseAmount + serviceFee;

  const walletInsufficient = isWallet && walletBalance !== undefined && walletBalance < totalAmount;

  const amountError = minimumAmount && baseAmount > 0 && baseAmount < minimumAmount
    ? `Minimum amount is ${currencyCode} ${minimumAmount.toFixed(2)}`
    : null;

  const preCheckFailed = preCheckResult != null && preCheckResult.supportsPreCheck && !preCheckResult.valid;

  // All required (non-optional) fields must have a non-empty value
  const requiredFieldsFilled = useMemo(() => {
    if (showFallbackField) return !!fallbackAccount.trim();
    const required = productFields.filter((f) => !f.optional);
    if (required.length === 0) return true; // no required fields (e.g. fuel)
    return required.every((f) => !!fieldValues[f.name!]?.trim());
  }, [showFallbackField, fallbackAccount, productFields, fieldValues]);

  const canPay = !!phone && requiredFieldsFilled && baseAmount > 0 && !amountError && !walletInsufficient && !preCheckFailed;

  // Trigger pre-check when the user leaves any field — pass all collected values
  const handleFieldBlur = useCallback(() => {
    if (!onPreCheck) return;
    const vals = effectiveRequiredFields;
    const hasAny = Object.values(vals).some((v) => v.trim());
    if (hasAny) {
      onPreCheck(vals, parseFloat(amountInput) || undefined);
    }
  }, [onPreCheck, effectiveRequiredFields, amountInput]);

  function handleSelectWallet() {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    setPaymentMethod("wallet");
  }

  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-[#f8fafc] pb-20'} font-sans text-slate-900 overflow-y-auto emerald-scrollbar`}>
      <style>{`
        .emerald-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #10B981 transparent;
        }
        .emerald-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .emerald-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .emerald-scrollbar::-webkit-scrollbar-thumb {
          background-color: #10B981;
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
      `}</style>
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      {!embedded && (
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 bg-slate-900 text-white sticky top-0 z-50">
          <Link to={ROUTE_PATHS.home} className="flex items-center">
            <img src={esebillsLogo} alt="EseBills" className="h-16 w-auto brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secured Payment</p>
              <p className="text-[10px] text-emerald-400 font-bold">SSL 256-BIT ENCRYPTED</p>
            </div>
            <ShieldCheck className="text-emerald-500 w-8 h-8" />
          </div>
        </header>
      )}

      <main className={`${embedded ? 'p-0' : 'max-w-5xl mx-auto pt-8 px-4 sm:px-6'}`}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {embedded ? 'Back to Marketplace' : 'Back to Bill Selection'}
        </button>

        <div className={`grid ${embedded ? 'grid-cols-1 lg:grid-cols-[1fr_350px]' : 'lg:grid-cols-[1fr_400px]'} gap-8 items-start`}>
          {/* ── Left Column: Details & Payment Methods ─────────────────────── */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white">
                      <Zap size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">{billerName}</h2>
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                          <Verified size={12} />
                          Verified
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Product Payment Gateway</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white">

                {/* ── Dynamic product fields ─────────────────────────────── */}
                {showFallbackField ? (
                  /* Fallback when no fields are defined for this product */
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Account / Meter Number <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fallbackAccount}
                        onChange={(e) => setFallbackAccount(e.target.value)}
                        onBlur={handleFieldBlur}
                        placeholder="Enter account or meter number"
                        className="w-full px-0 py-1 bg-transparent border-0 border-b border-slate-200 focus:outline-none focus:border-emerald-500 text-xl font-black tracking-tight text-slate-900 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                ) : (
                  /* Render each product field from backend definition */
                  productFields.map((field, idx) => (
                    <div key={field.name} className={productFields.length === 1 ? '' : 'sm:col-span-1'}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {field.displayName ?? field.name}
                        {!field.optional && <span className="text-emerald-600 ml-1">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={fieldInputType(field.fieldType)}
                          value={fieldValues[field.name!] ?? ''}
                          onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.name!]: e.target.value }))}
                          onBlur={idx === 0 ? handleFieldBlur : undefined}
                          placeholder={field.hint ?? `Enter ${field.displayName ?? field.name}`}
                          className="w-full px-0 py-1 bg-transparent border-0 border-b border-slate-200 focus:outline-none focus:border-emerald-500 text-xl font-black tracking-tight text-slate-900 transition-all placeholder:text-slate-300 pr-6"
                        />
                        {idx === 0 && isPreChecking && (
                          <Loader2 size={16} className="absolute right-0 top-2 text-slate-400 animate-spin" />
                        )}
                      </div>
                      {/* Pre-check feedback on the first field */}
                      {idx === 0 && preCheckResult?.supportsPreCheck && preCheckResult.valid && preCheckResult.accountNarrative && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          {preCheckResult.accountNarrative}
                        </p>
                      )}
                      {idx === 0 && preCheckResult?.supportsPreCheck && !preCheckResult.valid && preCheckResult.errorMessage && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                          <AlertCircle size={11} />
                          {preCheckResult.errorMessage}
                        </p>
                      )}
                    </div>
                  ))
                )}

                {/* Editable amount */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Amount <span className="text-emerald-600">*</span>
                    {minimumAmount ? (
                      <span className="ml-2 normal-case font-bold text-slate-300">
                        (min {currencyCode} {minimumAmount.toFixed(2)})
                      </span>
                    ) : null}
                  </label>
                  <div className="flex items-baseline gap-1 border-b border-slate-200 focus-within:border-emerald-500 transition-all pb-1">
                    <span className="text-xl font-black text-slate-400">{currencyCode}</span>
                    <input
                      type="number"
                      min={minimumAmount ?? 0.01}
                      step="0.01"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-0 py-0 bg-transparent border-0 focus:outline-none text-xl font-black tracking-tight text-slate-900 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {amountError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">{amountError}</p>
                  )}
                </div>

                {/* Transaction type */}
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Type</p>
                  <p className="text-sm font-bold text-slate-600">{categoryLabel ?? "Bill Payment"}</p>
                </div>

                {/* Notification Fields */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {paymentMethod === "ecocash_seamless" ? (
                        <>EcoCash Number <span className="text-emerald-600">*</span></>
                      ) : (
                        <>Notification Phone <span className="text-emerald-600">*</span></>
                      )}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={paymentMethod === "ecocash_seamless" ? "e.g. 0771234567 (EcoCash)" : "e.g. 0771234567"}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold transition-all"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">
                      {paymentMethod === "ecocash_seamless"
                        ? "EcoCash number that will be charged"
                        : "Where to send your token or receipt"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Notification Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold transition-all"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Date</p>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Clock size={18} className="text-slate-400" />
                    <p className="text-lg font-bold tracking-tight">
                      {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Time</p>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Zap size={18} className="text-emerald-500" />
                    <p className="text-lg font-bold tracking-tight">Instant Processing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("pesepay")}
                  className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                    paymentMethod === "pesepay"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xl shadow-emerald-600/10"
                    : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      paymentMethod === "pesepay" ? "bg-emerald-600 text-white scale-110 rotate-3" : "bg-slate-100 text-slate-400"
                    }`}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${paymentMethod === "pesepay" ? "text-emerald-900" : "text-slate-900"}`}>PesePay Gateway</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EcoCash, OneMoney, Cards</p>
                    </div>
                  </div>
                  {paymentMethod === "pesepay" && (
                    <div className="absolute top-4 right-4 text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod("ecocash_seamless")}
                  className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                    paymentMethod === "ecocash_seamless"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xl shadow-emerald-600/10"
                    : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      paymentMethod === "ecocash_seamless" ? "bg-emerald-600 text-white scale-110 rotate-3" : "bg-slate-100 text-slate-400"
                    }`}>
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${paymentMethod === "ecocash_seamless" ? "text-emerald-900" : "text-slate-900"}`}>EcoCash Seamless</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pay without redirect</p>
                    </div>
                  </div>
                  {paymentMethod === "ecocash_seamless" && (
                    <div className="absolute top-4 right-4 text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                </button>

                <button
                  onClick={handleSelectWallet}
                  className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                    paymentMethod === "wallet"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xl shadow-emerald-600/10"
                    : "border-slate-100 bg-white hover:border-slate-300"
                  } ${!isAuthenticated ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-4 mb-2 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      paymentMethod === "wallet" ? "bg-emerald-600 text-white scale-110 rotate-3" : "bg-slate-100 text-slate-400"
                    }`}>
                      <Wallet size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${paymentMethod === "wallet" ? "text-emerald-900" : "text-slate-900"}`}>EseWallet Balance</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant • No Fees</p>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <p className="text-[10px] font-bold text-amber-600 relative z-10">Login required to use wallet</p>
                  )}
                  {isAuthenticated && walletBalance !== undefined && (
                    <p className={`text-[10px] font-bold relative z-10 ${walletInsufficient ? "text-rose-500" : "text-emerald-600"}`}>
                      Balance: {currencyCode} {walletBalance.toFixed(2)}
                      {walletInsufficient && " — Insufficient funds"}
                    </p>
                  )}
                  {paymentMethod === "wallet" && (
                    <div className="absolute top-4 right-4 text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>PesePay Gateway:</strong> You will be redirected to a secure page to pay with EcoCash, OneMoney, or Bank Cards.{" "}
                  <strong>EcoCash Seamless:</strong> Enter your EcoCash number below and pay directly without a redirect.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Order Summary ────────────────────────────────── */}
          <aside className="sticky top-28">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40">
              <h3 className="text-lg font-black uppercase tracking-[0.2em] mb-8 text-emerald-400">Order Summary</h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-400 font-bold group-hover:text-slate-300 transition-colors text-sm">Base Amount</span>
                  <span className="font-black text-lg">{currencyCode} {baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-400 font-bold group-hover:text-slate-300 transition-colors text-sm">Service Fee {isWallet ? "" : `(${(serviceChargeRate * 100).toFixed(1)}%)`}</span>
                  {isWallet
                    ? <span className="font-black text-sm text-emerald-400 uppercase tracking-widest">No Fees</span>
                    : <span className="font-black text-lg text-emerald-400">+{currencyCode} {serviceFee.toFixed(2)}</span>
                  }
                </div>

                <div className="pt-8 mt-4 border-t border-white/10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total to Pay</p>
                      <p className="text-sm text-emerald-500 font-bold">Incl. all taxes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tighter text-white">{currencyCode} {totalAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onConfirm(paymentMethod, email, phone, effectiveRequiredFields, baseAmount)}
                    disabled={isLoading || !canPay}
                    className="w-full bg-emerald-600 py-5 rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Pay Now
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Secure Checkout
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 px-4">
              <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                By clicking "Pay Now", you agree to EseBills <Link to="#" className="text-slate-600 underline">Terms of Service</Link> and <Link to="#" className="text-slate-600 underline">Privacy Policy</Link>.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PaymentCheckout;
