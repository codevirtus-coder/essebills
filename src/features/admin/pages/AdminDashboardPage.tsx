import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import UserProfile from "../components/UserProfile";
import Reports from "../components/Reports";
import Transactions from "../components/Transactions";
import Billers from "../components/Billers";
import Products from "../components/Products";
import Agents from "../components/Agents";
import AdminUsersPage from "../components/AdminUsersPage";
import AdminEconetPage from "../components/AdminEconetPage";
import AdminFeaturePlaceholder from "../components/AdminFeaturePlaceholder";
import AdminApiModulePage from "../components/AdminApiModulePage";
import AdminParametersPage from "../components/AdminParametersPage";
import AdminUserGroupsPage from "../components/AdminUserGroupsPage";
import Settings from "../components/Settings";
import Support from "../components/Support";
import Messaging from "../components/Messaging";
import WhatsAppCenter from "../components/WhatsAppCenter";
import {
  getAllCgrateCredentials,
  getAllEconetCredentials,
  getAllEsolutionsAirtimeCredentials,
  getAllHolidays,
  getAllNetoneBundlePlans,
  getAllNetoneDataBundleTypes,
  getAllNetoneEvdCredentials,
  getAllPesepayCredentials,
  getAllRongekaAccounts,
  getAllSmsCharges,
  getAllSmsMessages,
  getAllZesaCredentials,
  getAllEsolutionsSmsCredentials,
} from "../services";
import { ADMIN_MENU_SECTIONS, ADMIN_PREFERENCE_ITEMS, INITIAL_FAQS } from "../data/constants";
import type { FAQItem } from "../data/types";
import { clearAuthSession } from "../../auth/auth.storage";
import { ROUTE_PATHS } from "../../../router/paths";
import "../styles/admin-dashboard.css";

