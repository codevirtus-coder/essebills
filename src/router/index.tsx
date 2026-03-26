import { createBrowserRouter, type RouteObject, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { HomePage } from "../features/landing/pages/HomePage";

import { UnifiedDashboardPage } from "../features/portal/UnifiedDashboardPage";
import { PortalProfilePage } from "../features/portal/PortalProfilePage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { BuyerRegisterPage } from "../features/auth/pages/BuyerRegisterPage";
import { PaymentCheckoutPage } from "../features/landing/pages/PaymentCheckoutPage";
import { PaymentReturnPage } from "../features/landing/pages/PaymentReturnPage";
import { ServicesPage } from "../features/landing/pages/ServicesPage";
import { AgentRegisterPage } from "../features/auth/pages/AgentRegisterPage";
import { BillerRegisterPage } from "../features/auth/pages/BillerRegisterPage";
import { AdminAccessRequestPage } from "../features/auth/pages/AdminAccessRequestPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RequireAuth } from "./RequireAuth";
import { ROUTE_PATHS } from "./paths";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

// Dashboard pages
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { AgentDashboardPage } from "../features/agent/pages/AgentDashboardPage";
import { BillerDashboardPage } from "../features/biller/pages/BillerDashboardPage";
import { CustomerDashboardPage } from "../features/customer/pages/CustomerDashboardPage";
import { NotificationsPage } from "../pages/NotificationsPage";

const routes: RouteObject[] = [
  {
    path: "/checkout",
    element: <PaymentCheckoutPage />,
  },
  {
    path: "/payment/return",
    element: <PaymentReturnPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "services",
        element: <ServicesPage />,
      },
      {
        path: "biller",
        element: <Navigate to={ROUTE_PATHS.portal} replace />,
      },
      {
        path: "agent",
        element: <Navigate to={ROUTE_PATHS.portal} replace />,
      },
      {
        path: "admin",
        element: <Navigate to={ROUTE_PATHS.portal} replace />,
      },
      // Unified portal routes (without shell, for simple redirects)
      {
        path: "portal",
        element: <RequireAuth redirectTo={ROUTE_PATHS.login} />,
        children: [
          {
            index: true,
            element: <UnifiedDashboardPage />,
          },
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "profile",
                element: <PortalProfilePage />,
              },
            ],
          },
        ],
      },
      // Admin dashboard - uses DashboardLayout with group guard
      {
        path: "portal-admin",
        element: <RequireAuth redirectTo={ROUTE_PATHS.login} allowedGroups={['ADMIN']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboardPage />,
              },
              {
                path: "notifications",
                element: <NotificationsPage />,
              },
              {
                path: ":tab",
                element: <AdminDashboardPage />,
              },
            ],
          },
        ],
      },
      // Agent dashboard - uses DashboardLayout with group guard
      {
        path: "portal-agent",
        element: <RequireAuth redirectTo={ROUTE_PATHS.login} allowedGroups={['AGENT']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <AgentDashboardPage />,
              },
              {
                path: "notifications",
                element: <NotificationsPage />,
              },
              {
                path: ":tab",
                element: <AgentDashboardPage />,
              },
            ],
          },
        ],
      },
      // Biller dashboard - uses DashboardLayout with group guard
      {
        path: "portal-biller",
        element: <RequireAuth redirectTo={ROUTE_PATHS.login} allowedGroups={['BILLER']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <BillerDashboardPage />,
              },
              {
                path: "notifications",
                element: <NotificationsPage />,
              },
              {
                path: ":tab",
                element: <BillerDashboardPage />,
              },
            ],
          },
        ],
      },
      // Customer dashboard - uses DashboardLayout with group guard
      {
        path: "portal-customer",
        element: <RequireAuth redirectTo={ROUTE_PATHS.login} allowedGroups={['CUSTOMER']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <CustomerDashboardPage />,
              },
              {
                path: "notifications",
                element: <NotificationsPage />,
              },
              {
                path: ":tab",
                element: <CustomerDashboardPage />,
              },
            ],
          },
        ],
      },
      {
        path: "buyer",
        element: <LoginPage />,
      },
      {
        path: "login/biller",
        element: <LoginPage />,
      },
      {
        path: "login/agent",
        element: <LoginPage />,
      },
      {
        path: "login/admin",
        element: <LoginPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "forgot-password/:portal",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "reset-password/:portal",
        element: <ResetPasswordPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "register/buyer",
        element: <BuyerRegisterPage />,
      },
      {
        path: "register/agent",
        element: <AgentRegisterPage />,
      },
      {
        path: "register/biller",
        element: <BillerRegisterPage />,
      },
      {
        path: "register/admin",
        element: <AdminAccessRequestPage />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
