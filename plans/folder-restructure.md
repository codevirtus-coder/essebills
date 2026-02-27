# EseBills Web — Folder Restructure & Unified Portal Plan

## Problem Summary

The current `src/` directory has **significant duplication and scattered concerns** across 10+ top-level directories. The same components (Logo, StatCard, NotificationMenu) are duplicated 3-4 times. Auth logic is split across `src/lib/`, `src/services/`, `src/features/auth/`, and `src/auth/`. Multiple empty stub directories exist. Landing page components sit in a flat `src/components/` alongside dashboard-specific code.

Additionally, each role (Admin, Agent, Biller, Customer) has its **own separate dashboard shell** with duplicated sidebar, header, and navigation logic. These should be unified into a single `DashboardLayout` where the sidebar menu is driven by `user.group.name` from the user profile API.

---

## Part 1: Duplication Inventory

### 1. Logo Component — 4 copies
| File | Status |
|------|--------|
| `src/components/ui/Logo.tsx` | **Canonical** — actual implementation |
| `src/features/admin/components/Logo.tsx` | Dead code + re-export shim |
| `src/features/agent/components/Logo.tsx` | Dead code + re-export shim |
| `src/features/biller/components/BillerLogo.tsx` | Wrapper around canonical Logo |

### 2. StatCard Component — 4 copies
| File | Status |
|------|--------|
| `src/components/ui/StatCard.tsx` | **Canonical** — actual implementation |
| `src/features/admin/components/StatCard.tsx` | Dead code + re-export shim |
| `src/features/agent/components/StatCard.tsx` | Dead code + re-export shim |
| `src/features/biller/components/BillerStatCard.tsx` | Dead code + re-export shim |

### 3. NotificationMenu Component — 4 copies
| File | Status |
|------|--------|
| `src/components/ui/NotificationMenu.tsx` | **Canonical** — actual implementation |
| `src/features/admin/components/NotificationMenu.tsx` | Re-export shim only |
| `src/features/agent/components/NotificationMenu.tsx` | Dead code + re-export shim |
| `src/features/biller/components/BillerNotificationMenu.tsx` | Dead code + re-export shim |

### 4. Dashboard Shell — 3 separate implementations
| Feature | Sidebar | Header | Navigation |
|---------|---------|--------|------------|
| Admin | `Sidebar.tsx` component | `Header.tsx` component | `ADMIN_MENU_SECTIONS` constant |
| Agent | Inline in `AgentDashboardPage.tsx` | Inline in `AgentDashboardPage.tsx` | `navItems` array inline |
| Biller | Inline in `BillerDashboardPage.tsx` | Inline in `BillerDashboardPage.tsx` | Inline nav items |

### 5. Auth Storage — 2 locations
| File | Status |
|------|--------|
| `src/lib/auth.storage.ts` | **Canonical** — actual implementation |
| `src/features/auth/auth.storage.ts` | Re-export shim |

### 6. Auth Service — 2 locations
| File | Status |
|------|--------|
| `src/services/auth.service.ts` | **Canonical** — actual implementation |
| `src/features/auth/auth.service.ts` | Re-export shim |

### 7. Auth Hooks — 2 locations each
| File | Status |
|------|--------|
| `src/lib/hooks/auth.hooks.ts` | **Canonical** |
| `src/features/auth/auth.hooks.ts` | Re-export shim |
| `src/lib/hooks/useCurrentUser.ts` | **Canonical** |
| `src/features/auth/useCurrentUser.ts` | Re-export shim |

### 8. Empty/Stub Directories (no files) — 14 directories
`src/auth/`, `src/portal/`, `src/shared/styles/`, `src/components/admin/data/`, `src/components/agent/`, `src/components/biller/`, `src/components/shared/`, `src/pages/admin/`, `src/pages/agent/`, `src/pages/biller/`, `src/pages/customer/`, `src/services/admin/dto/`, `src/services/agent/`, `src/services/biller/`

---

