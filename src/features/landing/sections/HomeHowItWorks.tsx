import { useState } from "react";
import { motion } from "framer-motion";

export function HomeHowItWorks() {
  const [active, setActive] = useState<"customer" | "agent">("customer");

  const steps = {
    customer: [
      { n: "01", title: "Create an account",  desc: "Register in minutes with your email and phone number." },
      { n: "02", title: "Fund your wallet",   desc: "Top up via card, mobile money, or bank transfer." },
      { n: "03", title: "Choose a biller",    desc: "Select from electricity, water, airtime, internet, and more." },
      { n: "04", title: "Pay instantly",      desc: "Your payment is confirmed in seconds. No queues, no hassle." },
    ],
    agent: [
      { n: "01", title: "Apply to join",  desc: "Submit your agent application with basic business details." },
      { n: "02", title: "Get approved",   desc: "Our team reviews your application within 24 hours." },
      { n: "03", title: "Buy float",      desc: "Load your float balance to start processing transactions." },
      { n: "04", title: "Start selling",  desc: "Sell airtime, tokens, and bills. Earn commissions daily." },
    ],
  };

  return (
    <section id="how-it-works" className="bg-white dark:bg-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Up and running
            <br />
            in minutes.
          </h2>
        </div>

        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-12 sm:mb-16">
          {(["customer", "agent"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`relative px-4 sm:px-6 md:px-8 py-3 rounded-xl text-xs sm:text-sm font-black transition-all uppercase tracking-widest whitespace-nowrap ${
                active === tab ? "text-white shadow-xl shadow-slate-900/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {active === tab && (
                <motion.div
                  layoutId="active-tab-bg-hiw"
                  className="absolute inset-0 bg-[#10B981] rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab === "customer" ? "For Customers" : "For Agents"}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps[active].map(({ n, title, desc }, i) => (
            <div key={n} className="relative">
              {i < steps[active].length - 1 && (
                <div
                  className="hidden lg:block absolute top-6 h-px bg-gradient-to-r from-[#10B981] via-slate-200 dark:via-slate-700 to-slate-200 dark:to-slate-700 z-0"
                  style={{ left: "48px", width: "calc(100% - 24px)" }}
                />
              )}
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#10B981] text-white font-black text-sm flex items-center justify-center mb-4 sm:mb-5">
                  {n}
                </div>
                <h3 className="text-slate-900 dark:text-white font-black text-sm sm:text-base mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
