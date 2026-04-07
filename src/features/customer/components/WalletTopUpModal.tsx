import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  Landmark,
  ChevronRight,
  Upload,
  CheckCircle2,
  Copy,
  AlertCircle,
  Loader2,
  FileText,
  Building2,
} from 'lucide-react';
import { initiateWalletTopUp, uploadProofOfPayment, getEseBillsAccounts, type BankTopUp, type EseBillsAccount } from '../../../services/wallet.service';
import toast from 'react-hot-toast';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MIN_TOPUP_AMOUNT = 1.00
const MAX_TOPUP_AMOUNT = 100000.00

type Step = 'method' | 'bank' | 'online' | 'upload' | 'success';

export default function WalletTopUpModal({ isOpen, onClose, onSuccess }: WalletTopUpModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [createdTopUp, setCreatedTopUp] = useState<BankTopUp | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankAccounts, setBankAccounts] = useState<EseBillsAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const reset = () => {
    setStep('method');
    setLoading(false);
    setAmount('');
    setCurrencyCode('USD');
    setCreatedTopUp(null);
    setSelectedFile(null);
    setSelectedBankAccountId(null);
  };

  const generateIdempotencyKey = () => {
    return `TOPUP-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const loadBankAccounts = async (currency: string) => {
    setLoadingAccounts(true);
    try {
      const accounts = await getEseBillsAccounts(currency);
      setBankAccounts(accounts.filter(a => a.active));
    } catch (e) {
      console.error('Failed to load bank accounts', e);
      setBankAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const validateAmount = (value: string): string | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 'Amount must be greater than zero';
    if (num < MIN_TOPUP_AMOUNT) return `Minimum top-up amount is ${MIN_TOPUP_AMOUNT}`;
    if (num > MAX_TOPUP_AMOUNT) return `Maximum top-up amount is ${MAX_TOPUP_AMOUNT.toLocaleString()}`;
    return null;
  };

  useEffect(() => {
    if (!isOpen) return;
    reset();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleInitiateBankTransfer = async () => {
    const amountError = validateAmount(amount);
    if (amountError) {
      toast.error(amountError);
      return;
    }
    if (!selectedBankAccountId) {
      toast.error('Please select a bank account');
      return;
    }
    if (!currencyCode) {
      toast.error('Please select a currency');
      return;
    }

    setLoading(true);
    try {
      const res = await initiateWalletTopUp({
        amount: parseFloat(amount),
        currencyCode,
        topUpMethod: 'BANK_TRANSFER',
        eseBillsAccountId: selectedBankAccountId,
        idempotencyKey: generateIdempotencyKey(),
      });
      setCreatedTopUp(res.topUp);
      setStep('upload');
    } catch (error: any) {
      const msg = String(error?.message ?? error ?? 'Failed to initiate top-up');
      toast.error(msg.includes('404') ? 'Top-up endpoint not available (needs backend update): /v1/wallet/top-ups' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateOnline = async () => {
    const amountError = validateAmount(amount);
    if (amountError) {
      toast.error(amountError);
      return;
    }
    if (!currencyCode) {
      toast.error('Please select a currency');
      return;
    }

    setLoading(true);
    try {
      const res = await initiateWalletTopUp({
        amount: parseFloat(amount),
        currencyCode,
        topUpMethod: 'WALLET_PAYMENT',
        paymentMethodCode: 'PESEPAY',
        idempotencyKey: generateIdempotencyKey(),
      });

      const redirectUrl =
        (res as any)?.redirectUrl ||
        (res as any)?.topUp?.redirectUrl ||
        (res as any)?.paymentUrl ||
        (res as any)?.topUp?.paymentUrl;

      if (typeof redirectUrl === 'string' && redirectUrl.length > 0) {
        window.location.assign(redirectUrl);
        return;
      }

      toast.success('Top-up initiated');
      setStep('success');
      onSuccess();
    } catch (error: any) {
      const msg = String(error?.message ?? error ?? 'Failed to initiate top-up');
      toast.error(msg.includes('404') ? 'Top-up endpoint not available (needs backend update): /v1/wallet/top-ups' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!createdTopUp || !selectedFile) {
      setStep('success');
      onSuccess();
      return;
    }

    setLoading(true);
    try {
      await uploadProofOfPayment(createdTopUp.id, selectedFile);
      toast.success('Proof of payment uploaded');
      setStep('success');
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to upload proof, but top-up was created.');
      setStep('success');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Up Wallet</h3>
            <p className="text-xs text-slate-500 font-medium">Add funds to your digital wallet</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'method' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('bank')}
                className="w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Bank Transfer</p>
                  <p className="text-xs text-slate-500">Upload proof, then checker confirms</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>

              <button
                onClick={() => setStep('online')}
                className="w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Online Payment</p>
                  <p className="text-xs text-slate-500">Auto-credit on success</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
          )}

          {step === 'bank' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={MIN_TOPUP_AMOUNT}
                    max={MAX_TOPUP_AMOUNT}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Currency</label>
                  <select
                    value={currencyCode}
                    onChange={(e) => {
                      setCurrencyCode(e.target.value);
                      setSelectedBankAccountId(null);
                      loadBankAccounts(e.target.value);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="USD">USD</option>
                    <option value="ZWG">ZWG</option>
                    <option value="ZWL">ZWL</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bank Account</label>
                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                      <Loader2 size={16} className="animate-spin" />
                      Loading accounts...
                    </div>
                  ) : bankAccounts.length > 0 ? (
                    <select
                      value={selectedBankAccountId ?? ''}
                      onChange={(e) => setSelectedBankAccountId(Number(e.target.value) || null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Select bank account</option>
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bank} - {account.accountNumber} ({account.accountName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-amber-600 py-3 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      No bank accounts available for {currencyCode}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleInitiateBankTransfer}
                disabled={loading || !amount || Number(amount) <= 0 || !selectedBankAccountId}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Generate Deposit Reference'}
              </button>

              <button onClick={() => setStep('method')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">
                Back to methods
              </button>
            </div>
          )}

          {step === 'online' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={MIN_TOPUP_AMOUNT}
                    max={MAX_TOPUP_AMOUNT}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Currency</label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="USD">USD</option>
                    <option value="ZWG">ZWG</option>
                    <option value="ZWL">ZWL</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleInitiateOnline}
                disabled={loading || !amount || Number(amount) <= 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Proceed to Payment'}
              </button>

              <button onClick={() => setStep('method')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">
                Back to methods
              </button>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Top-Up Created</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Use the deposit reference below when making your bank transfer, then upload proof of payment to speed up verification.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Deposit Instructions</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500">Deposit Reference:</span>
                    <button
                      onClick={() => handleCopy(createdTopUp?.depositReference ?? '')}
                      disabled={!createdTopUp?.depositReference}
                      className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 hover:underline disabled:opacity-50"
                      title="Copy deposit reference"
                    >
                      {createdTopUp?.depositReference ?? '—'} <Copy size={12} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500">Bank:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">{createdTopUp?.eseBillsAccount?.bank ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500">Account Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">{createdTopUp?.eseBillsAccount?.accountName ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500">Account #:</span>
                    <button
                      onClick={() => handleCopy(createdTopUp?.eseBillsAccount?.accountNumber ?? '')}
                      disabled={!createdTopUp?.eseBillsAccount?.accountNumber}
                      className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 hover:underline disabled:opacity-50"
                      title="Copy account number"
                    >
                      {createdTopUp?.eseBillsAccount?.accountNumber ?? '—'} <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`p-10 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 ${
                    selectedFile
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10'
                      : 'border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
                  }`}
                >
                  {selectedFile ? (
                    <>
                      <FileText size={48} className="text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center group-hover:text-emerald-500 transition-colors">
                        <Upload size={28} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to select file</p>
                        <p className="text-[10px] text-slate-500 font-medium">JPG, PNG, or PDF (Max 5MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFileUpload}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : selectedFile ? 'Upload & Complete' : 'Skip for now'}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg border border-amber-100 dark:border-amber-800/50">
                  <AlertCircle size={14} />
                  Top-up remains PENDING until verified.
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Request Submitted</h4>
                <p className="text-sm text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed">
                  Your top-up request is being processed. Funds will be available in your wallet once confirmed.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
