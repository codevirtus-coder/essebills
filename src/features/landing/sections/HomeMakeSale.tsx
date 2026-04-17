import { motion } from "framer-motion";
import { ShieldCheck, Zap } from "lucide-react";
import { ServicesMarketplace } from "../../shared/components/ServicesMarketplace";

export function HomeMakeSale() {
  return (
    <section
      id="pay-now"
      className="bg-white dark:bg-slate-900 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-2 sm:mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            {/* <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3 sm:mb-4">
              Direct Payments
            </p> */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Select a biller to <span className="text-[#10B981]">pay now</span>
            </h2>
          </motion.div>

          {/* <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">
            <ShieldCheck size={14} className="text-[#10B981]" />
            Secured by EseBills
          </div> */}
        </div>

        {/* Main panel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className=" dark:bg-slate-800 rounded-sm   overflow-hidden"
        >
          <div className="">
            <ServicesMarketplace
              embedded
              compact
              categoryUi="cards"
              hideProductsUntilCategory
              radius="sm"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
