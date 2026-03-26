import { getProducts, getProductCategories, getProductsByCategory } from "../../../services/products.service";
import type { Product, ProductCategory } from "../../../types/products";
import {
  Zap, Smartphone, Wifi, BookOpen, ShieldCheck, Droplets, Heart, Sparkles,
} from "lucide-react";
import { createElement } from "react";

export type BillerItem = {
  id: string;
  productId: number;
  productCategoryId?: number;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  minimumPurchaseAmount?: number;
};

export type CategoryTab = {
  key: string;
  label: string;
};

export type IdleCallbackHandle = number;

export const requestIdle = (callback: () => void, timeout: number): IdleCallbackHandle => {
  if (typeof window === "undefined") return 0;
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (win.requestIdleCallback) {
    return win.requestIdleCallback(callback, { timeout });
  }
  return window.setTimeout(callback, timeout);
};

export const cancelIdle = (handle: IdleCallbackHandle) => {
  if (typeof window === "undefined") return;
  const win = window as Window & { cancelIdleCallback?: (id: number) => void };
  if (win.cancelIdleCallback) {
    win.cancelIdleCallback(handle);
    return;
  }
  window.clearTimeout(handle);
};

export function categoryIcon(label: string, cls = "w-4 h-4") {
  const props = { className: cls };
  switch (label.toLowerCase()) {
    case "airtime":   return createElement(Smartphone, props);
    case "internet":  return createElement(Wifi, props);
    case "education": return createElement(BookOpen, props);
    case "insurance": return createElement(ShieldCheck, props);
    case "fuel":      return createElement(Droplets, props);
    case "donations": return createElement(Heart, props);
    case "lottery":   return createElement(Sparkles, props);
    default:          return createElement(Zap, props);
  }
}

export function inferCategory(name: string, code: string): { key: string; label: string } {
  const v = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(v))  return { key: "airtime",   label: "Airtime" };
  if (/(bundle|data)/.test(v))                  return { key: "internet",  label: "Internet" };
  if (/(school|tuition|fees|university|college|education)/.test(v)) return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(v)) return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(v))        return { key: "fuel",      label: "Fuel" };
  if (/(donat)/.test(v))                         return { key: "donations", label: "Donations" };
  if (/(lottery|loto|jackpot)/.test(v))          return { key: "lottery",   label: "Lottery" };
  return { key: "utilities", label: "Utilities" };
}

export async function fetchProductsAndCategories(categoryId?: string) {
  const [productsPage, categories] = await Promise.all([
    categoryId
      ? getProductsByCategory(categoryId, { size: 50 })
      : getProducts({ size: 50 }),
    getProductCategories(),
  ]);
  return {
    products: Array.isArray(productsPage?.content) ? productsPage.content : ([] as Product[]),
    categories: Array.isArray(categories) ? categories : ([] as ProductCategory[]),
  };
}
