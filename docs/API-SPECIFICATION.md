# ESEBILLS API Specification

## Overview

This document outlines the API endpoints required to support the Admin, Agent, Biller, and Customer dashboards in the EseBills payment platform.

---

## 1. Admin Dashboard API

The admin dashboard requires comprehensive oversight of the entire platform including users, transactions, agents, billers, products, and system configuration.

### 1.1 Dashboard & Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/dashboard/stats`](#) | GET | Get aggregate dashboard statistics (total revenue, transactions, users, agent earnings) |
| [`GET /v1/admin/dashboard/revenue`](#) | GET | Get revenue data for charts (daily/monthly/yearly) |
| [`GET /v1/admin/dashboard/top-billers`](#) | GET | Get top performing billers by revenue |
| [`GET /v1/admin/dashboard/top-agents`](#) | GET | Get top performing agents by transactions |
| [`GET /v1/admin/dashboard/activity-feed`](#) | GET | Get live transaction activity feed |

### 1.2 Transactions Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/transactions`](#) | GET | Get all transactions with filtering, pagination, sorting |
| [`GET /v1/admin/transactions/{id}`](#) | GET | Get transaction by ID |
| [`PUT /v1/admin/transactions/{id}/status`](#) | PUT | Update transaction status (refund, reverse, etc.) |
| [`GET /v1/admin/transactions/export`](#) | GET | Export transactions to CSV/Excel |
| [`GET /v1/admin/transactions/statistics`](#) | GET | Get transaction statistics (by status, by biller, by date range) |

### 1.3 User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/users`](#) | GET | Get all users with pagination and filtering |
| [`GET /v1/admin/users/{id}`](#) | GET | Get user by ID |
| [`POST /v1/admin/users`](#) | POST | Create new user |
| [`PUT /v1/admin/users/{id}`](#) | PUT | Update user details |
| [`DELETE /v1/admin/users/{id}`](#) | DELETE | Delete/deactivate user |
| [`PUT /v1/admin/users/{id}/status`](#) | PUT | Activate/deactivate user account |
| [`GET /v1/admin/users/{id}/activity`](#) | GET | Get user activity log |

### 1.4 Agent Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/agents`](#) | GET | Get all agents with filtering (status, location) |
| [`GET /v1/admin/agents/{id}`](#) | GET | Get agent details |
| [`POST /v1/admin/agents`](#) | POST | Register new agent |
| [`PUT /v1/admin/agents/{id}`](#) | PUT | Update agent details |
| [`PUT /v1/admin/agents/{id}/status`](#) | PUT | Activate/suspend agent |
| [`GET /v1/admin/agents/{id}/wallet`](#) | GET | Get agent wallet/ float balance |
| [`GET /v1/admin/agents/{id}/transactions`](#) | GET | Get agent transaction history |
| [`GET /v1/admin/agents/{id}/commissions`](#) | GET | Get agent commission earnings |
| [`POST /v1/admin/agents/{id}/float-topup`](#) | POST | Add float to agent wallet (admin funded) |
| [`GET /v1/admin/agents/{id}/bank-topups`](#) | GET | Get agent bank top-up requests |
| [`PUT /v1/admin/agents/{id}/bank-topups/{topupId}/confirm`](#) | PUT | Confirm bank top-up |
| [`PUT /v1/admin/agents/{id}/bank-topups/{topupId}/reject`](#) | PUT | Reject bank top-up |
| [`GET /v1/admin/agents/{id}/commission-rates`](#) | GET | Get agent commission rates |
| [`POST /v1/admin/agents/{id}/commission-rates`](#) | POST | Set agent commission rates |
| [`PUT /v1/admin/agents/{id}/commission-rates/{rateId}`](#) | PUT | Update commission rate |

### 1.5 Biller Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/billers`](#) | GET | Get all billers |
| [`GET /v1/admin/billers/{id}`](#) | GET | Get biller details |
| [`POST /v1/admin/billers`](#) | POST | Register new biller |
| [`PUT /v1/admin/billers/{id}`](#) | PUT | Update biller details |
| [`PUT /v1/admin/billers/{id}/status`](#) | PUT | Activate/suspend biller |
| [`GET /v1/admin/billers/{id}/products`](#) | GET | Get biller products |
| [`GET /v1/admin/billers/{id}/transactions`](#) | GET | Get biller transaction history |
| [`GET /v1/admin/billers/{id}/settlements`](#) | GET | Get biller settlement/payout history |
| [`GET /v1/admin/billers/{id}/analytics`](#) | GET | Get biller performance analytics |
| [`POST /v1/admin/billers/{id}/settlement`](#) | POST | Process settlement payout |

### 1.6 Products Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/products`](#) | GET | Get all products |
| [`GET /v1/admin/products/{id}`](#) | GET | Get product by ID |
| [`POST /v1/admin/products`](#) | POST | Create new product |
| [`PUT /v1/admin/products/{id}`](#) | PUT | Update product |
| [`DELETE /v1/admin/products/{id}`](#) | DELETE | Delete product |
| [`PUT /v1/admin/products/{id}/status`](#) | PUT | Enable/disable product |
| [`GET /v1/admin/products/categories`](#) | GET | Get product categories |
| [`POST /v1/admin/products/categories`](#) | POST | Create product category |
| [`PUT /v1/admin/products/categories/{id}`](#) | PUT | Update product category |

### 1.7 Commission Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/commissions/rates`](#) | GET | Get global commission rates |
| [`PUT /v1/admin/commissions/rates`](#) | PUT | Update global commission rates |
| [`GET /v1/admin/commissions/payouts`](#) | GET | Get commission payout requests |
| [`POST /v1/admin/commissions/payouts/{id}/approve`](#) | POST | Approve commission payout |
| [`POST /v1/admin/commissions/payouts/{id}/reject`](#) | POST | Reject commission payout |
| [`GET /v1/admin/commissions/earnings`](#) | GET | Get commission earnings report |

### 1.8 Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/reports/revenue`](#) | GET | Revenue report |
| [`GET /v1/admin/reports/transactions`](#) | GET | Transaction report |
| [`GET /v1/admin/reports/agents`](#) | GET | Agent performance report |
| [`GET /v1/admin/reports/billers`](#) | GET | Biller performance report |
| [`GET /v1/admin/reports/commissions`](#) | GET | Commission report |
| [`GET /v1/admin/reports/settlements`](#) | GET | Settlement report |

### 1.9 System Configuration

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/settings/platform`](#) | GET | Get platform settings |
| [`PUT /v1/admin/settings/platform`](#) | PUT | Update platform settings |
| [`GET /v1/admin/settings/currencies`](#) | GET | Get currency settings |
| [`GET /v1/admin/settings/banks`](#) | GET | Get bank settings |
| [`GET /v1/admin/settings/holidays`](#) | GET | Get holiday settings |

### 1.10 Bank Top-ups Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/admin/bank-topups`](#) | GET | Get all bank top-up requests |
| [`GET /v1/admin/bank-topups/pending`](#) | GET | Get pending top-ups |
| [`PUT /v1/admin/bank-topups/{id}/confirm`](#) | PUT | Confirm top-up |
| [`PUT /v1/admin/bank-topups/{id}/reject`](#) | PUT | Reject top-up |

---

## 2. Agent Dashboard API

The agent dashboard focuses on wallet management, making sales, and commission tracking.

### 2.1 Wallet Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/agent/wallet/balances`](#) | GET | Get float balances (multi-currency) |
| [`GET /v1/agent/wallet/history`](#) | GET | Get wallet transaction history |
| [`GET /v1/agent/wallet/balance/{currency}`](#) | GET | Get balance for specific currency |

### 2.2 Bank Top-ups

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/agent/bank-topups`](#) | GET | Get my bank top-up requests |
| [`POST /v1/agent/bank-topups`](#) | POST | Request bank top-up |
| [`GET /v1/agent/bank-topups/{id}`](#) | GET | Get top-up request details |
| [`GET /v1/agent/bank-accounts`](#) | GET | Get available bank accounts for top-up |

### 2.3 Payments / Sales

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`POST /v1/agent/payments/process`](#) | POST | Process a payment/sale |
| [`GET /v1/agent/payments/recent`](#) | GET | Get recent transactions |
| [`GET /v1/agent/payments/history`](#) | GET | Get payment history |
| [`GET /v1/agent/payments/{id}`](#) | GET | Get payment details |
| [`GET /v1/agent/payments/products`](#) | GET | Get available products to sell |

### 2.4 Commissions

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/agent/commissions/balance`](#) | GET | Get commission balance |
| [`GET /v1/agent/commissions/history`](#) | GET | Get commission history |
| [`GET /v1/agent/commissions/rates`](#) | GET | Get my commission rates |
| [`POST /v1/agent/commissions/payout-request`](#) | POST | Request commission payout |
| [`GET /v1/agent/commissions/payout-history`](#) | GET | Get payout request history |

### 2.5 Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/agent/profile`](#) | GET | Get agent profile |
| [`PUT /v1/agent/profile`](#) | PUT | Update agent profile |
| [`GET /v1/agent/shop-details`](#) | GET | Get shop/ business details |

---

## 3. Biller Dashboard API

The biller dashboard focuses on collections, settlements, and payment tracking.

### 3.1 Collections

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/biller/collections`](#) | GET | Get payment collections |
| [`GET /v1/biller/collections/summary`](#) | GET | Get collections summary (gross, fees, net) |
| [`GET /v1/biller/collections/{id}`](#) | GET | Get collection details |
| [`GET /v1/biller/collections/statistics`](#) | GET | Get collection statistics |

### 3.2 Settlements

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/biller/settlements`](#) | GET | Get settlement/payout history |
| [`GET /v1/biller/settlements/pending`](#) | GET | Get pending settlement |
| [`GET /v1/biller/settlements/{id}`](#) | GET | Get settlement details |
| [`GET /v1/biller/settlements/summary`](#) | GET | Get settlement summary |

### 3.3 Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/biller/analytics/daily`](#) | GET | Get daily analytics |
| [`GET /v1/biller/analytics/weekly`](#) | GET | Get weekly analytics |
| [`GET /v1/biller/analytics/monthly`](#) | GET | Get monthly analytics |
| [`GET /v1/biller/analytics/top-products`](#) | GET | Get top products by collection |

### 3.4 Payment Points (Agents)

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/biller/payment-points`](#) | GET | Get agents selling for this biller |
| [`GET /v1/biller/payment-points/{id}/transactions`](#) | GET | Get transactions from specific agent |

### 3.5 Products

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/biller/products`](#) | GET | Get biller's products |
| [`PUT /v1/biller/products/{id}/status`](#) | PUT | Enable/disable product |

### 3.6 Settings

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/biller/profile`](#) | GET | Get biller profile |
| [`PUT /v1/biller/profile`](#) | PUT | Update biller profile |
| [`GET /v1/biller/settings/notifications`](#) | GET | Get notification preferences |
| [`PUT /v1/biller/settings/notifications`](#) | PUT | Update notification preferences |
| [`GET /v1/biller/settings/settlement-bank`](#) | GET | Get settlement bank details |
| [`PUT /v1/biller/settings/settlement-bank`](#) | PUT | Update settlement bank |

---

## 4. Customer Dashboard API

The customer dashboard focuses on viewing transaction history and making payments.

### 4.1 Transactions

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/customer/transactions`](#) | GET | Get my transaction history |
| [`GET /v1/customer/transactions/{id}`](#) | GET | Get transaction details |
| [`GET /v1/customer/transactions/statistics`](#) | GET | Get spending statistics |

### 4.2 Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`POST /v1/customer/payments`](#) | POST | Make a payment |
| [`GET /v1/customer/payments/quick-pay`](#) | GET | Get saved accounts for quick pay |
| [`POST /v1/customer/payments/quick-pay`](#) | POST | Quick pay saved account |
| [`POST /v1/customer/payments/validate`](#) | POST | Validate payment before processing |

### 4.3 Products/Services

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/customer/products`](#) | GET | Get available products to pay |
| [`GET /v1/customer/products/{id}/validate`](#) | GET | Validate account reference |
| [`GET /v1/customer/products/categories`](#) | GET | Get product categories |

### 4.4 Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/customer/profile`](#) | GET | Get customer profile |
| [`PUT /v1/customer/profile`](#) | PUT | Update customer profile |
| [`GET /v1/customer/saved-accounts`](#) | GET | Get saved payment accounts |
| [`POST /v1/customer/saved-accounts`](#) | POST | Save payment account |
| [`DELETE /v1/customer/saved-accounts/{id}`](#) | DELETE | Remove saved account |

---

## 5. Common / Shared Endpoints

### 5.1 Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`POST /authenticate`](#) | POST | Login with credentials |
| [`POST /authenticate/verify-otp`](#) | POST | Verify OTP |
| [`POST /v1/auth/refresh`](#) | POST | Refresh token |
| [`POST /v1/users/forgot-password`](#) | POST | Request password reset |
| [`POST /v1/users/reset-password`](#) | POST | Reset password |
| [`POST /v1/users/update-password`](#) | POST | Update password |

### 5.2 Registration

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`POST /v1/register/customer`](#) | POST | Register as customer |
| [`POST /v1/register/biller`](#) | POST | Register as biller |
| [`POST /v1/register/agent`](#) | POST | Register as agent |

### 5.3 User Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/users/my-account`](#) | GET | Get current user profile |
| [`PUT /v1/users/my-account`](#) | PUT | Update current user profile |

### 5.4 Lookup Data

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/products`](#) | GET | Get all products |
| [`GET /v1/products/by-category/{id}`](#) | GET | Get products by category |
| [`GET /v1/product-categories`](#) | GET | Get product categories |
| [`GET /v1/countries`](#) | GET | Get countries |
| [`GET /v1/currencies`](#) | GET | Get currencies |
| [`GET /v1/banks`](#) | GET | Get banks |
| [`GET /v1/holidays`](#) | GET | Get holidays |

### 5.5 Notifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`GET /v1/notifications`](#) | GET | Get user notifications |
| [`PUT /v1/notifications/{id}/read`](#) | PUT | Mark notification as read |
| [`PUT /v1/notifications/read-all`](#) | PUT | Mark all as read |

---

## 6. Data Models Summary

### Transaction
```
- id: string
- dateTimeOfTransaction: datetime
- amount: number
- productName: string
- productReferenceNumber: string
- customerPhoneNumber: string
- customerEmail: string
- paymentStatus: string
- serviceFees: number
- agentCommission: number
- agentId: string
- billerId: string
```

### Agent Wallet
```
- id: number
- agentId: string
- currencyCode: string
- balance: number
- reservedBalance: number
- availableBalance: number
```

### Agent Wallet Transaction
```
- id: number
- agentId: string
- currencyCode: string
- amount: number
- transactionType: TOP_UP | COMMISSION_EARNED | PAYOUT | ADJUSTMENT
- description: string
- runningBalance: number
- createdDate: datetime
```

### Bank Top-up
```
- id: number
- agentId: string
- currencyCode: string
- amount: number
- bankName: string
- accountNumber: string
- depositReference: string
- status: PENDING | CONFIRMED | REJECTED
- createdDate: datetime
- processedDate: datetime
```

### Biller Settlement
```
- id: string
- billerId: string
- periodStart: date
- periodEnd: date
- grossAmount: number
- platformFee: number
- agentCommission: number
- netAmount: number
- status: PENDING | PROCESSING | SETTLED | FAILED
- settlementDate: datetime
- reference: string
```

---

## 7. Query Parameters Standardization

All list endpoints should support:

| Parameter | Type | Description |
|------------|------|-------------|
| `page` | integer | Page number (0-indexed) |
| `size` | integer | Page size |
| `sort` | string | Sort field |
| `order` | string | Sort order (ASC/DESC) |
| `search` | string | Search term |
| `status` | string | Filter by status |
| `fromDate` | date | Filter from date |
| `toDate` | date | Filter to date |

---

## 8. Response Format Standardization

All responses should follow this pattern:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Paginated Response
```json
{
  "success": true,
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
