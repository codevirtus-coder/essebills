import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { 
  getEseBillsAccounts, 
  initiateBankTopUp, 
  uploadProofOfPayment,
  type EseBillsAccount,
  type BankTopUp
} from '../../../services/wallet.service';
import toast from 'react-hot-toast';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'method' | 'bank-select' | 'details' | 'confirm' | 'upload' | 'success';

export default function WalletTopUpModal({ isOpen, onClose, onSuccess }: WalletTopUpModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<EseBillsAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EseBillsAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [createdTopUp, setCreatedTopUp] = useState<BankTopUp | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && step === 'bank-select') {
      setLoading(true);
      getEseBillsAccounts()
        .then(data => setAccounts(data.filter(a => a.active)))
        .catch(() => toast.error("Failed to load bank accounts"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleInitiate = async () => {
    if (!selectedAccount || !amount || !reference) {
      toast.error("Please fill in all details");
      return;
    }
    setLoading(true);
    try {
      const data = await initiateBankTopUp({
        eseBillsAccountId: selectedAccount.id,
        amount: parseFloat(amount),
        currencyCode: selectedAccount.currencyCode,
        depositReference: reference
      });
      setCreatedTopUp(data);
      setStep('upload');
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate top-up");
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
      toast.success("Proof of payment uploaded");
      setStep('success');
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to upload proof, but top-up was notified.");
      setStep('success');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Up Wallet</h3>
            <p className="text-xs text-slate-500 font-medium">Add funds to your digital wallet</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'method' && (
            <div className="space-y-4">
              <button 
                onClick={() => setStep('bank-select')}
                className="w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Bank Deposit / Transfer</p>
                  <p className="text-xs text-slate-500">Pay into our local bank accounts</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>

              <button 
                disabled
                className="w-full p-6 rounded-2xl border border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Card / Mobile Money</p>
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase font-black tracking-widest">Coming Soon</span>
                  </div>
                  <p className="text-xs text-slate-500">Instant top-up via payment gateway</p>
                </div>
              </button>
            </div>
          )}

          {step === 'bank-select' && (
            <div className="space-y-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select EseBills Account</p>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />)
                ) : accounts.map(acc => (
                  <button 
                    key={acc.id}
                    onClick={() => { setSelectedAccount(acc); setStep('details'); }}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all text-left flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400">
                      {acc.bank.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{acc.bank}</p>
                      <p className="text-[10px] font-mono text-slate-500">{acc.accountNumber}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-emerald-600">{acc.currencyCode}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('method')} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5">
                Back to methods
              </button>
            </div>
          )}

          {step === 'details' && selectedAccount && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Deposit Instructions</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Bank:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedAccount.bank}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Account Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedAccount.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Account #:</span>
                    <button onClick={() => handleCopy(selectedAccount.accountNumber)} className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 hover:underline">
                      {selectedAccount.accountNumber} <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount ({selectedAccount.currencyCode})</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deposit Reference / Slip #</label>
                  <input 
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter reference from your bank"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button 
                onClick={handleInitiate}
                disabled={loading || !amount || !reference}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Notify Deposit"}
              </button>
              
              <button onClick={() => setStep('bank-select')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">
                Choose a different bank
              </button>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Success! Deposit Notified</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your top-up request has been created. Please upload a clear photo or screenshot of your deposit slip to speed up verification.
                </p>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`p-10 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 ${selectedFile ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/50 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'}`}>
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
                  {loading ? <Loader2 className="animate-spin" size={16} /> : selectedFile ? "Upload & Complete" : "Skip for now"}
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
                onClick={onClose}
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