## Part 2: Unified Portal Architecture

### Current Problem
Each role has its own monolithic dashboard page (~20K-47K chars each) that embeds its own sidebar, header, navigation, and tab-switching logic. This means:
- 3 separate sidebar implementations
- 3 separate header implementations  
- 3 separate mobile nav implementations
- No shared route guards by group

### Proposed Solution: Single DashboardLayout

```mermaid
flowchart TD
    subgraph Router
        R1[/portal] --> RG{RequireAuth}
        RG -->|authenticated| DL[DashboardLayout]
        RG -->|not authenticated| LOGIN[/login]
    end

    subgraph DashboardLayout
        DL --> SIDEBAR[Sidebar]
        DL --> HEADER[Header]
        DL --> OUTLET[Outlet - renders child route]
    end

    subgraph SidebarLogic
        SIDEBAR --> HOOK[useCurrentUser]
        HOOK -->|group.name| CONFIG[getMenuByGroup]
        CONFIG -->|ADMIN| AM[Admin Menu Items]
        CONFIG -->|AGENT| AGM[Agent Menu Items]
        CONFIG -->|BILLER| BM[Biller Menu Items]
        CONFIG -->|CUSTOMER| CM[Customer Menu Items]
    end

    subgraph ChildRoutes
        OUTLET -->|/portal| UDP[UnifiedDashboardPage - redirects by group]
        OUTLET -->|/portal/admin/*| ADMIN_PAGES[Admin feature pages]
        OUTLET -->|/portal/agent/*| AGENT_PAGES[Agent feature pages]
        OUTLET -->|/portal/biller/*| BILLER_PAGES[Biller feature pages]
        OUTLET -->|/portal/customer/*| CUSTOMER_PAGES[Customer feature pages]
        OUTLET -->|/portal/profile| PROFILE[Shared Profile Page]
    end
```

### Route Guard Strategy

The `RequireAuth` component will be enhanced to accept `allowedGroups`:

```
/portal                    → RequireAuth (any authenticated user)
/portal/admin/*            → RequireAuth + allowedGroups: ADMIN
/portal/agent/*            → RequireAuth + allowedGroups: AGENT
/portal/biller/*           → RequireAuth + allowedGroups: BILLER
/portal/customer/*         → RequireAuth + allowedGroups: CUSTOMER
/portal/profile            → RequireAuth (any authenticated user)
```

The guard reads `user.group.name` from the profile endpoint `/v1/users/profile`:
```json
{
  "group": {
    "name": "AGENT"
  }
}
```

If a user tries to access a route not matching their group, they get redirected to their own dashboard.

### Menu Configuration by Group

A single `menuConfig.ts` file will define menus per group:

```typescript
type MenuItem = {
  id: string
  label: string
  icon: string
  path: string
  children?: MenuItem[]
}

type MenuSection = {
  id: string
  title?: string
  items: MenuItem[]
}

// Each group gets its own menu sections
const ADMIN_MENU: MenuSection[] = [...]   // Full admin menu
const AGENT_MENU: MenuSection[] = [...]   // Agent-specific menu
const BILLER_MENU: MenuSection[] = [...]  // Biller-specific menu
const CUSTOMER_MENU: MenuSection[] = [...] // Customer-specific menu

function getMenuByGroup(group: UserGroup): MenuSection[]
```

### DashboardLayout Component

A single shared layout at `src/layouts/DashboardLayout.tsx`:
- Shared `Sidebar` driven by `getMenuByGroup(user.group.name)`
- Shared `Header` with notification menu, profile avatar, mobile nav toggle
- `<Outlet />` for rendering the active feature page
- Mobile responsive sidebar overlay

---

## Part 3: Proposed Folder Structure

