# Feature vs Service Audit Report

## Executive Summary

This audit compares the **backend services** (src/services/) against the **frontend features/pages** to identify gaps where services exist but pages are missing, or vice versa.

---

## 1. Services Overview (src/services/)

| # | Service | Purpose |
|---|---------|---------|
| 1 | [`auth.service.ts`](src/services/auth.service.ts) | Authentication, OTP, Password Management, Registration |
| 2 | [`users.service.ts`](src/services/users.service.ts) | User CRUD, Groups Management |
| 3 | [`products.service.ts`](src/services/products.service.ts) | Products, Categories, Currencies, Countries, Banks, Fee Types |
| 4 | [`payments.service.ts`](src/services/payments.service.ts) | Payment Transactions |
| 5 | [`transactions.service.ts`](src/services/transactions.service.ts) | ZESA, Econet Airtime, Netone Transactions |
| 6 | [`institutions.service.ts`](src/services/institutions.service.ts) | Institutions, Settlement Accounts, Tuition |
| 7 | [`integrations.service.ts`](src/services/integrations.service.ts) | Pesepay, Econet EVD, Netone EVD, Esolutions, ZESA, CGrate |

---

## 2. Feature Audit by Role

### 2.1 Admin Portal (portal-admin)

**Menu Sections Defined in** [`constants.ts`](src/features/admin/data/constants.ts):

