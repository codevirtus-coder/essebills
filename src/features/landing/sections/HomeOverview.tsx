import { motion } from "framer-motion";
import { Zap, ShieldCheck, Users } from "lucide-react";

export function HomeOverview() {
  const cards = [
    {
      icon: Zap,
      title: "Instant Settlement",
      desc: "Payments processed in real-time. Instant validation and confirmation on every transaction.",
      stat: "< 3s",
      statLabel: "avg. settlement",
    },
    {
      icon: ShieldCheck,
      title: "Bank-level Security",
      desc: "Your transactions are encrypted end-to-end with OTP verification on every login.",
      stat: "256-bit",
      statLabel: "encryption",
    },
    {
      icon: Users,
      title: "Built for Everyone",
      desc: "Customers, agents, and billers — one unified platform for the full payment ecosystem.",
      stat: "3",
      statLabel: "user types",
    },
  ];

  return (
    <section id="overview" className="bg-white dark:bg-slate-900 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
              The Platform
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
              One platform.
              <br />
              Pay anything.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              EseBills connects customers, agents, and businesses on a single payment platform — eliminating queues, delays, and cash handling.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {cards.map(({ icon: Icon, title, desc, stat, statLabel }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                className={`group relative p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 ${i === 2 ? "sm:col-span-2" : ""}`}
              >
                <div className="absolute top-0 right-0 pr-4 pt-4 sm:pr-6 sm:pt-5 text-right">
                  <p className="text-xl sm:text-2xl font-black text-[#10B981]">{stat}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10B981]">{statLabel}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#10B981] flex items-center justify-center mb-4 sm:mb-5">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
