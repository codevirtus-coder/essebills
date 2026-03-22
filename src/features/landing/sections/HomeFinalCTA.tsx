import { Link } from "react-router-dom";
import { ChevronRight, Store } from "lucide-react";
import { ROUTE_PATHS } from "../../../router/paths";

export function HomeFinalCTA() {
  return (
    <section className="bg-[#10B981]/10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-[#10B981] text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">Get Started</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-5 sm:mb-6">
          Ready to simplify
          <br />
          your bill payments?
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
          Join thousands of customers and agents already using EseBills to pay bills instantly, earn commissions, and manage payments digitally.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            to={ROUTE_PATHS.register}
            className="group inline-flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-[#0ea472] transition-all shadow-lg"
          >
            Create Account
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to={ROUTE_PATHS.loginAgent}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-slate-200 hover:bg-white/90 transition-all"
          >
            <Store size={16} />
            Agent Portal
          </Link>
        </div>
      </div>
    </section>
  );
}
