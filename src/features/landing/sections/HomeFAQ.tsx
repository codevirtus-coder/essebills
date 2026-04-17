import { useId, useMemo, useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

type FaqItem = { q: string; a: string };

export function HomeFAQ() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs = useMemo<FaqItem[]>(
    () => [
      {
        q: "How do I pay a bill?",
        a: "Choose a category, pick a service, enter the required details, then confirm and pay. You’ll be redirected to checkout to complete the payment.",
      },
      {
        q: "Which payment methods do you support?",
        a: "We support popular local payment options and cards (where available). The available methods can vary by service and currency.",
      },
      {
        q: "Are payments instant?",
        a: "Most services process instantly. In rare cases, a payment may take a few minutes depending on the biller’s network and system status.",
      },
      {
        q: "Is my information secure?",
        a: "Yes. We use encrypted connections and security best practices to protect your data and transactions.",
      },
      {
        q: "Can I pay for someone else?",
        a: "Yes. Just enter the recipient’s details (like meter number or account number) during checkout.",
      },
      {
        q: "What if I entered the wrong account number?",
        a: "If the biller accepts the details, the payment may go through. Double-check before confirming. If you need help, contact support with your reference.",
      },
    ],
    [],
  );

  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Quick answers,
              <br />
              zero confusion.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm sm:text-base leading-relaxed max-w-xl">
              Everything you need to know to pay confidently — fast, secure, and
              straight to the point.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white">
                      Safe & secure payments
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Encrypted connections and trusted payment flows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                    <HelpCircle size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white">
                      Need help?
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      If something looks off, keep your reference and reach out
                      to support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              {faqs.map((item, idx) => {
                const isOpen = openIndex === idx;
                const qId = `${baseId}-q-${idx}`;
                const aId = `${baseId}-a-${idx}`;
                return (
                  <div
                    key={item.q}
                    className={`border-b border-slate-200 dark:border-slate-800 ${
                      idx === faqs.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <button
                      id={qId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={aId}
                      onClick={() => setOpenIndex((v) => (v === idx ? -1 : idx))}
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
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