type AdminTab = string;
const ADMIN_ACTIVE_TAB_STORAGE_KEY = "admin_active_tab";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string>("commissions");
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const activeTab: AdminTab =
    searchParams.get("tab") ??
    window.localStorage.getItem(ADMIN_ACTIVE_TAB_STORAGE_KEY) ??
    "dashboard";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  const handleBack = () => {
    if (activeTab !== "dashboard") {
      handleTabChange("dashboard");
      return;
    }
    navigate(ROUTE_PATHS.home);
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate(ROUTE_PATHS.loginAdmin, { replace: true });
  };

  const handleTabChange = (tab: AdminTab) => {
    if (tab === "settings") {
      setSettingsInitialTab("commissions");
    }
    window.localStorage.setItem(ADMIN_ACTIVE_TAB_STORAGE_KEY, tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
    setIsMobileNavOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <UserProfile />;
      case "reports":
        return <Reports />;
      case "transactions":
      case "transactionsZambiaProducts":
      case "transactionsZimProducts":
        return <Transactions />;
      case "vouchersZambiaProducts":
        return (
          <AdminFeaturePlaceholder
            title="Vouchers - Zambia Products"
            description="Voucher settlement, retries, and reconciliation for Zambia products will be managed here."
          />
        );
      case "vouchersZimProducts":
        return (
          <AdminFeaturePlaceholder
            title="Vouchers - Zim Products"
            description="Voucher operations for Zimbabwe products will be managed from this module."
          />
        );
      case "rongekaAccounts":
        return (
          <AdminApiModulePage
            key="rongekaAccounts"
            title="Rongeka Accounts"
            description="Live Rongeka accounts from the migrated Angular endpoint."
            endpoint="/v1/rongeka-accounts/all"
            loadData={getAllRongekaAccounts}
          />
        );
      case "billers":
        return (
          <Billers
            onOnboard={() => {
              setSettingsInitialTab("categories");
              handleTabChange("settings");
            }}
          />
        );
      case "products":
        return <Products />;
      case "agents":
        return <Agents />;
      case "users":
      case "userSettingsUsers":
        return <AdminUsersPage />;
      case "userSettingsGroups":
        return <AdminUserGroupsPage />;
      case "messaging":
        return <Messaging />;
      case "smsCharges":
        return (
          <AdminApiModulePage
            key="smsCharges"
            title="SMS Charges"
            description="SMS charge configuration pulled from the backend."
            endpoint="/v1/sms-charges"
            loadData={getAllSmsCharges}
          />
        );
      case "whatsapp":
        return <WhatsAppCenter />;
      case "parametersCurrencies":
        return <AdminParametersPage module="currencies" />;
      case "parametersCountries":
        return <AdminParametersPage module="countries" />;
      case "parametersHolidays":
        return <AdminParametersPage module="holidays" />;
      case "parametersBanks":
        return <AdminParametersPage module="banks" />;
      case "econetBundlePlanTypes":
        return <AdminEconetPage module="bundlePlanTypes" />;
      case "econetDataBundleTypes":
        return <AdminEconetPage module="dataBundleTypes" />;
      case "netoneBundlePlanTypes":
        return (
          <AdminApiModulePage
            key="netoneBundlePlanTypes"
            title="Netone Bundle Plan Types"
            description="Live Netone bundle plan records from backend."
            endpoint="/v1/netone-bundle-plans/all"
            loadData={getAllNetoneBundlePlans}
          />
        );
      case "netoneDataBundleTypes":
        return (
          <AdminApiModulePage
            key="netoneDataBundleTypes"
            title="Netone Data Bundle Types"
            description="Live Netone data bundle type records."
            endpoint="/v1/netone-data-bundle-types/all"
            loadData={getAllNetoneDataBundleTypes}
          />
        );
      case "credentialsPesepay":
        return (
          <AdminApiModulePage
            key="credentialsPesepay"
            title="Pesepay Credentials"
            description="Live Pesepay integration credential records."
            endpoint="/v1/pesepay-integration-credentials/all"
            loadData={getAllPesepayCredentials}
          />
        );
      case "credentialsCgrate":
        return (
          <AdminApiModulePage
            key="credentialsCgrate"
            title="Cgrate Credentials"
            description="Live Cgrate credentials endpoint."
            endpoint="/v1/cgrate/credentials"
            loadData={getAllCgrateCredentials}
          />
        );
      case "credentialsZesa":
        return (
          <AdminApiModulePage
            key="credentialsZesa"
            title="Zesa Credentials"
            description="Live Zesa Esolutions credentials endpoint."
            endpoint="/v1/zesa-esolutions"
            loadData={getAllZesaCredentials}
          />
        );
      case "credentialsEconet":
        return (
          <AdminApiModulePage
            key="credentialsEconet"
            title="Econet Credentials"
            description="Live Econet EVD credentials endpoint."
            endpoint="/v1/econet-evd-integration-credentials/all"
            loadData={getAllEconetCredentials}
          />
        );
      case "credentialsEsolutionsSms":
        return (
          <AdminApiModulePage
            key="credentialsEsolutionsSms"
            title="Esolutions SMS Credentials"
            description="Live Esolutions SMS account credentials endpoint."
            endpoint="/v1/esolutions-sms-account"
            loadData={getAllEsolutionsSmsCredentials}
          />
        );
      case "credentialsNetoneEvd":
        return (
          <AdminApiModulePage
            key="credentialsNetoneEvd"
            title="Netone EVD Credentials"
            description="Live Netone EVD credentials endpoint."
            endpoint="/v1/netone-evd-integration-credentials/all"
            loadData={getAllNetoneEvdCredentials}
          />
        );
      case "credentialsEsolutionsAirtime":
        return (
          <AdminApiModulePage
            key="credentialsEsolutionsAirtime"
            title="Esolutions Airtime Credentials"
            description="Live Esolutions airtime integration credentials endpoint."
            endpoint="/v1/esolution-airtime-integration-credentials/all"
            loadData={getAllEsolutionsAirtimeCredentials}
          />
        );
      case "smsMessages":
        return (
          <AdminApiModulePage
            key="smsMessages"
            title="SMSes"
            description="Live outbound SMS records endpoint."
            endpoint="/v1/sms"
            loadData={getAllSmsMessages}
          />
        );
      case "tuition":
        return (
          <AdminFeaturePlaceholder
            title="Tuition"
            description="Tuition-specific products, settlement flows, and reports can be added in this section."
          />
        );
      case "commissions":
        return (
          <Settings
            faqs={faqs}
            setFaqs={setFaqs}
            initialTab="commissions"
          />
        );
      case "settings":
        return (
          <Settings
            faqs={faqs}
            setFaqs={setFaqs}
            initialTab={settingsInitialTab}
          />
        );
      case "support":
        return <Support />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark animate-in fade-in duration-500">
      <Sidebar
        className="hidden md:flex"
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab as AdminTab)}
        onSignOut={handleLogout}
      />

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-[120] md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-900/35"
            aria-label="Close navigation"
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-neutral-light rounded-b-[2rem] shadow-2xl p-5 pt-6">
            <div className="pb-4 border-b border-neutral-light flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-text">
                Navigation
              </p>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-9 h-9 rounded-xl bg-neutral-light text-neutral-text flex items-center justify-center"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <nav className="pt-4 space-y-1 max-h-[70vh] overflow-y-auto hide-scrollbar">
              {ADMIN_MENU_SECTIONS.map((section) => (
                <div key={section.id} className="space-y-1">
                  {section.title ? (
                    <p className="px-1 text-[10px] font-black uppercase tracking-widest text-neutral-text/60 pt-2">
                      {section.title}
                    </p>
                  ) : null}
                  {section.items.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() =>
                          handleTabChange(
                            (item.children?.length ? item.children[0].id : item.id) as AdminTab,
                          )
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          activeTab === item.id || item.children?.some((child) => child.id === activeTab)
                            ? "bg-primary text-white shadow-lg"
                            : "text-neutral-text hover:bg-neutral-light"
                        }`}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                      </button>
                      {item.children?.length ? (
                        <div className="ml-6 space-y-1 mt-1">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleTabChange(child.id as AdminTab)}
                              className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold ${
                                activeTab === child.id
                                  ? "bg-primary text-white"
                                  : "text-neutral-text hover:bg-neutral-light/50"
                              }`}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}

              <div className="pt-3 pb-1">
                <p className="px-1 text-[10px] font-black uppercase tracking-widest text-neutral-text/60">
                  Preferences
                </p>
              </div>
              {ADMIN_PREFERENCE_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-lg"
                      : "text-neutral-text hover:bg-neutral-light"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 mt-3"
              >
                <span className="material-symbols-outlined">logout</span>
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      ) : null}

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <Header
          onBack={handleBack}
          onProfileClick={() => handleTabChange("profile")}
          showBack={activeTab !== "dashboard"}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
          isMobileNavOpen={isMobileNavOpen}
        />

        <div className="flex-1">{renderContent()}</div>
      </main>
    </div>
  );
}


