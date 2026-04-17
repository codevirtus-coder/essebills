import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { Icon } from "../../../components/ui/Icon";
import { cn } from "../../../lib/utils";
import { ROUTE_PATHS } from "../../../router/paths";
import type { BillerCard } from "../../shared/components/ServicesMarketplace";
import { useQuickPayData } from "../../customer/components/QuickPay";

const LS_KEY = "esebills.quickpay.last";

type LastSelection = { productId: number; productName: string };

type CategoryTone =
  | "utilities"
  | "airtime"
  | "internet"
  | "education"
  | "insurance"
  | "donations"
  | "entertainment"
  | "fuel"
  | "other";

function readLast(): LastSelection | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastSelection;
  } catch {
    return null;
  }
}

function saveLast(value: LastSelection) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

function rankMatch(haystack: string, q: string): number {
  if (!q) return 9999;
  const v = haystack.toLowerCase();
  if (v === q) return 0;
  if (v.startsWith(q)) return 1;
  const idx = v.indexOf(q);
  if (idx >= 0) return 2 + Math.min(idx, 30) / 30;
  return 9999;
}

function toneFromLabel(label: string): CategoryTone {
  const v = label.toLowerCase();
  if (/(airtime|recharge|top\s?up|evd)/.test(v)) return "airtime";
  if (/(bundle|data|internet|wifi)/.test(v)) return "internet";
  if (/(school|education|tuition|fees|college|university)/.test(v))
    return "education";
  if (/(insurance|funeral|medical|health)/.test(v)) return "insurance";
  if (/(donat|charity|church|tithe)/.test(v)) return "donations";
  if (/(entertain|dstv|showmax|netflix|tv|music)/.test(v))
    return "entertainment";
  if (/(fuel|petrol|diesel|gas)/.test(v)) return "fuel";
  if (/(utilit|electric|zesa|zetdc|water|council)/.test(v)) return "utilities";
  return "other";
}

function toneVisual(tone: CategoryTone) {
  switch (tone) {
    case "utilities":
      return {
        icon: "bolt",
        wrap: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
    case "airtime":
      return {
        icon: "cell_tower",
        wrap: "bg-sky-50 text-sky-700 border-sky-100",
      };
    case "internet":
      return {
        icon: "public",
        wrap: "bg-violet-50 text-violet-700 border-violet-100",
      };
    case "education":
      return {
        icon: "school",
        wrap: "bg-amber-50 text-amber-700 border-amber-100",
      };
    case "insurance":
      return {
        icon: "shield",
        wrap: "bg-rose-50 text-rose-700 border-rose-100",
      };
    case "donations":
      return {
        icon: "favorite",
        wrap: "bg-pink-50 text-pink-700 border-pink-100",
      };
    case "entertainment":
      return {
        icon: "headphones",
        wrap: "bg-indigo-50 text-indigo-700 border-indigo-100",
      };
    case "fuel":
      return {
        icon: "local_gas_station",
        wrap: "bg-orange-50 text-orange-700 border-orange-100",
      };
    default:
      return {
        icon: "category",
        wrap: "bg-slate-50 text-slate-700 border-slate-100",
      };
  }
}

export function HeroServiceFinder() {
  const navigate = useNavigate();
  const { allProducts } = useQuickPayData();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [lastSelection, setLastSelection] = useState<LastSelection | null>(() =>
    readLast(),
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .map((p) => ({
        p,
        score: Math.min(
          rankMatch(p.name, q),
          rankMatch(p.categoryLabel ?? "", q),
          rankMatch(p.description ?? "", q),
        ),
      }))
      .filter((x) => x.score < 9999)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.p);
  }, [allProducts, query]);

  const suggestions = useMemo(
    () => [
      ...filteredProducts.slice(0, 10).map((p) => ({
        type: "product" as const,
        id: p.id,
        label: p.name,
        tone: toneFromLabel(p.categoryLabel ?? p.categoryKey),
        biller: p as BillerCard,
      })),
    ],
    [filteredProducts],
  );

  const handlePick = (b: BillerCard) => {
    const next = { productId: b.productId, productName: b.name };
    saveLast(next);
    setLastSelection(next);

    const q = new URLSearchParams({
      biller: b.name,
      productId: String(b.productId),
    });
    if (b.productCategoryId != null)
      q.set("productCategoryId", String(b.productCategoryId));
    navigate(`${ROUTE_PATHS.checkout}?${q.toString()}`);
  };

  useEffect(() => {
    if (!open) setFocusedIndex(0);
  }, [open]);

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 shrink-0">
        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
          Which service do you want to pay for?
        </h3>

        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Search service
          </label>
          <div className="mt-2 relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 130);
              }}
              onKeyDown={(e) => {
                if (!open) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setFocusedIndex((i) =>
                    Math.min(i + 1, suggestions.length - 1),
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setFocusedIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const s = suggestions[focusedIndex];
                  if (!s) return;
                  handlePick(s.biller);
                }
              }}
              placeholder={
                "e.g. ZESA, Econet, DSTV..."
              }
              className={cn(
                "w-full pl-11 pr-4 py-3.5 rounded-full border text-sm font-semibold outline-none transition-all shadow-sm",
                "bg-white border-slate-200",
                "focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10",
              )}
            />
          </div>

          {open && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50">
              <div className="max-h-[320px] overflow-auto">
                {suggestions.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-500">
                    No results found.
                  </div>
                ) : (
                  suggestions.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        handlePick(s.biller);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors",
                        idx === focusedIndex
                          ? "bg-emerald-50/70"
                          : "hover:bg-slate-50",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {s.label}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {s.biller.categoryLabel ?? "Service"}
                          {s.type === "product" && s.biller.currencyCode
                            ? ` - ${s.biller.currencyCode}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full border flex items-center justify-center",
                            toneVisual(s.tone).wrap,
                          )}
                        >
                          <Icon
                            name={toneVisual(s.tone).icon}
                            size={18}
                            className="opacity-90"
                          />
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {lastSelection && (
          <button
            type="button"
            onClick={() => {
              const b = allProducts.find(
                (x) => x.productId === lastSelection.productId,
              );
              if (b) handlePick(b);
            }}
            className="w-full p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="min-w-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Icon name="history" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Last used
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {lastSelection.productName}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}

export default HeroServiceFinder;
