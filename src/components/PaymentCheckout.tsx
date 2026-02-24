import { useState } from "react";
import BrandLogo from "./BrandLogo";

interface PaymentCheckoutProps {
  billerName: string;
  accountNumber: string;
  amount: string;
  onBack: () => void;
  onConfirm: () => void;
}

type PaymentOption = "wallet" | "card" | "mobile_money";

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  billerName = "ZESA Prepaid",
  accountNumber = "1422 3344 556",
  amount = "50.00",
  onBack,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("wallet");
  const baseAmount = parseFloat(amount) || 0;
  const serviceFee = baseAmount * 0.01;
  const totalAmount = baseAmount + serviceFee;

  return (
    <div className="min-h-screen bg-background-light font-display text-dark-text overflow-y-auto pb-12">
      <header className="h-20 flex items-center justify-between px-8 border-b border-neutral-light bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrandLogo />
        </div>
        <div className="flex items-center gap-6">
          <button className="text-neutral-text hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-primary/10 overflow-hidden cursor-pointer hover:border-primary transition-all shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX_vV9EyjAURNA75Ew1cacAmyL1_zLC_LWTvPRzXiTmbHAkcYffvlhR2Zeoj-kKY1Y07HD5H8hm4YARk10BoIWYAozXWVVvw1ndoQJ62m4t_FNG4CERZwkg6_L2bnZ74yYP_aV2fAUoLjVaAeM1IQImX8e_GnvlSW2Fnpm0-iMiwImKLnfjq36EwAVl1svXsUIVQ07jrN15SWXj9vbWAhveG64qrgsmHsaKhmnTmYNpHje8HAwJ9XEi0JXjxzfCRKnUW3xRylP6qkA"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto pt-7 px-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-neutral-text hover:text-primary transition-all mb-8 group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Bill Selection
        </button>

        <div className="bg-white rounded-[2rem] border border-neutral-light overflow-hidden shadow-xl shadow-primary/5">
          <div className="p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-neutral-light bg-neutral-light/10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-[1.2rem] flex items-center justify-center border border-neutral-light shadow-sm">
                <span className="material-symbols-outlined text-3xl text-primary">bolt</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight text-dark-text">{billerName}</h2>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-accent-green/10 text-accent-green text-[9px] font-black uppercase tracking-widest rounded-full border border-accent-green/20">
                    <span className="material-symbols-outlined text-[12px] fill-1">verified</span>
                    Verified
                  </span>
                </div>
                <p className="text-neutral-text text-xs font-medium mt-1">Utility Payment Gateway</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-1">Total Amount</p>
              <h3 className="text-3xl font-black text-primary tracking-tighter">${totalAmount.toFixed(2)}</h3>
            </div>
          </div>

          <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-y-7 gap-x-10 bg-white">
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-3">Account Holder</p>
              <p className="text-lg font-bold tracking-tight text-dark-text">Johnathan Doe</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-3">Account Number</p>
              <p className="text-lg font-bold tracking-tight text-dark-text">{accountNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-3">Reference ID</p>
              <p className="text-lg font-bold tracking-tight text-dark-text">EB-992031-Z</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-3">Payment Date</p>
              <p className="text-lg font-bold tracking-tight text-dark-text">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="mx-7 p-6 bg-background-light rounded-[1.6rem] border border-neutral-light">
            <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-6">Payment Summary</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-neutral-text">Base Amount</span>
                <span className="text-dark-text">${baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-neutral-text">Service Fee (1%)</span>
                <span className="text-dark-text">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-neutral-light flex justify-between items-center">
                <span className="text-base font-black text-dark-text">Amount to Pay</span>
                <span className="text-xl font-black text-primary tracking-tighter">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-7 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Select Payment Method</p>
              <span className="text-[10px] font-bold text-primary flex items-center gap-1 cursor-pointer hover:underline">
                <span className="material-symbols-outlined text-sm">info</span>
                Help
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod("wallet")}
                className={`p-5 rounded-[1.4rem] border transition-all text-left group relative flex flex-col justify-between h-full ${
                  paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-neutral-light bg-white hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "wallet" ? "bg-primary text-white" : "bg-neutral-light text-neutral-text"}`}>
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-text">EseWallet</p>
                    <p className="text-[10px] text-neutral-text">Instant</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-[10px] text-neutral-text font-bold uppercase tracking-widest mb-1">Balance</p>
                  <p className="text-lg font-black text-dark-text">$1,240.00</p>
                </div>
                {paymentMethod === "wallet" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-5 rounded-[1.4rem] border transition-all text-left group relative flex flex-col justify-between h-full ${
                  paymentMethod === "card" ? "border-primary bg-primary/5" : "border-neutral-light bg-white hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "card" ? "bg-primary text-white" : "bg-neutral-light text-neutral-text"}`}>
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-text">Bank Cards</p>
                    <p className="text-[10px] text-neutral-text">International</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-auto">
                  <span className="px-2 py-0.5 bg-neutral-light rounded text-[8px] font-black uppercase text-neutral-text border border-neutral-light/50">Visa</span>
                  <span className="px-2 py-0.5 bg-neutral-light rounded text-[8px] font-black uppercase text-neutral-text border border-neutral-light/50">Master</span>
                  <span className="px-2 py-0.5 bg-neutral-light rounded text-[8px] font-black uppercase text-neutral-text border border-neutral-light/50">Zim</span>
                </div>
                {paymentMethod === "card" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod("mobile_money")}
                className={`p-5 rounded-[1.4rem] border transition-all text-left group relative flex flex-col justify-between h-full ${
                  paymentMethod === "mobile_money" ? "border-primary bg-primary/5" : "border-neutral-light bg-white hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === "mobile_money" ? "bg-primary text-white" : "bg-neutral-light text-neutral-text"}`}>
                    <span className="material-symbols-outlined">phone_iphone</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-text">Mobile Money</p>
                    <p className="text-[10px] text-neutral-text">Instant</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-auto">
                  <span className="px-2 py-0.5 bg-neutral-light rounded text-[8px] font-black uppercase text-neutral-text border border-neutral-light/50">EcoCash</span>
                  <span className="px-2 py-0.5 bg-neutral-light rounded text-[8px] font-black uppercase text-neutral-text border border-neutral-light/50">OneMoney</span>
                </div>
                {paymentMethod === "mobile_money" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>
                  </div>
                )}
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={onConfirm}
                className="w-full bg-primary py-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-opacity-90 active:scale-[0.99] transition-all shadow-2xl shadow-primary/20 text-white"
              >
                Confirm and Pay ${totalAmount.toFixed(2)}
                <span className="material-symbols-outlined font-black">arrow_forward</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-text">
                <span className="material-symbols-outlined text-lg">lock</span>
                Secured with 256-bit SSL encryption
              </div>
              <div className="flex items-center gap-6 opacity-30">
                <div className="w-12 h-6 bg-neutral-text rounded-md"></div>
                <div className="w-12 h-6 bg-neutral-text rounded-md"></div>
                <div className="w-12 h-6 bg-neutral-text rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCheckout;
