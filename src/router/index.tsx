import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { HomePage } from '../pages/HomePage'
import { EmptyPage } from '../pages/EmptyPage'
import { BillerDashboardPage } from '../features/biller/pages/BillerDashboardPage'
import { AgentDashboardPage } from '../features/agent/pages/AgentDashboardPage'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'
import { BillerLoginPage } from '../features/biller/pages/BillerLoginPage'
import { AgentLoginPage } from '../features/agent/pages/AgentLoginPage'
import { AdminLoginPage } from '../features/admin/pages/AdminLoginPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { AgentRegisterPage } from '../pages/AgentRegisterPage'
import { BillerRegisterPage } from '../pages/BillerRegisterPage'
import { AdminAccessRequestPage } from '../pages/AdminAccessRequestPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RequireAuth } from './RequireAuth'
import { ROUTE_PATHS } from './paths'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'services',
        element: <EmptyPage />,
      },
      {
        path: 'biller',
        element: <RequireAuth redirectTo={ROUTE_PATHS.loginBiller} allowedRoles={['BILLER']} />,
        children: [
          {
            index: true,
            element: <BillerDashboardPage />,
          },
        ],
      },
      {
        path: 'agent',
        element: <RequireAuth redirectTo={ROUTE_PATHS.loginAgent} allowedRoles={['AGENT']} />,
        children: [
          {
            index: true,
            element: <AgentDashboardPage />,
          },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth redirectTo={ROUTE_PATHS.loginAdmin} allowedRoles={['ADMIN']} />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
        ],
      },
      {
        path: 'buyer',
        element: <EmptyPage />,
      },
      {
        path: 'login/biller',
        element: <BillerLoginPage />,
      },
      {
        path: 'login/agent',
        element: <AgentLoginPage />,
      },
      {
        path: 'login/admin',
        element: <AdminLoginPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'register/agent',
        element: <AgentRegisterPage />,
      },
      {
        path: 'register/biller',
        element: <BillerRegisterPage />,
      },
      {
        path: 'register/admin',
        element: <AdminAccessRequestPage />,
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
