import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

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
    pathname.startsWith("/portal") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {!isPortalRoute ? <Navbar /> : null}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isPortalRoute ? <Footer /> : null}
    </div>
  );
}
