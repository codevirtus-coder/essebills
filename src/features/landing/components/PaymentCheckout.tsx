import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Loader2,
  Verified,
} from "lucide-react";
import type { ProductPreCheckResult } from "../../../services/products.service";
import esebillsLogo from "../../../assets/esebills_logo.png";
import pesepayLogo from "../../../assets/pesepay-logo.svg";
import eseWalletLogo from "../../../assets/esewallet_logo_tight-removebg-preview.png";
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
  onConfirm: (
    method: PaymentOption,
    email: string,
    phone: string,
    requiredFields: Record<string, string>,
    amount: number,
  ) => void;
  isLoading?: boolean;
  embedded?: boolean;
  isAuthenticated?: boolean;
  walletBalance?: number;
  onLoginRequired?: () => void;
  productFields?: ProductField[];
  onPreCheck?: (
    requiredFields: Record<string, string>,
    amount?: number,
  ) => void;
  preCheckResult?: ProductPreCheckResult | null;
  isPreChecking?: boolean;
}

export type PaymentOption =
  | "wallet"
  | "card"
  | "mobile_money"
  | "pesepay"
  | "ecocash_seamless";

/** Maps backend FieldType enum to HTML input type */
function fieldInputType(fieldType?: string): string {
  switch (fieldType) {
    case "NUMBER":
      return "number";
    case "DATE":
      return "date";
    case "PASSWORD":
      return "password";
    case "EMAIL":
      return "email";
    case "PHONE_NUMBER":
      return "tel";
    default:
      return "text";
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
    parseFloat(amount) > 0 ? String(parseFloat(amount)) : "",
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
        next[f.name!] =
          prev[f.name!] ?? (idx === 0 ? initialAccountNumber : "");
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

  const walletInsufficient =
    isWallet && walletBalance !== undefined && walletBalance < totalAmount;

  const amountError =
    minimumAmount && baseAmount > 0 && baseAmount < minimumAmount
      ? `Minimum amount is ${currencyCode} ${minimumAmount.toFixed(2)}`
      : null;

  const preCheckFailed =
    preCheckResult != null &&
    preCheckResult.supportsPreCheck &&
    !preCheckResult.valid;

  // All required (non-optional) fields must have a non-empty value
  const requiredFieldsFilled = useMemo(() => {
    if (showFallbackField) return !!fallbackAccount.trim();
    const required = productFields.filter((f) => !f.optional);
    if (required.length === 0) return true; // no required fields (e.g. fuel)
    return required.every((f) => !!fieldValues[f.name!]?.trim());
  }, [showFallbackField, fallbackAccount, productFields, fieldValues]);

  const canPay =
    !!phone &&
    requiredFieldsFilled &&
    baseAmount > 0 &&
    !amountError &&
    !walletInsufficient &&
    !preCheckFailed;

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
    <div
      className={`${embedded ? "" : "min-h-screen bg-white pb-12"} font-sans text-slate-900 overflow-y-auto emerald-scrollbar`}
    >
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
        <header className="h-20 px-4 sm:px-8 border-b border-slate-200 bg-white sticky top-0 z-50">
          <div className="max-w-6xl w-full flex items-center justify-center mx-auto h-full">
            <Link to={ROUTE_PATHS.home} className="flex items-center">
              <img
                src={esebillsLogo}
                alt="EseBills"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
          </div>
        </header>
      )}

      <main
        className={`${embedded ? "p-0" : "max-w-6xl w-full mx-auto pt-6 px-4 sm:px-6"}`}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all mb-5 group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {embedded ? "Back to Marketplace" : "Back to Bill Selection"}
        </button>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
          <div
            className={`grid ${embedded ? "grid-cols-1 lg:grid-cols-[1fr_350px]" : "grid-cols-1 lg:grid-cols-[1fr_400px]"} gap-0 items-start`}
          >
            {/* ── Left Column: Details & Payment Methods ─────────────────────── */}
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                    {billerName}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {categoryLabel ?? "Bill Payment"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* ── Dynamic product fields ─────────────────────────────── */}
                {showFallbackField ? (
                  /* Fallback when no fields are defined for this product */
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Account / Meter Number{" "}
                      <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fallbackAccount}
                        onChange={(e) => setFallbackAccount(e.target.value)}
                        onBlur={handleFieldBlur}
                        placeholder="Enter account or meter number"
                        className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  /* Render each product field from backend definition */
                  productFields.map((field, idx) => (
                    <div
                      key={field.name}
                      className={
                        productFields.length === 1 ? "" : "sm:col-span-1"
                      }
                    >
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {field.displayName ?? field.name}
                        {!field.optional && (
                          <span className="text-emerald-600 ml-1">*</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={fieldInputType(field.fieldType)}
                          value={fieldValues[field.name!] ?? ""}
                          onChange={(e) =>
                            setFieldValues((prev) => ({
                              ...prev,
                              [field.name!]: e.target.value,
                            }))
                          }
                          onBlur={idx === 0 ? handleFieldBlur : undefined}
                          placeholder={
                            field.hint ??
                            `Enter ${field.displayName ?? field.name}`
                          }
                          className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-10"
                        />
                        {idx === 0 && isPreChecking && (
                          <Loader2
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
                          />
                        )}
                      </div>
                      {/* Pre-check feedback on the first field */}
                      {idx === 0 &&
                        preCheckResult?.supportsPreCheck &&
                        preCheckResult.valid &&
                        preCheckResult.accountNarrative && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            {preCheckResult.accountNarrative}
                          </p>
                        )}
                      {idx === 0 &&
                        preCheckResult?.supportsPreCheck &&
                        !preCheckResult.valid &&
                        preCheckResult.errorMessage && (
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
                  <div className="flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <span className="text-xs font-black text-slate-500">
                      {currencyCode}
                    </span>
                    <input
                      type="number"
                      min={minimumAmount ?? 0.01}
                      step="0.01"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent border-0 focus:outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {amountError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">
                      {amountError}
                    </p>
                  )}
                </div>

                {/* Transaction type */}

                {/* Notification Fields */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-slate-200">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {paymentMethod === "ecocash_seamless" ? (
                        <>
                          EcoCash Number{" "}
                          <span className="text-emerald-600">*</span>
                        </>
                      ) : (
                        <>
                          Notification Phone{" "}
                          <span className="text-emerald-600">*</span>
                        </>
                      )}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={
                        paymentMethod === "ecocash_seamless"
                          ? "e.g. 0771234567 (EcoCash)"
                          : "e.g. 0771234567"
                      }
                      className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                      className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5  border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Select Payment Method
                  </h3>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("pesepay")}
                  className={`p-4 rounded-sm border transition-all text-left relative group bg-white ${
                    paymentMethod === "pesepay"
                      ? "border-emerald-600 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="sr-only">PesePay Gateway</span>
                  <div className="flex items-center justify-center h-12 relative z-10">
                    <img
                      src={pesepayLogo}
                      alt="PesePay"
                      className="h-8 w-auto object-contain"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  {paymentMethod === "pesepay" && (
                    <div className="absolute top-4 right-4 text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </button>

                  <button
                    onClick={handleSelectWallet}
                    className={`p-4 rounded-sm border transition-all text-left relative group bg-white ${
                      paymentMethod === "wallet"
                        ? "border-emerald-600 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    } ${!isAuthenticated ? "opacity-60" : ""}`}
                  >
                    <span className="sr-only">EseWallet Balance</span>
                    <div className="flex items-center justify-center h-12 relative z-10">
                      <img
                        src={eseWalletLogo}
                        alt="EseWallet"
                        className="h-8 w-auto object-contain"
                        draggable={false}
                        loading="lazy"
                      />
                    </div>
                    {!isAuthenticated && (
                      <p className="text-[10px] font-bold text-amber-600 relative z-10">
                        Login required to use wallet
                      </p>
                    )}
                    {isAuthenticated && walletBalance !== undefined && (
                      <p
                        className={`text-[10px] font-bold relative z-10 ${walletInsufficient ? "text-rose-500" : "text-emerald-600"}`}
                      >
                        Balance: {currencyCode} {walletBalance.toFixed(2)}
                        {walletInsufficient && " — Insufficient funds"}
                      </p>
                    )}
                    {paymentMethod === "wallet" && (
                      <div className="absolute top-4 right-4 text-emerald-600">
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right Column: Order Summary ────────────────────────────────── */}
            <aside className="p-5 sm:p-6 border-t lg:border-t-0  border-slate-200 bg-white">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center group">
                    <span className="text-slate-500 font-bold text-sm">
                      Base Amount
                    </span>
                    <span className="font-black text-sm text-slate-900">
                      {currencyCode} {baseAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-slate-500 font-bold text-sm">
                      Service Fee{" "}
                      {isWallet
                        ? ""
                        : `(${(serviceChargeRate * 100).toFixed(1)}%)`}
                    </span>
                    {isWallet ? (
                      <span className="font-black text-[10px] text-emerald-700 uppercase tracking-widest">
                        No Fees
                      </span>
                    ) : (
                      <span className="font-black text-sm text-emerald-700">
                        +{currencyCode} {serviceFee.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="pt-5 mt-2 border-t border-slate-200">
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Total to Pay
                        </p>
                        <p className="text-xs text-emerald-700 font-bold">
                          Incl. all taxes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900">
                          {currencyCode} {totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onConfirm(
                          paymentMethod,
                          email,
                          phone,
                          effectiveRequiredFields,
                          baseAmount,
                        )
                      }
                      disabled={isLoading || !canPay}
                      className="w-full bg-emerald-600 py-3.5 rounded-sm font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Pay Now
                          <ChevronRight className="group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-0">
                <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                  By clicking "Pay Now", you agree to EseBills{" "}
                  <Link to="#" className="text-slate-500 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-slate-500 underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCheckout;
