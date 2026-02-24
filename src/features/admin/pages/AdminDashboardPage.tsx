import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import UserProfile from "../components/UserProfile";
import Reports from "../components/Reports";
import Billers from "../components/Billers";
import Products from "../components/Products";
import Agents from "../components/Agents";
import AdminUsersPage from "../components/AdminUsersPage";
import AdminEconetPage from "../components/AdminEconetPage";
import AdminStyledApiModulePage from "../components/AdminStyledApiModulePage";
import AdminVouchersPage from "../components/AdminVouchersPage";
import AdminTransactionsPage from "../components/AdminTransactionsPage";
import AdminParametersPage from "../components/AdminParametersPage";
import AdminUserGroupsPage from "../components/AdminUserGroupsPage";
import Settings from "../components/Settings";
import Support from "../components/Support";
import Messaging from "../components/Messaging";
import WhatsAppCenter from "../components/WhatsAppCenter";
import {
  createSmsCharge,
  createSmsMessage,
  createRongekaAccount,
  createCgrateCredentials,
  createEconetCredentials,
  createEsolutionsAirtimeCredentials,
  createEsolutionsSmsCredentials,
  createNetoneEvdCredentials,
  createPesepayCredentials,
  createZesaCredentials,
  getAllCgrateCredentials,
  getAllEconetCredentials,
  getAllEsolutionsAirtimeCredentials,
  getAllHolidays,
  getAllNetoneEvdCredentials,
  getAllPesepayCredentials,
  getAllRongekaAccounts,
  getAllSmsCharges,
  getAllSmsMessages,
  getAllZesaCredentials,
  getAllEsolutionsSmsCredentials,
  getAllTuitionTransactions,
  getAllTuitionInstitutions,
  createTuitionInstitution,
  getAllTuitionFeeTypes,
  createTuitionFeeType,
  getAllTuitionProcessingFees,
  createTuitionProcessingFee,
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
        return <AdminTransactionsPage region="zambia" />;
      case "transactionsZambiaProducts":
        return <AdminTransactionsPage region="zambia" />;
      case "transactionsZimProducts":
        return <AdminTransactionsPage region="zim" />;
      case "vouchersZambiaProducts":
        return <AdminVouchersPage region="zambia" />;
      case "vouchersZimProducts":
        return <AdminVouchersPage region="zim" />;
      case "rongekaAccounts":
        return (
          <AdminStyledApiModulePage
            key="rongekaAccounts"
            title="Rongeka Accounts"
            description="Live Rongeka accounts from the migrated Angular endpoint."
            endpoint="/v1/rongeka-accounts/all"
            createEndpoint="/v1/rongeka-accounts"
            createData={createRongekaAccount}
            tableMode="auto"
            createMode="fields"
            columns={[
              { key: "accountName", label: "Account Name" },
              { key: "bank", label: "Bank" },
              { key: "accountNumber", label: "Account Number" },
              { key: "createdDate", label: "Created on" },
            ]}
            createFields={[
              { key: "accountName", label: "Account Name", type: "text" },
              { key: "bank", label: "Bank", type: "text" },
              { key: "accountNumber", label: "Account Number", type: "text" },
            ]}
            emptyLabel="RongekaAccounts"
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
          <AdminStyledApiModulePage
            key="smsCharges"
            title="SMS Charges"
            description="SMS charge configuration pulled from the backend."
            endpoint="/v1/sms-charges"
            createEndpoint="/v1/sms-charges"
            createData={createSmsCharge}
            tableMode="auto"
            createMode="fields"
            columns={[
              { key: "name", label: "Name" },
              { key: "amount", label: "Amount" },
              { key: "createdDate", label: "Created on" },
            ]}
            createFields={[
              { key: "name", label: "Name", type: "text" },
              { key: "amount", label: "Amount", type: "number" },
              { key: "active", label: "Active", type: "checkbox" },
            ]}
            emptyLabel="SmsCharges"
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
        return <AdminEconetPage provider="econet" module="bundlePlanTypes" />;
      case "econetDataBundleTypes":
        return <AdminEconetPage provider="econet" module="dataBundleTypes" />;
      case "netoneBundlePlanTypes":
        return <AdminEconetPage provider="netone" module="bundlePlanTypes" />;
      case "netoneDataBundleTypes":
        return <AdminEconetPage provider="netone" module="dataBundleTypes" />;
      case "credentialsPesepay":
        return (
          <AdminStyledApiModulePage
            key="credentialsPesepay"
            title="Pesepay Credentials"
            description="Live Pesepay integration credential records."
            endpoint="/v1/pesepay-integration-credentials/all"
            createEndpoint="/v1/pesepay-integration-credentials"
            createData={createPesepayCredentials}
            loadData={getAllPesepayCredentials}
          />
        );
      case "credentialsCgrate":
        return (
          <AdminStyledApiModulePage
            key="credentialsCgrate"
            title="Cgrate Credentials"
            description="Live Cgrate credentials endpoint."
            endpoint="/v1/cgrate/credentials"
            createEndpoint="/v1/cgrate/credentials"
            createData={createCgrateCredentials}
            loadData={getAllCgrateCredentials}
          />
        );
      case "credentialsZesa":
        return (
          <AdminStyledApiModulePage
            key="credentialsZesa"
            title="Zesa Credentials"
            description="Live Zesa Esolutions credentials endpoint."
            endpoint="/v1/zesa-esolutions"
            createEndpoint="/v1/zesa-esolutions"
            createData={createZesaCredentials}
            loadData={getAllZesaCredentials}
          />
        );
      case "credentialsEconet":
        return (
          <AdminStyledApiModulePage
            key="credentialsEconet"
            title="Econet Credentials"
            description="Live Econet EVD credentials endpoint."
            endpoint="/v1/econet-evd-integration-credentials/all"
            createEndpoint="/v1/econet-evd-integration-credentials"
            createData={createEconetCredentials}
            loadData={getAllEconetCredentials}
          />
        );
      case "credentialsEsolutionsSms":
        return (
          <AdminStyledApiModulePage
            key="credentialsEsolutionsSms"
            title="Esolutions SMS Credentials"
            description="Live Esolutions SMS account credentials endpoint."
            endpoint="/v1/esolutions-sms-account"
            createEndpoint="/v1/esolutions-sms-account"
            createData={createEsolutionsSmsCredentials}
            loadData={getAllEsolutionsSmsCredentials}
          />
        );
      case "credentialsNetoneEvd":
        return (
          <AdminStyledApiModulePage
            key="credentialsNetoneEvd"
            title="Netone EVD Credentials"
            description="Live Netone EVD credentials endpoint."
            endpoint="/v1/netone-evd-integration-credentials/all"
            createEndpoint="/v1/netone-evd-integration-credentials"
            createData={createNetoneEvdCredentials}
            loadData={getAllNetoneEvdCredentials}
          />
        );
      case "credentialsEsolutionsAirtime":
        return (
          <AdminStyledApiModulePage
            key="credentialsEsolutionsAirtime"
            title="Esolutions Airtime Credentials"
            description="Live Esolutions airtime integration credentials endpoint."
            endpoint="/v1/esolution-airtime-integration-credentials/all"
            createEndpoint="/v1/esolution-airtime-integration-credentials"
            createData={createEsolutionsAirtimeCredentials}
            loadData={getAllEsolutionsAirtimeCredentials}
          />
        );
      case "smsMessages":
        return (
          <AdminStyledApiModulePage
            key="smsMessages"
            title="SMSes"
            description="Live outbound SMS records endpoint."
            endpoint="/v1/sms"
            createEndpoint="/v1/sms"
            createData={createSmsMessage}
            tableMode="auto"
            createMode="fields"
            columns={[
              { key: "phoneNumber", label: "Phone Number" },
              { key: "message", label: "Message" },
              { key: "createdDate", label: "Created on" },
            ]}
            createFields={[
              { key: "phoneNumber", label: "Phone Number", type: "text" },
              { key: "message", label: "Message", type: "text" },
            ]}
            emptyLabel="Smses"
            loadData={getAllSmsMessages}
          />
        );
      case "tuition":
      case "tuitionTransactions":
        return (
          <AdminStyledApiModulePage
            key="tuitionTransactions"
            title="Tuition"
            icon="shopping_bag"
            description="Tuition Transaction"
            endpoint="/v1/institution-transactions"
            showCreateButton={false}
            columns={[
              { key: "amount", label: "Name" },
              { key: "institution.name", label: "InstitutionName" },
              { key: "beneficiaryName", label: "BeneficiaryName" },
              { key: "paymentTransaction.paymentStatus", label: "Status" },
              { key: "createdDate", label: "Created on" },
            ]}
            emptyLabel="TuitionTransactions"
            loadData={getAllTuitionTransactions}
          />
        );
      case "tuitionInstitutions":
        return (
          <AdminStyledApiModulePage
            key="tuitionInstitutions"
            title="Institutions"
            icon="account_balance"
            description=""
            endpoint="/v1/institutions/all"
            createEndpoint="/v1/institutions"
            createData={createTuitionInstitution}
            tableMode="auto"
            createMode="json"
            columns={[
              { key: "name", label: "Name" },
              { key: "institutionCode", label: "Code" },
              { key: "institutionType", label: "Type" },
              { key: "location", label: "Location" },
              { key: "percentageSettlementDiscount", label: "% Settlement Discount" },
            ]}
            loadData={getAllTuitionInstitutions}
          />
        );
      case "tuitionFeeTypes":
        return (
          <AdminStyledApiModulePage
            key="tuitionFeeTypes"
            title="Fee Types"
            icon="shopping_bag"
            description="Fee Types"
            endpoint="/v1/fee-types/all"
            createEndpoint="/v1/fee-types"
            createData={createTuitionFeeType}
            tableMode="auto"
            createMode="json"
            columns={[
              { key: "name", label: "Name" },
              { key: "createdBy", label: "CreatedBy" },
              { key: "createdDate", label: "CreatedOn" },
            ]}
            emptyLabel="feeTypes"
            loadData={getAllTuitionFeeTypes}
          />
        );
      case "tuitionProcessingFees":
        return (
          <AdminStyledApiModulePage
            key="tuitionProcessingFees"
            title="Tuition Processing Fees"
            icon="account_balance"
            description=""
            endpoint="/v1/tuition-processing-fees/all"
            createEndpoint="/v1/tuition-processing-fees"
            createData={createTuitionProcessingFee}
            tableMode="auto"
            createMode="json"
            columns={[
              { key: "name", label: "Name" },
              { key: "currencyCode", label: "Currency Code" },
              { key: "effectiveRangeMinimum", label: "Effective Range Minimum" },
              { key: "effectiveRangeMaximum", label: "Effective Range Maximum" },
              { key: "fixedChargeAmount", label: "Fixed Charge Amount" },
              { key: "percentageIncrement", label: "Percentage Increment" },
            ]}
            loadData={getAllTuitionProcessingFees}
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


