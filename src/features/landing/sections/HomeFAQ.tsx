import { useEffect, useId, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type FaqItem = { id: string; q: string; a: string };

export function HomeFAQ() {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const faqs = useMemo<FaqItem[]>(
    () => [
      {
        id: "how-to-pay",
        q: "How do I pay a bill?",
        a: "Choose a category, pick a service, enter the required details, then confirm and pay. You'll be redirected to checkout to complete the payment.",
      },
      {
        id: "payment-methods",
        q: "Which payment methods do you support?",
        a: "We support popular local payment options and cards (where available). The available methods can vary by service and currency.",
      },
      {
        id: "instant",
        q: "Are payments instant?",
        a: "Most services process instantly. In rare cases, a payment may take a few minutes depending on the biller's network and system status.",
      },
      {
        id: "security",
        q: "Is my information secure?",
        a: "Yes. We use encrypted connections and security best practices to protect your data and transactions.",
      },
      {
        id: "pay-for-someone",
        q: "Can I pay for someone else?",
        a: "Yes. Just enter the recipient's details (like meter number or account number) during checkout.",
      },
      {
        id: "wrong-details",
        q: "What if I entered the wrong account number?",
        a: "If the biller accepts the details, the payment may go through. Double-check before confirming. If you need help, contact support with your reference.",
      },
    ],
    [],
  );

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [faqs, search]);

  useEffect(() => {
    if (!openId) return;
    if (filteredFaqs.some((f) => f.id === openId)) return;
    setOpenId(null);
  }, [filteredFaqs, openId]);

  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Quick answers.
          </h2>

          <div className="mt-7 sm:mt-8 max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r  rounded-sm blur opacity-10 group-hover:opacity-25 transition-opacity" />
              <div className="relative flex items-center border rounded-sm shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <Search size={18} className="ml-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions"
                  className="w-full pl-3 pr-12 bg-transparent focus:outline-none font-medium py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 grid md:grid-cols-2 gap-4">
          {filteredFaqs.length === 0 ? (
            <div className="md:col-span-2 rounded-sm border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-300">
              No results. Try a different keyword.
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openId === item.id;
              const qId = `${baseId}-q-${idx}`;
              const aId = `${baseId}-a-${idx}`;
              return (
                <div
                  key={item.id}
                  className="rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    id={qId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={aId}
                    onClick={() =>
                      setOpenId((v) => (v === item.id ? null : item.id))
                    }
                    className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    id={aId}
                    role="region"
                    aria-labelledby={qId}
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="mailto:support@esebills.com"
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
