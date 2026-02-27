import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../auth/useCurrentUser";
import { AdminDashboardPage } from "../admin/pages/AdminDashboardPage";
import { AgentDashboardPage } from "../agent/pages/AgentDashboardPage";
import { BillerDashboardPage } from "../biller/pages/BillerDashboardPage";
import { CustomerDashboardPage } from "../customer/pages/CustomerDashboardPage";
import { ROUTE_PATHS } from "../../router/paths";

export function UnifiedDashboardPage() {
  const { group, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-text">
        Loading dashboard...
      </div>
    );
  }

  switch (group) {
    case "ADMIN":
      return <AdminDashboardPage />;
    case "AGENT":
      return <AgentDashboardPage />;
    case "BILLER":
      return <BillerDashboardPage />;
    case "CUSTOMER":
      return <CustomerDashboardPage />;
    default:
      return <Navigate to={ROUTE_PATHS.home} replace />;
  }
}
