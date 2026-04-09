import type { UserGroup } from "../auth/dto/auth.dto";

export type MenuItem = {
  id: string;
  label: string;
  icon: string;
  path?: string;
};

export type MenuSection = {
  id: string;
  title?: string;
  items: MenuItem[];
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export const ADMIN_MENU: MenuSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      { id: "dashboard",     label: "Dashboard",     icon: "dashboard" },
      { id: "transactions",  label: "Transactions",  icon: "sync_alt" },
      { id: "bulkPayments",  label: "Bulk Payments", icon: "groups" },
      { id: "donations",     label: "Donations",     icon: "favorite" },
    ],
  },
  {
    id: "ops",
    title: "Operations",
    items: [
      { id: "billers",                       label: "Billers",            icon: "corporate_fare" },
      { id: "agents",                        label: "Agents",             icon: "storefront" },
      { id: "products",                      label: "Products",           icon: "inventory_2" },
      { id: "parametersProductCategories",   label: "Categories",         icon: "layers" },
      { id: "providers",                     label: "Providers",          icon: "hub" },
    ],
  },
  {
    id: "users",
    title: "Users & Groups",
    items: [
      { id: "userSettingsUsers",  label: "All Users", icon: "group" },
      { id: "userSettingsGroups", label: "Groups",    icon: "admin_panel_settings" },
    ],
  },
  {
    id: "financials",
    title: "Financials",
    items: [
      { id: "commissions",    label: "Commissions",  icon: "payments" },
      { id: "bankTopUps",     label: "Bank Top-Ups", icon: "account_balance_wallet" },
      { id: "esebillsAccounts", label: "Bank Accounts", icon: "account_balance" },
    ],
  },
  {
    id: "catalog",
    title: "Parameters",
    items: [
      { id: "parametersCurrencies",  label: "Currencies",  icon: "currency_exchange" },
      { id: "parametersCountries",   label: "Countries",   icon: "public" },
      { id: "parametersCountryCurrencies", label: "Country Currencies", icon: "link" },
      { id: "parametersBanks",       label: "Banks",       icon: "account_balance" },
      { id: "parametersHolidays",    label: "Holidays",    icon: "event" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    items: [
      { id: "credentialsPesepay", label: "Pesepay",  icon: "vpn_key" },
      { id: "whatsapp",           label: "WhatsApp", icon: "mark_chat_read" },
      { id: "diagnostics",        label: "Diagnostics", icon: "bug_report" },
    ],
  },
];

export const ADMIN_PREFERENCE_ITEMS: MenuItem[] = [
  { id: "profile",       label: "Profile",        icon: "account_circle" },
  { id: "notifications", label: "Notifications",  icon: "notifications" },
  { id: "settings",      label: "Settings",       icon: "settings" },
  { id: "support",       label: "Support",        icon: "help" },
];

// ─── AGENT ────────────────────────────────────────────────────────────────────

export const AGENT_MENU: MenuSection[] = [
  {
    id: "sales",
    title: "Sales",
    items: [
      { id: "overview",      label: "Dashboard",     icon: "home" },
      { id: "sell",          label: "Make a Sale",   icon: "point_of_sale" },
      { id: "bulk-payments", label: "Bulk Payments", icon: "groups" },
      { id: "donations",     label: "Donations",     icon: "favorite" },
    ],
  },
  {
    id: "finances",
    title: "Finances",
    items: [
      { id: "float",       label: "Float Wallet", icon: "account_balance_wallet" },
      { id: "commissions", label: "Commissions",  icon: "payments" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: "notifications" },
      { id: "profile",       label: "Profile",       icon: "person" },
    ],
  },
];

// ─── BILLER ───────────────────────────────────────────────────────────────────

export const BILLER_MENU: MenuSection[] = [
  {
    id: "business",
    title: "Business",
    items: [
      { id: "overview",     label: "Dashboard",   icon: "home" },
      { id: "collections",  label: "Collections", icon: "payments" },
      { id: "settlements",  label: "Settlements", icon: "account_balance" },
      { id: "donations",    label: "Donations",   icon: "favorite" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: "notifications" },
      { id: "settings",      label: "Settings",      icon: "settings" },
      { id: "profile",       label: "Profile",       icon: "person" },
    ],
  },
];

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────

export const CUSTOMER_MENU: MenuSection[] = [
  {
    id: "services",
    title: "Services",
    items: [
      { id: "overview",      label: "Dashboard",     icon: "home" },
      { id: "pay",           label: "Pay a Bill",    icon: "payments" },
      { id: "bulk-payments", label: "Bulk Payments", icon: "groups" },
      { id: "donations",     label: "Donations",     icon: "favorite" },
    ],
  },
  {
    id: "finances",
    title: "Finances",
    items: [
      { id: "wallet",       label: "Wallet",       icon: "account_balance_wallet" },
      { id: "transactions", label: "Transactions", icon: "receipt_long" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: "notifications" },
      { id: "profile",       label: "Profile",       icon: "person" },
    ],
  },
];

// ─── Resolver ─────────────────────────────────────────────────────────────────

export function getMenuByGroup(group: UserGroup): MenuSection[] {
  switch (group) {
    case "ADMIN":    return ADMIN_MENU;
    case "AGENT":    return AGENT_MENU;
    case "BILLER":   return BILLER_MENU;
    case "CUSTOMER": return CUSTOMER_MENU;
    default:         return CUSTOMER_MENU;
  }
}
