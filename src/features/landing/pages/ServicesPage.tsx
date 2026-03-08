import { Link } from 'react-router-dom';
import {
  ArrowLeft,
} from 'lucide-react';
import { ROUTE_PATHS } from '../../../router/paths';
import { ServicesMarketplace } from '../../shared/components/ServicesMarketplace';

export function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 pt-16 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <Link
            to={ROUTE_PATHS.home}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-all mb-10 group bg-white/5 px-4 py-1.5 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Services <span className="text-emerald-400">Marketplace</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Quickly find and pay for utilities, airtime, fees, insurance, and more.
            All your bills in one secure place.
          </p>
        </div>
      </div>

      {/* ── Marketplace Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-20">
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-8 md:p-12">
          <ServicesMarketplace />
        </div>
      </div>
    </div>
  );
}
