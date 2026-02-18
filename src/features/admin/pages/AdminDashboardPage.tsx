import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import UserProfile from "../components/UserProfile";
import Reports from "../components/Reports";
import Transactions from "../components/Transactions";
import Billers from "../components/Billers";
import Agents from "../components/Agents";
import Users from "../components/Users";
import Settings from "../components/Settings";
import Support from "../components/Support";
import Messaging from "../components/Messaging";
import { INITIAL_FAQS } from "../data/constants";
import type { FAQItem } from "../data/types";
import { clearAuthToken } from "../../auth/auth.storage";
import { ROUTE_PATHS } from "../../../router/paths";
import "../styles/admin-dashboard.css";

type AdminTab =
  | "dashboard"
  | "transactions"
  | "billers"
  | "agents"
  | "commissions"
  | "users"
  | "messaging"
  | "reports"
  | "profile"
  | "settings"
  | "support";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [settingsInitialTab, setSettingsInitialTab] = useState<string>("commissions");
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  const handleBack = () => {
    if (activeTab !== "dashboard") {
      setActiveTab("dashboard");
      return;
    }
    navigate(ROUTE_PATHS.home);
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate(ROUTE_PATHS.loginAdmin, { replace: true });
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
        return <Transactions />;
      case "billers":
        return (
          <Billers
            onOnboard={() => {
              setSettingsInitialTab("categories");
              setActiveTab("settings");
            }}
          />
        );
      case "agents":
        return <Agents />;
      case "users":
        return <Users />;
      case "messaging":
        return <Messaging />;
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
        activeTab={activeTab}
        setActiveTab={(tab) => {
          const next = tab as AdminTab;
          if (next === "settings") {
            setSettingsInitialTab("commissions");
          }
          setActiveTab(next);
        }}
        onSignOut={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <Header
          onBack={handleBack}
          onProfileClick={() => setActiveTab("profile")}
          showBack={activeTab !== "dashboard"}
        />

        <div className="flex-1">{renderContent()}</div>
      </main>
    </div>
  );
}
