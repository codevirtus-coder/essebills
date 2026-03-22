import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Store, Building2, ChevronRight, CheckCircle2 } from "lucide-react";
import { ROUTE_PATHS } from "../../../router/paths";

export function HomeForWho() {
  const audiences = [
    {
      icon: Users,
      title: "Customers",
      tag: "Personal",
      featured: true,
      description: "Pay your utility, mobile, education, and insurance bills instantly from one secure dashboard.",
      perks: ["Electricity & water bills", "Airtime & data bundles", "School & university fees", "Full payment history"],
      cta: "Create Free Account",
      href: ROUTE_PATHS.registerBuyer,
      loginHref: ROUTE_PATHS.login,
      loginLabel: "Already a customer? Sign in",
    },
    {
      icon: Store,
      title: "EseAgents & Corporates",
      tag: "Business & Scale",
      featured: false,
      description: "Join our agency network or manage company payouts. Execute bulk payments for employees and recurring bills.",
      perks: ["Bulk & Recurring Payments", "Competitive commissions", "Float management", "Real-time reports"],
      cta: "Join the Network",
      href: ROUTE_PATHS.registerAgent,
      loginHref: ROUTE_PATHS.loginAgent,
      loginLabel: "Business login",
    },
    {
      icon: Building2,
      title: "Billers",
      tag: "Corporate",
      featured: false,
      description: "Digitize your collections. Reach more customers and receive real-time settlements.",
      perks: ["Digital collection portal", "Real-time settlements", "Reconciliation reports", "API integration"],
      cta: "Register as Biller",
      href: ROUTE_PATHS.registerBiller,
      loginHref: ROUTE_PATHS.loginBiller,
      loginLabel: "Biller login",
    },
  ];

  return (
    <section id="audience" className="bg-slate-50/60 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">Who It's For</p>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Built for the full
            <br />
            payment ecosystem.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {audiences.map(({ icon: Icon, title, tag, featured, description, perks, cta, href, loginHref, loginLabel }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              className={`relative rounded-3xl p-7 sm:p-8 flex flex-col overflow-hidden ${
                featured
                  ? "bg-[#10B981]/10 border border-[#10B981]/40 shadow-xl shadow-[#10B981]/20"
                  : "bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all"
              }`}
            >
              {featured && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              )}
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5 self-start ${
                featured ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" : "bg-slate-100 text-slate-600"
              }`}>
                <Icon size={12} />
                {tag}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-900">{title}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${featured ? "text-slate-700" : "text-slate-500"}`}>{description}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {perks.map((perk) => (
                  <li key={perk} className={`flex items-center gap-2.5 text-sm ${featured ? "text-slate-700" : "text-slate-600"}`}>
                    <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to={href}
                className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3.5 rounded-2xl transition-all ${
                  featured ? "bg-[#10B981] text-white hover:bg-[#0ea472] shadow-lg" : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {cta}
                <ChevronRight size={16} />
              </Link>
              <Link
                to={loginHref}
                className={`mt-3 text-center text-xs transition-colors font-medium ${featured ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                {loginLabel}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
