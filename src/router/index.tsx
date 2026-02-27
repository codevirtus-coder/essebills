import { createBrowserRouter, type RouteObject, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { EmptyPage } from "../pages/EmptyPage";
import { UnifiedDashboardPage } from "../features/portal/UnifiedDashboardPage";
import { PortalProfilePage } from "../features/portal/PortalProfilePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { BuyerRegisterPage } from "../pages/BuyerRegisterPage";
import { PaymentCheckoutPage } from "../pages/PaymentCheckoutPage";
import { AgentRegisterPage } from "../pages/AgentRegisterPage";
import { BillerRegisterPage } from "../pages/BillerRegisterPage";
import { AdminAccessRequestPage } from "../pages/AdminAccessRequestPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RequireAuth } from "./RequireAuth";
import { ROUTE_PATHS } from "./paths";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

const routes: RouteObject[] = [
  {
    path: "/checkout",
    element: <PaymentCheckoutPage />,
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
        element: <EmptyPage />,
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
      {
        path: "portal",
        element: <RequireAuth redirectTo={ROUTE_PATHS.login} />,
        children: [
          {
            index: true,
            element: <UnifiedDashboardPage />,
          },
          {
            path: "profile",
            element: <PortalProfilePage />,
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

