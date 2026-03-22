import { useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";

export function DashboardLayout() {
  const { group } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If no group yet (loading), show a basic loading state
  if (!group) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine active tab: URL param takes precedence, then query param
  const activeTab = urlTab || searchParams.get("tab") || "dashboard";

  // Base portal path (e.g. /portal-admin) derived from current pathname
  const basePath = "/" + location.pathname.split("/").filter(Boolean)[0];

  const handleTabChange = (tab: string) => {
    // Navigate to absolute path with tab as path parameter
    if (tab === 'dashboard' || tab === 'overview') {
      navigate(basePath, { replace: true });
    } else {
      navigate(`${basePath}/${tab}`, { replace: true });
    }
    setIsMobileNavOpen(false);
  };

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <DashboardSidebar
          group={group}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[120] md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-900/35"
            aria-label="Close navigation"
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-neutral-light rounded-b-[2rem] shadow-2xl p-5 pt-6 max-h-[90vh] overflow-y-auto">
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
            <div className="pt-4">
              <DashboardSidebar
                group={group}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                className="border-none w-full shadow-none"
                disableCollapse
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onToggleMobileNav={handleToggleMobileNav}
          isMobileNavOpen={isMobileNavOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