```
src/
├── api/
│   └── apiClient.ts
│
├── assets/
│   ├── esebills_logo.png
│   └── react.svg
│
├── components/
│   └── ui/                             # Shared reusable UI primitives
│       ├── Icon.tsx
│       ├── Logo.tsx
│       ├── NotificationMenu.tsx
│       ├── StatCard.tsx
│       └── index.ts
│
├── features/
│   ├── auth/                           # Authentication feature
│   │   ├── auth.storage.ts             # ← from src/lib/auth.storage.ts (canonical)
│   │   ├── components/
│   │   │   ├── PortalLogin.tsx
│   │   │   ├── PortalRegister.tsx
│   │   │   └── ProfileDrawer.tsx
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── hooks/
│   │   │   ├── auth.hooks.ts           # ← from src/lib/hooks/
│   │   │   └── useCurrentUser.ts       # ← from src/lib/hooks/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── BuyerRegisterPage.tsx
│   │   │   ├── AgentRegisterPage.tsx
│   │   │   ├── BillerRegisterPage.tsx
│   │   │   ├── AdminAccessRequestPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── services/
│   │   │   ├── auth.service.ts         # ← from src/services/auth.service.ts
│   │   │   ├── portal-auth.service.ts
│   │   │   └── biller-auth.service.ts
│   │   └── styles/
│   │       └── portal-login.css
│   │
│   ├── landing/                        # Public marketing pages (NEW)
│   │   ├── components/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PaymentSection.tsx
│   │   │   ├── AdvantagesSection.tsx
│   │   │   ├── PartnersSection.tsx
│   │   │   ├── BillerCtaSection.tsx
│   │   │   ├── PaymentCheckout.tsx
│   │   │   └── RoleDashboard.tsx
│   │   ├── data/
│   │   │   └── siteData.js
│   │   └── pages/
│   │       ├── HomePage.tsx
│   │       └── PaymentCheckoutPage.tsx
│   │
│   ├── admin/                          # Admin dashboard feature (cleaned)
│   │   ├── components/                 # Admin-specific components only
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Billers.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Agents.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Support.tsx
│   │   │   ├── Messaging.tsx
│   │   │   ├── WhatsAppCenter.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── AdminUsersPage.tsx
│   │   │   ├── AdminUserGroupsPage.tsx
│   │   │   ├── AdminTransactionsPage.tsx
│   │   │   ├── AdminParametersPage.tsx
│   │   │   ├── AdminVouchersPage.tsx
│   │   │   ├── AdminEconetPage.tsx
│   │   │   ├── AdminStyledApiModulePage.tsx
│   │   │   ├── AdminApiModulePage.tsx
│   │   │   ├── AdminFeaturePlaceholder.tsx
│   │   │   └── Transactions.tsx
│   │   ├── data/
│   │   │   ├── constants.ts            # Menu config moves to shared menuConfig
│   │   │   └── types.ts
│   │   ├── dto/
│   │   │   └── admin-api.dto.ts
│   │   ├── pages/
│   │   │   └── AdminDashboardPage.tsx  # Simplified — no shell, just content
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── agent/                          # Agent dashboard feature (cleaned)
│   │   ├── components/                 # Agent-specific components only (no Logo/StatCard/NotifMenu)
│   │   ├── pages/
│   │   │   └── AgentDashboardPage.tsx  # Simplified — no shell, just content
│   │   └── styles/
│   │
│   ├── biller/                         # Biller dashboard feature (cleaned)
│   │   ├── components/                 # Biller-specific components only
│   │   ├── pages/
│   │   │   └── BillerDashboardPage.tsx # Simplified — no shell, just content
│   │   └── styles/
│   │
│   ├── customer/                       # Customer dashboard feature
│   │   └── pages/
│   │       └── CustomerDashboardPage.tsx
│   │
│   ├── portal/                         # Unified portal routing
│   │   ├── menuConfig.ts              # NEW: Menu items per UserGroup
│   │   ├── UnifiedDashboardPage.tsx
│   │   └── PortalProfilePage.tsx
│   │
│   └── shared/
│       └── styles/
│           └── role-dashboard.css
│
├── layouts/
│   ├── MainLayout.tsx                  # Public pages: Navbar + Footer
│   ├── DashboardLayout.tsx             # NEW: Unified portal shell (Sidebar + Header + Outlet)
│   ├── DashboardSidebar.tsx            # NEW: Shared sidebar driven by menuConfig
│   ├── DashboardHeader.tsx             # NEW: Shared header (from admin Header.tsx)
│   ├── Navbar.tsx                      # ← from src/components/Navbar.tsx
│   ├── Footer.tsx                      # ← from src/components/Footer.tsx
│   └── BrandLogo.tsx                   # ← from src/components/BrandLogo.tsx
│
├── router/
│   ├── index.tsx                       # Updated with nested portal routes
│   ├── paths.ts
│   └── RequireAuth.tsx                 # Enhanced with allowedGroups
│
├── pages/                              # Only truly generic pages remain here
│   ├── NotFoundPage.tsx
│   ├── UnauthorizedPage.tsx
│   ├── EmptyPage.tsx
│   ├── HowItWorksPage.tsx
│   └── SupportPage.tsx
│
├── styles/
│   ├── global.css
│   ├── tokens.css
│   └── README.md
│
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

---

## Part 4: Route Structure

### Before (current)
```
/                          → HomePage (MainLayout)
/portal                    → RequireAuth → UnifiedDashboardPage (renders full dashboard per group)
/portal/profile            → RequireAuth → PortalProfilePage
/biller                    → Redirect to /portal
/agent                     → Redirect to /portal
/admin                     → Redirect to /portal
/login                     → LoginPage
/login/biller              → LoginPage
/login/agent               → LoginPage
/login/admin               → LoginPage
/register                  → RegisterPage
...
```

### After (proposed)
```
/                          → HomePage (MainLayout with Navbar + Footer)
/services                  → EmptyPage (MainLayout)
/checkout                  → PaymentCheckoutPage (standalone)