| Section | Menu Items | Service Coverage | Page Status |
|---------|------------|------------------|-------------|
| **Payments** | | | |
| | Dashboard | ✅ Has [`AdminDashboardPage.tsx`](src/features/admin/pages/AdminDashboardPage.tsx) | ✅ Complete |
| | Transactions → Zambia Products | ⚠️ Service exists | ❌ **Missing Page** |
| | Transactions → Zim Products | ⚠️ Service exists | ❌ **Missing Page** |
| | Vouchers → Zambia Products | ⚠️ [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | ❌ **Missing Page** |
| | Vouchers → Zim Products | ⚠️ [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | ❌ **Missing Page** |
| | Rongeka Accounts | ⚠️ [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | ❌ **Missing Page** |
| | Products | ✅ Has [`Products.tsx`](src/features/admin/components/Products.tsx) | ✅ Complete |
| **Platform** | | | |
| | Parameters → Currencies | ✅ Has [`AdminParametersPage.tsx`](src/features/admin/components/AdminParametersPage.tsx) | ✅ Complete |
| | Parameters → Countries | ✅ Has [`AdminParametersPage.tsx`](src/features/admin/components/AdminParametersPage.tsx) | ✅ Complete |
| | Parameters → Holidays | ✅ Has [`AdminParametersPage.tsx`](src/features/admin/components/AdminParametersPage.tsx) | ✅ Complete |
| | Parameters → Banks | ✅ Has [`AdminParametersPage.tsx`](src/features/admin/components/AdminParametersPage.tsx) | ✅ Complete |
| | SMS → SMSes | ✅ Has [`Messaging.tsx`](src/features/admin/components/Messaging.tsx) | ✅ Complete |
| | SMS → SMS Charges | ✅ Has [`Messaging.tsx`](src/features/admin/components/Messaging.tsx) | ⚠️ Partial |
| | User Settings → Users | ✅ Has [`Users.tsx`](src/features/admin/components/Users.tsx) | ✅ Complete |
| | User Settings → Groups | ✅ Has [`AdminUserGroupsPage.tsx`](src/features/admin/components/AdminUserGroupsPage.tsx) | ✅ Complete |
| **Integrations** | | | |
| | Econet → Bundle Plan Types | ✅ Has [`AdminEconetPage.tsx`](src/features/admin/components/AdminEconetPage.tsx) | ✅ Complete |
| | Econet → Data Bundle Types | ✅ Has [`AdminEconetPage.tsx`](src/features/admin/components/AdminEconetPage.tsx) | ⚠️ Partial |
| | Netone → Bundle Plan Types | ⚠️ Service exists | ❌ **Missing Page** |
| | Netone → Data Bundle Types | ⚠️ Service exists | ❌ **Missing Page** |
| | Credentials → Pesepay | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Credentials → Cgrate | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Credentials → Zesa | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Credentials → Econet | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Credentials → Esolutions SMS | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Credentials → Netone EVD | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Credentials → Esolutions Airtime | ✅ Has [`AdminApiModulePage.tsx`](src/features/admin/components/AdminApiModulePage.tsx) | ✅ Complete |
| | Tuition → Transactions | ✅ Has [`AdminTransactionsPage.tsx`](src/features/admin/components/AdminTransactionsPage.tsx) | ✅ Complete |
| | Tuition → Institutions | ⚠️ Service exists | ❌ **Missing Page** |
| | Tuition → Fee Types | ⚠️ Service exists | ❌ **Missing Page** |
| | Tuition → Processing Fees | ⚠️ Service exists | ❌ **Missing Page** |
| **Operations** | | | |
| | Billers | ✅ Has [`Billers.tsx`](src/features/admin/components/Billers.tsx) | ✅ Complete |
| | Agents | ✅ Has [`Agents.tsx`](src/features/admin/components/Agents.tsx) | ✅ Complete |
| | Commissions | ✅ Has [`Reports.tsx`](src/features/admin/components/Reports.tsx) | ⚠️ Partial |
| | WhatsApp Center | ✅ Has [`WhatsAppCenter.tsx`](src/features/admin/components/WhatsAppCenter.tsx) | ✅ Complete |
| | Reports | ✅ Has [`Reports.tsx`](src/features/admin/components/Reports.tsx) | ✅ Complete |
| **Preferences** | | | |
| | Profile | ✅ Has [`UserProfile.tsx`](src/features/admin/components/UserProfile.tsx) | ✅ Complete |
| | Settings | ✅ Has [`Settings.tsx`](src/features/admin/components/Settings.tsx) | ✅ Complete |
| | Support | ✅ Has [`Support.tsx`](src/features/admin/components/Support.tsx) | ✅ Complete |

---

### 2.2 Agent Portal (portal-agent)

| Service Feature | Service | Page Status |
|-----------------|---------|-------------|
| Dashboard | ⚠️ Agent wallet service exists in API | ✅ Has [`AgentDashboardPage.tsx`](src/features/agent/pages/AgentDashboardPage.tsx) |
| Wallet Balance | ✅ [`transactions.service.ts`](src/services/transactions.service.ts) has agent wallet endpoints | ❌ **Not implemented in UI** |
| Wallet History | ✅ API endpoint exists | ❌ **Not implemented in UI** |
| Transaction History | ⚠️ API exists | ⚠️ **Partial - needs more features** |
| Products | ✅ [`products.service.ts`](src/services/products.service.ts) | ❌ **Not accessible in Agent UI** |

---

### 2.3 Biller Portal (portal-biller)

| Service Feature | Service | Page Status |
|-----------------|---------|-------------|
| Dashboard | ⚠️ Service exists | ✅ Has [`BillerDashboardPage.tsx`](src/features/biller/pages/BillerDashboardPage.tsx) |
| Transactions | ⚠️ Service exists | ⚠️ **Partial** |
| Products/Services | ✅ [`products.service.ts`](src/services/products.service.ts) | ❌ **Not implemented** |
| Settlement Accounts | ✅ [`institutions.service.ts`](src/services/institutions.service.ts) | ❌ **Not implemented** |
| Fee Management | ✅ [`institutions.service.ts`](src/services/institutions.service.ts) | ❌ **Not implemented** |

---

### 2.4 Customer Portal (portal-customer)

| Service Feature | Service | Page Status |
|-----------------|---------|-------------|
| Dashboard | ⚠️ Service exists | ✅ Has [`CustomerDashboardPage.tsx`](src/features/customer/pages/CustomerDashboardPage.tsx) |
| Make Payment | ✅ [`payments.service.ts`](src/services/payments.service.ts) | ⚠️ Partial (Checkout page exists) |
| Transaction History | ✅ API exists | ❌ **Not implemented** |
| Profile Management | ✅ [`auth.service.ts`](src/services/auth.service.ts) | ✅ Complete |

---

### 2.5 Landing/Home Page

| Service Feature | Service | Page Status |
|-----------------|---------|-------------|
| Products Listing | ✅ [`products.service.ts`](src/services/products.service.ts) | ✅ Has [`PaymentSection.tsx`](src/features/landing/components/PaymentSection.tsx) |
| Payment Checkout | ✅ [`payments.service.ts`](src/services/payments.service.ts) | ✅ Has [`PaymentCheckoutPage.tsx`](src/features/landing/pages/PaymentCheckoutPage.tsx) |

---

## 3. Missing Pages Summary

### High Priority (Backend Services Exist But No Frontend)

| # | Feature | Service | Path |
|---|---------|---------|------|
| 1 | Zambia Products Transactions | [`transactions.service.ts`](src/services/transactions.service.ts) | portal-admin/transactionsZambiaProducts |
| 2 | Zim Products Transactions | [`transactions.service.ts`](src/services/transactions.service.ts) | portal-admin/transactionsZimProducts |
| 3 | Zambia Vouchers Management | [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | portal-admin/vouchersZambiaProducts |
| 4 | Zim Vouchers Management | [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | portal-admin/vouchersZimProducts |
| 5 | Rongeka Accounts | [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | portal-admin/rongekaAccounts |
| 6 | Netone Bundle Plans | [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | portal-admin/netoneBundlePlanTypes |
| 7 | Netone Data Bundles | [`adminModules.service.ts`](src/features/admin/services/adminModules.service.ts) | portal-admin/netoneDataBundleTypes |
| 8 | Tuition Institutions | [`institutions.service.ts`](src/services/institutions.service.ts) | portal-admin/tuitionInstitutions |
| 9 | Tuition Fee Types | [`institutions.service.ts`](src/services/institutions.service.ts) | portal-admin/tuitionFeeTypes |
| 10 | Tuition Processing Fees | [`institutions.service.ts`](src/services/institutions.service.ts) | portal-admin/tuitionProcessingFees |

### Medium Priority (Partial Implementation)

| # | Feature | Current Status | Needed |
|---|---------|----------------|--------|
| 1 | SMS Charges | Exists in Messaging page | Separate dedicated page |
| 2 | Commissions | Part of Reports | Dedicated Commission Management page |
| 3 | Agent Wallet | API exists | Full wallet UI (balance, history, top-up) |
| 4 | Biller Products | API exists | Product management UI for billers |
| 5 | Customer Transactions | API exists | Transaction history page |

---

## 4. Services Without Frontend Pages

| # | Service | Endpoints | Priority |
|---|---------|-----------|----------|
| 1 | Esolutions Airtime Transactions | [`transactions.service.ts`](src/services/transactions.service.ts) | Medium |
| 2 | Agent Wallet API | [`endpoints.ts`](src/api/endpoints.ts:204-210) | High |
| 3 | Reports API | [`endpoints.ts`](src/api/endpoints.ts:212-218) | Medium |
| 4 | Audits API | [`endpoints.ts`](src/api/endpoints.ts:248-252) | Low |
| 5 | Access Control/Authorities | [`endpoints.ts`](src/api/endpoints.ts:184-202) | Low |
| 6 | EseBills Accounts | [`endpoints.ts`](src/api/endpoints.ts:115-120) | Medium |

---

## 6. Dashboard Stats Implementation Status

### Current State (USING MOCK DATA)

The Admin Dashboard at [`Dashboard.tsx`](src/features/admin/components/Dashboard.tsx) uses **hardcoded mock data**:

```typescript
// From constants.ts - MOCK DATA ONLY
export const MOCK_STATS: DashboardStats = {
  totalRevenue: 240500,
  totalTransactions: 12450,
  activeUsers: 8200,
  newBillers: 14,
  revenueChange: '+12.5% vs LW',
  transactionsChange: '+8.2% vs LW',
  usersChange: '+5.1% vs LW',
  billersChange: '+2.4% vs LW',
};
```

| Stat Card | Current Source | Needed Service |
|-----------|---------------|----------------|
| Total Revenue | `MOCK_STATS.totalRevenue` | **MISSING** - No backend API |
| Total Transactions | `MOCK_STATS.totalTransactions` | **MISSING** - No backend API |
| Active Users | `MOCK_STATS.activeUsers` | **MISSING** - No backend API |
| Agent Earnings | `MOCK_AGENTS` array sum | **MISSING** - No backend API |

### Required Backend API Endpoints

The following endpoints need to be created/confirmed on the backend:

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/dashboard/stats` | Overall platform statistics |
| `GET /v1/dashboard/revenue` | Revenue data for charts |
| `GET /v1/dashboard/transactions` | Recent transactions |
| `GET /v1/dashboard/top-billers` | Top performing billers |
| `GET /v1/dashboard/agents/summary` | Agent performance summary |

### Implementation Required

1. **Create Dashboard Service** - New service file to fetch real stats
2. **Update Dashboard Component** - Replace MOCK_STATS with API calls
3. **Add Loading States** - Handle async data fetching
4. **Add Error Handling** - Graceful degradation

---

## 7. Recommendations

### Immediate Actions (High Priority)

1. **Create Missing Admin Pages:**
   - Zambia/Zim Products Transactions pages
   - Zambia/Zim Vouchers pages
   - Rongeka Accounts page
   - Netone Bundle Plans pages
   - Tuition Management pages

2. **Dashboard Stats Implementation:**
   - Create new `dashboard.service.ts` to fetch real statistics
   - Update Admin Dashboard to use real API data instead of MOCK_STATS

3. **Agent Portal Enhancement:**
   - Implement full wallet UI (balance display, history, top-up)
   - Add product browsing and purchasing capability

4. **Biller Portal Enhancement:**
   - Add product/service management
   - Add settlement account management

### Medium-term Actions

1. **Customer Portal:**
   - Add transaction history
   - Add saved accounts management

2. **Commissions:**
   - Create dedicated commission management page

3. **SMS Charges:**
   - Create dedicated SMS charges management page

---

## 8. Service Coverage Matrix

| Service | Admin | Agent | Biller | Customer | Landing |
|---------|-------|-------|--------|----------|---------|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ⚠️ | ⚠️ | ⚠️ | - |
| Products | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| Payments | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Transactions | ⚠️ | ⚠️ | ⚠️ | ❌ | - |
| Institutions | ⚠️ | - | ❌ | - | - |
| Integrations | ✅ | - | - | - | - |

**Legend:**
- ✅ = Fully implemented
- ⚠️ = Partially implemented
- ❌ = Not implemented
- - = Not applicable

---

*Generated: 2026-02-27*
*Project: esebills-web*
