import { motion } from "framer-motion";
import { ShieldCheck, Zap } from "lucide-react";
import { ServicesMarketplace } from "../../shared/components/ServicesMarketplace";

export function HomeMakeSale() {
  return (
    <section
      id="pay-now"
      className="bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-4">
              Direct Payments
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Select a biller to{" "}
              <span className="text-[#10B981]">pay now</span>
            </h2>
            <p className="text-slate-500 mt-3 text-base sm:text-lg">
              Browse all services, choose what you need, and pay instantly.
            </p>
          </motion.div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0">
            <ShieldCheck size={14} className="text-[#10B981]" />
            Secured by EseBills
          </div>
        </div>

        {/* Main panel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden min-h-[600px]"
        >
          <div className="p-4 md:p-6">
            <ServicesMarketplace embedded={true} />
          </div>
        </motion.div>

        {/* Bottom trust row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          {[
            { icon: <Zap size={13} className="text-[#10B981]" />, text: "Instant processing" },
            { icon: <ShieldCheck size={13} className="text-[#10B981]" />, text: "256-bit encrypted" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 font-medium">
              {icon}
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
