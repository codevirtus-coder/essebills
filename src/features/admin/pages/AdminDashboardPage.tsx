import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
// New custom pages for missing features
import ZambiaProductsTransactions from "../components/ZambiaProductsTransactions";
import ZimProductsTransactions from "../components/ZimProductsTransactions";
import RongekaAccounts from "../components/RongekaAccounts";
import NetoneBundlePlans from "../components/NetoneBundlePlans";
import NetoneDataBundles from "../components/NetoneDataBundles";
import TuitionInstitutions from "../components/TuitionInstitutions";
import TuitionFeeTypes from "../components/TuitionFeeTypes";
import TuitionProcessingFees from "../components/TuitionProcessingFees";
import {
  createSmsCharge,
  createSmsMessage,
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
  getAllNetoneEvdCredentials,
  getAllPesepayCredentials,
  getAllSmsCharges,
  getAllSmsMessages,
  getAllZesaCredentials,
  getAllEsolutionsSmsCredentials,
  getAllTuitionTransactions,
} from "../services";
import { INITIAL_FAQS } from "../data/constants";
import type { FAQItem } from "../data/types";
import { ROUTE_PATHS } from "../../../router/paths";
import "../styles/admin-dashboard.css";

type AdminTab = string;
const ADMIN_ACTIVE_TAB_STORAGE_KEY = "admin_active_tab";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsInitialTab, setSettingsInitialTab] = useState<string>("commissions");
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Support both URL params and query params for backwards compatibility
  const activeTab: AdminTab = urlTab || searchParams.get("tab") || "dashboard";

  useEffect(() => {
    // Sync URL params if coming from old routing
    if (!urlTab && !searchParams.get("tab")) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams, urlTab]);

  const handleTabChange = (tab: AdminTab) => {
    if (tab === "settings") {
      setSettingsInitialTab("commissions");
    }
    window.localStorage.setItem(ADMIN_ACTIVE_TAB_STORAGE_KEY, tab);
    
    // Navigate with URL params
    if (tab === "dashboard") {
      navigate("/portal-admin");
    } else {
      navigate(`/portal-admin/${tab}`);
    }
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
        return <ZambiaProductsTransactions />;
      case "transactionsZimProducts":
        return <ZimProductsTransactions />;
      case "vouchersZambiaProducts":
        return <AdminVouchersPage region="zambia" />;
      case "vouchersZimProducts":
        return <AdminVouchersPage region="zim" />;
      case "rongekaAccounts":
        return <RongekaAccounts />;
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
        return <NetoneBundlePlans />;
      case "netoneDataBundleTypes":
        return <NetoneDataBundles />;
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
        return <TuitionInstitutions />;
      case "tuitionFeeTypes":
        return <TuitionFeeTypes />;
      case "tuitionProcessingFees":
        return <TuitionProcessingFees />;
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

  // Only render content - the shell is now provided by DashboardLayout
  return (
    <div className="animate-in fade-in duration-500">
      {renderContent()}
    </div>
  );
}
