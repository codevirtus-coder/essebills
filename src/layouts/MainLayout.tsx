import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.setItem("theme", "light");
  }, []);

  const isPortalRoute =
    pathname.startsWith("/biller") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login/biller") ||
    pathname.startsWith("/login/agent") ||
    pathname.startsWith("/login/admin");

  return (
    <div className="app-shell">
      {!isPortalRoute ? <Navbar /> : null}
      <Outlet />
      {!isPortalRoute ? <Footer /> : null}
    </div>
  );
}
