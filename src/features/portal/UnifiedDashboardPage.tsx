import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../auth/useCurrentUser";
import { getDashboardRouteByGroup } from "../../router/paths";
import type { UserGroup } from "../auth/dto/auth.dto";

export function UnifiedDashboardPage() {
  const { group, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-text">
        Loading dashboard...
      </div>
    );
  }

  if (group) {
    // Redirect to the group-specific dashboard
    return <Navigate to={getDashboardRouteByGroup(group)} replace />;
  }

  // No group - redirect to home
  return <Navigate to="/" replace />;
}
