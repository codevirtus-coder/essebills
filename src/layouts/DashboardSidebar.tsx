import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  UserCircle,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import {
  getMenuByGroup,
  ADMIN_PREFERENCE_ITEMS,
  type MenuItem,
} from "../features/portal/menuConfig";
import Logo from "../components/ui/Logo";
import { Icon } from "../components/ui/Icon";
import { ROUTE_PATHS } from "../router/paths";
import type { UserGroup } from "../features/auth/dto/auth.dto";
import { clearAuthSession } from "../features/auth/auth.storage";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { cn } from "../lib/utils";

interface DashboardSidebarProps {
  group: UserGroup;
  activeTab: string;
  onTabChange?: (tab: string) => void;
  className?: string;
  /** When true, hides the collapse toggle (e.g. in the mobile overlay) */
  disableCollapse?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({
  group,
  activeTab,
  onTabChange,
  className = "",
  disableCollapse = false,
  isMobile = false,
  onClose,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { profile, group: userGroup } = useCurrentUser();
  const navRef = useRef<HTMLElement>(null);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (disableCollapse || isMobile) return false;
    try {
      return localStorage.getItem("sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar-collapsed", String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const menuSections = useMemo(() => getMenuByGroup(group), [group]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      el.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("is-scrolling"), 800);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (collapsed) {
      const allCollapsed: Record<string, boolean> = {};
      menuSections.forEach((section) => {
        allCollapsed[section.id] = true;
      });
      setCollapsedSections(allCollapsed);
    }
  }, [collapsed, menuSections]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (onTabChange) {
      onTabChange(item.id);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSignOut = () => {
    clearAuthSession();
    navigate(ROUTE_PATHS.login);
  };

  const initials =
    [profile?.firstName?.[0], profile?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.username ||
    "User";
  const displayRole = userGroup ?? group;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className={cn(
        "flex flex-col h-full bg-slate-900 text-white transition-all duration-300 relative z-50 border-r border-slate-800",
        collapsed ? "items-center" : "items-stretch",
        isMobile && "fixed left-0 top-0 bottom-0 w-72 shadow-2xl",
        className,
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "p-4 mb-2 flex items-center",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? (
          <Link
            to={ROUTE_PATHS.home}
            className="flex items-center gap-2 overflow-hidden"
          >
            <Logo className="h-9 w-auto brightness-0 invert opacity-95" />
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <LayoutDashboard size={20} className="text-white" />
          </div>
        )}

        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <nav
        ref={navRef}
        className="flex-1 px-3 py-2 overflow-y-auto sidenav-scroll space-y-6"
      >
        {menuSections.map((section) => {
          const isSectionCollapsed = collapsedSections[section.id];

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              {section.title &&
                (collapsed ? (
                  <div className="flex justify-center py-2 mb-1 border-b border-white/5 opacity-20" />
                ) : (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-3 pb-2 mb-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-between hover:text-emerald-400 transition-colors"
                  >
                    {section.title}
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform duration-200",
                        isSectionCollapsed && "-rotate-90",
                      )}
                    />
                  </button>
                ))}

              <AnimatePresence initial={false}>
                {!isSectionCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const isActive =
                        activeTab === item.id ||
                        (item.path &&
                          window.location.pathname.includes(item.path));

                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => handleItemClick(item)}
                            className={cn(
                              "sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50",
                              collapsed && "justify-center px-0",
                            )}
                            title={collapsed ? item.label : undefined}
                          >
                            <Icon
                              name={item.icon}
                              size={20}
                              className={isActive ? "text-white" : ""}
                            />
                            {!collapsed && (
                              <span className="flex-1 text-left">
                                {item.label}
                              </span>
                            )}
                          </button>

                          {/* Nested Items */}
                          {!collapsed && item.children && (
                            <div className="ml-9 mt-1 space-y-1 border-l border-slate-800 pl-3">
                              {item.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => handleItemClick(child)}
                                  className={cn(
                                    "w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors",
                                    activeTab === child.id
                                      ? "text-emerald-400 font-semibold"
                                      : "text-slate-500 hover:text-slate-300",
                                  )}
                                >
                                  {child.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Preferences Section for Admin */}
        {group === "ADMIN" && !collapsed && (
          <div className="pt-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Preferences
            </div>
            {ADMIN_PREFERENCE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === item.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30",
                )}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* User & Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <UserCircle className="text-emerald-500" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                {displayRole}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20"
              title={displayName}
            >
              <UserCircle className="text-emerald-500" size={24} />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={handleSignOut}
            className={cn(
              "sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Floating Toggle Button (Desktop) */}
      {!isMobile && !disableCollapse && (
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/40 border-2 border-slate-900 hover:scale-110 transition-transform z-50"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </motion.aside>
  );
}