/portal                    → RequireAuth → DashboardLayout → UnifiedDashboardPage (redirects to group home)
/portal/profile            → RequireAuth → DashboardLayout → PortalProfilePage

/portal/admin              → RequireAuth[ADMIN] → DashboardLayout → AdminDashboardPage
/portal/admin/:tab         → RequireAuth[ADMIN] → DashboardLayout → AdminDashboardPage

/portal/agent              → RequireAuth[AGENT] → DashboardLayout → AgentDashboardPage
/portal/agent/:tab         → RequireAuth[AGENT] → DashboardLayout → AgentDashboardPage

/portal/biller             → RequireAuth[BILLER] → DashboardLayout → BillerDashboardPage
/portal/biller/:tab        → RequireAuth[BILLER] → DashboardLayout → BillerDashboardPage

/portal/customer           → RequireAuth[CUSTOMER] → DashboardLayout → CustomerDashboardPage

/login                     → LoginPage (MainLayout, no Navbar/Footer)
/login/:portal             → LoginPage
/register                  → RegisterPage
/register/:portal          → RegisterPage variants
/forgot-password/:portal?  → ForgotPasswordPage
/reset-password/:portal?   → ResetPasswordPage

/unauthorized              → UnauthorizedPage
/*                         → NotFoundPage
```

---

## Part 5: Key New Components

### `layouts/DashboardLayout.tsx`
- Renders shared sidebar + header + `<Outlet />`
- Uses `useCurrentUser()` to get `group`
- Passes `group` to `DashboardSidebar` for menu resolution
- Handles mobile nav state

### `layouts/DashboardSidebar.tsx`
- Receives `group: UserGroup` and `activeTab: string`
- Calls `getMenuByGroup(group)` to get menu sections
- Renders the same sidebar UI currently in admin `Sidebar.tsx`
- Includes sign-out button

### `layouts/DashboardHeader.tsx`
- Extracted from admin `Header.tsx`
- Shows notification menu, profile avatar, mobile nav toggle
- Uses `useCurrentUser()` for display name and role

### `features/portal/menuConfig.ts`
- Defines `MenuItem`, `MenuSection` types
- Exports `ADMIN_MENU`, `AGENT_MENU`, `BILLER_MENU`, `CUSTOMER_MENU`
- Exports `getMenuByGroup(group: UserGroup): MenuSection[]`

### Enhanced `router/RequireAuth.tsx`
- Add `allowedGroups?: UserGroup[]` prop
- If user group not in `allowedGroups`, redirect to their own dashboard
- Uses `user.group.name` from profile

---

## Part 6: Execution Order

### Phase 1: Cleanup (no behavior change)
1. Delete 14 empty stub directories
2. Delete duplicate UI components (Logo, StatCard, NotificationMenu copies)
3. Consolidate auth files (move canonical from `src/lib/` and `src/services/` into `src/features/auth/`)
4. Move `Icon.tsx` into `components/ui/`

### Phase 2: Reorganize files (import path changes only)
5. Create `features/landing/` — move landing sections and data
6. Move layout components (Navbar, Footer, BrandLogo) into `src/layouts/`
7. Move auth pages from `src/pages/` into `features/auth/pages/`
8. Move landing pages into `features/landing/pages/`
9. Keep generic pages in `src/pages/`
10. Delete emptied directories

### Phase 3: Unified portal shell (behavior change)
11. Create `features/portal/menuConfig.ts` with group-based menus
12. Create `layouts/DashboardHeader.tsx` (extract from admin Header)
13. Create `layouts/DashboardSidebar.tsx` (generalize from admin Sidebar)
14. Create `layouts/DashboardLayout.tsx` (shell: sidebar + header + outlet)
15. Enhance `RequireAuth` with `allowedGroups` prop
16. Refactor router with nested `/portal/*` routes and group guards
17. Simplify dashboard pages — remove embedded shell code, keep only content

### Phase 4: Verification
18. Run `npm run build` — verify zero errors
19. Manual smoke test of each portal role

---

## Files to DELETE

### Empty directories (14)
`src/auth/`, `src/portal/`, `src/shared/`, `src/components/admin/`, `src/components/agent/`, `src/components/biller/`, `src/components/shared/`, `src/pages/admin/`, `src/pages/agent/`, `src/pages/biller/`, `src/pages/customer/`, `src/services/admin/`, `src/services/agent/`, `src/services/biller/`

### Duplicate UI components (9 files)
- `src/features/admin/components/Logo.tsx`
- `src/features/admin/components/StatCard.tsx`
- `src/features/admin/components/NotificationMenu.tsx`
- `src/features/agent/components/Logo.tsx`
- `src/features/agent/components/StatCard.tsx`
- `src/features/agent/components/NotificationMenu.tsx`
- `src/features/biller/components/BillerLogo.tsx`
- `src/features/biller/components/BillerStatCard.tsx`
- `src/features/biller/components/BillerNotificationMenu.tsx`

### Re-export shims (4 files)
- `src/features/auth/auth.storage.ts` (replaced with canonical)
- `src/features/auth/auth.service.ts` (replaced with canonical)
- `src/features/auth/auth.hooks.ts` (replaced with canonical)
- `src/features/auth/useCurrentUser.ts` (replaced with canonical)

### Superseded by DashboardLayout (2 files)
- `src/features/admin/components/Sidebar.tsx` → replaced by `layouts/DashboardSidebar.tsx`
- `src/features/admin/components/Header.tsx` → replaced by `layouts/DashboardHeader.tsx`

---

## Key Principles

- **Feature-sliced**: each domain owns its pages, components, services, hooks, types, styles
- **Single source of truth**: no re-export shims — import from the canonical location
- **Shared UI in `components/ui/`**: only truly reusable, domain-agnostic primitives
- **Unified portal shell**: one `DashboardLayout` for all roles, menu driven by `user.group.name`
- **Route guards by group**: `RequireAuth` checks `allowedGroups` against `user.group.name` from `/v1/users/profile`
- **No orphan directories**: every directory must contain at least one file
