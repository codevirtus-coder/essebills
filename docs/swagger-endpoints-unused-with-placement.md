# Unused Swagger endpoints (v2)

Generated: 2026-04-08T08:58:05.743Z
Swagger: C:\Users\USER\Documents\api-docs-essebills.json

Total unused operations: **18**
Covered by similar used ops (heuristic): **11**
Uncovered (likely truly unused): **7**

This list is based on static code scanning of fetch calls (including admin wrappers).

See also: `docs/swagger-endpoints-unused.covered-by-used.v2.txt` and `docs/swagger-endpoints-unused.uncovered.v2.txt`.

## /v1/currencies

- `GET /v1/currencies/active` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
  - Shared lookups are currently implemented in products.service.ts.
- `GET /v1/currencies/all` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
  - Shared lookups are currently implemented in products.service.ts.
- `GET /v1/currencies/all-active` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
  - Shared lookups are currently implemented in products.service.ts.

## /v1/user

- `GET /v1/user/bank-top-ups/{param}/proof-of-payment-url` -> `esseBills/essebills-web/src/services/wallet.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
- `POST /v1/user/bank-top-ups/{param}/proof-of-payment` -> `esseBills/essebills-web/src/services/wallet.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/whatsapp

- `GET /v1/whatsapp/webhook` -> `esseBills/essebills-web/src/features/admin/services/adminModules.service.ts` (endpoints: `esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts`)
- `POST /v1/whatsapp/webhook` -> `esseBills/essebills-web/src/features/admin/services/adminModules.service.ts` (endpoints: `esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts`)

## /opn/v1

- `GET /opn/v1/products/{param}/logo` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
  - Public (no-auth) endpoints; keep under API_ENDPOINTS.products/opn.

## /v1/banks

- `GET /v1/banks/all` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
  - Shared lookups are currently implemented in products.service.ts.

## /v1/countries

- `GET /v1/countries/all` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
  - Shared lookups are currently implemented in products.service.ts.

## /v1/esebills-accounts

- `GET /v1/esebills-accounts/all` -> `esseBills/essebills-web/src/services/wallet.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/groups

- `GET /v1/groups/all` -> `esseBills/essebills-web/src/services/users.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/payment-transactions

- `GET /v1/payment-transactions/all` -> `esseBills/essebills-web/src/services/transactions.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/pesepay

- `POST /v1/pesepay/payments/transactions/{param}` -> `esseBills/essebills-web/src/services/integrations.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/pesepay-integration-credentials

- `GET /v1/pesepay-integration-credentials/all` -> `esseBills/essebills-web/src/services/integrations.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/portal

- `GET /v1/portal/product-payment/transactions` -> `esseBills/essebills-web/src/services/transactions.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/products

- `GET /v1/products/all` -> `esseBills/essebills-web/src/services/products.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)

## /v1/users

- `GET /v1/users/all` -> `esseBills/essebills-web/src/services/users.service.ts` (endpoints: `esseBills/essebills-web/src/api/endpoints.ts`)
