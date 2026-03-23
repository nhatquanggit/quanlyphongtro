# API Map From `swagger.yaml`

Base URL:

```txt
http://localhost:3000/api
```

Auth:

- Protected APIs require header `Authorization: Bearer <token>`
- Token flow in swagger:
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`

## 1. Authentication

Used by FE screen:

- `src/components/AuthLoginPage.tsx`

Endpoints:

### `POST /auth/register`

Purpose:

- Register new user

Body:

```json
{
  "email": "user@example.com",
  "password": "123456",
  "fullName": "Nguyen Van A",
  "phone": "090...",
  "role": "STAFF"
}
```

Required fields:

- `email`
- `password`
- `fullName`

Response:

- `201`
- Returns: `id`, `email`, `fullName`, `token`, `refreshToken`

### `POST /auth/login`

Purpose:

- Login

Body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Response:

- `200`
- Returns: `id`, `email`, `token`, `refreshToken`

### `POST /auth/refresh`

Purpose:

- Refresh access token

Body:

```json
{
  "refreshToken": "..."
}
```

### `POST /auth/logout`

Purpose:

- Logout current user

Notes:

- Requires bearer token

## 2. Dashboard

Used by FE screen:

- `src/components/DashboardContent.tsx`

Endpoints:

### `GET /dashboard/kpis`

Purpose:

- Load summary KPI cards

Query:

- `propertyId?`

Response fields:

- `totalRevenue`
- `totalExpenses`
- `netProfit`
- `occupancyRate`
- `collectionRate`

### `GET /dashboard/activities`

Purpose:

- Load recent activities feed

Query:

- `propertyId?`
- `limit?`

### `GET /dashboard/alerts`

Purpose:

- Load warning/alert list

Query:

- `propertyId?`

### `GET /dashboard/revenue-chart`

Purpose:

- Load revenue chart

Query:

- `propertyId?`
- `months?`

### `GET /dashboard/occupancy-trend`

Purpose:

- Load occupancy trend chart

Query:

- `propertyId?`
- `months?`

## 3. Properties

Best fit for FE:

- `Settings`
- property selector
- owner/admin setup

Endpoints:

### `POST /properties`

- Create property

Required body:

- `name`
- `address`
- `totalFloors`
- `totalRooms`

Optional body:

- `currency`
- `timezone`
- `settings`

### `GET /properties`

- Get all properties

### `GET /properties/{id}`

- Get property detail

### `PUT /properties/{id}`

- Update property info/settings

### `DELETE /properties/{id}`

- Delete property

## 4. Rooms

Used by FE screen:

- `src/components/RoomManagement.tsx`
- modal `new-room` in `src/App.tsx`

Endpoints:

### `GET /rooms`

Purpose:

- Room list page

Query:

- `propertyId?`
- `status?` = `VACANT | OCCUPIED | MAINTENANCE | RESERVED`
- `type?` = `SINGLE | DOUBLE | DELUXE`
- `floor?`
- `search?`
- `page?`
- `limit?`

### `GET /rooms/stats`

Purpose:

- KPI room cards

Query:

- `propertyId?`

Response fields:

- `totalRooms`
- `vacantRooms`
- `occupiedRooms`
- `maintenanceRooms`
- `occupancyRate`

### `POST /rooms`

Purpose:

- Create room

Required body:

- `propertyId`
- `roomNumber`
- `floor`
- `type`
- `price`
- `deposit`

Optional body:

- `area`
- `amenities`
- `description`
- `images`

### `GET /rooms/{id}`

- Get room detail

### `PATCH /rooms/{id}`

- Update room

Can update:

- `roomNumber`
- `floor`
- `type`
- `status`
- `price`
- `deposit`
- `area`
- `amenities`
- `description`
- `images`

### `DELETE /rooms/{id}`

- Delete room

## 5. Tenants

Used by FE screen:

- `src/components/TenantManagement.tsx`
- modal `new-tenant` in `src/App.tsx`
- possibly `src/components/TenantPortal.tsx`

Endpoints:

### `GET /tenants`

Purpose:

- Tenant list

Query:

- `propertyId?`

### `POST /tenants`

Purpose:

- Create tenant

Required body:

- `propertyId`
- `fullName`
- `phone`

Optional body:

- `email`
- `idCard`
- `dateOfBirth`
- `address`
- `emergencyContact`

### `GET /tenants/{id}`

- Tenant detail

### `PUT /tenants/{id}`

- Update tenant

Can update:

- `fullName`
- `phone`
- `email`
- `idCard`
- `dateOfBirth`
- `address`
- `emergencyContact`
- `status` = `ACTIVE | INACTIVE`

### `DELETE /tenants/{id}`

- Delete tenant

## 6. Invoices

Used by FE screen:

- `src/components/InvoiceManagement.tsx`

Endpoints:

### `GET /invoices`

Purpose:

- Invoice list + filters

Query:

- `propertyId?`
- `status?` = `UNPAID | PAID | OVERDUE | CANCELLED`
- `page?`
- `limit?`

### `GET /invoices/stats`

Purpose:

- KPI invoices

Query:

- `propertyId?`

Response fields:

- `totalInvoices`
- `paidInvoices`
- `unpaidInvoices`
- `totalRevenue`
- `collectionRate`

### `POST /invoices`

Purpose:

- Create manual invoice

Required body:

- `contractId`
- `tenantId`
- `roomId`
- `propertyId`
- `billingMonth`
- `dueDate`
- `rentAmount`

Optional body:

- `electricityUsage`
- `electricityCost`
- `waterUsage`
- `waterCost`
- `serviceCharges`
- `notes`

### `POST /invoices/generate-all`

Purpose:

- Generate invoice batch for a property

Required body:

- `propertyId`
- `billingMonth`

### `GET /invoices/{id}`

- Invoice detail

### `PATCH /invoices/{id}`

- Update invoice

### `PATCH /invoices/{id}/mark-paid`

Purpose:

- Mark paid / collect money

Required body:

- `paidAmount`
- `paymentDate`

Optional body:

- `paymentMethod`
- `notes`

### `DELETE /invoices/{id}`

- Delete invoice

## 7. Maintenance

Used by FE screen:

- `src/components/Maintenance.tsx`

Endpoints:

### `GET /maintenance`

Purpose:

- Maintenance list + filters

Query:

- `propertyId?`
- `status?` = `PENDING | IN_PROGRESS | COMPLETED | CANCELLED`
- `urgency?` = `LOW | MEDIUM | HIGH | URGENT`
- `page?`
- `limit?`

### `GET /maintenance/stats`

Purpose:

- Maintenance KPIs

Query:

- `propertyId?`

Response fields:

- `totalRequests`
- `pendingRequests`
- `inProgressRequests`
- `completedRequests`
- `averageResolutionTime`

### `POST /maintenance`

Purpose:

- Create maintenance request

Required body:

- `roomId`
- `propertyId`
- `title`
- `description`
- `type`
- `urgency`

Optional body:

- `reportedById`
- `images`

### `GET /maintenance/{id}`

- Maintenance detail

### `PATCH /maintenance/{id}`

- Update maintenance request

### `PATCH /maintenance/{id}/assign`

Purpose:

- Assign worker

Required body:

- `assignedToId`

Optional body:

- `scheduledDate`

### `PATCH /maintenance/{id}/complete`

Purpose:

- Mark request completed

Required body:

- `cost`

Optional body:

- `notes`

### `DELETE /maintenance/{id}`

- Delete maintenance request

## 8. Reports

Used by FE screen:

- `src/components/Reports.tsx`

Endpoints:

### `GET /reports`

Purpose:

- Report history list

Query:

- `propertyId?`
- `page?`
- `limit?`

### `POST /reports`

Purpose:

- Generate report

Required body:

- `propertyId`
- `type` = `REVENUE | EXPENSE | PROFIT_LOSS`
- `startDate`
- `endDate`

### `GET /reports/{id}`

- Get report detail

### `DELETE /reports/{id}`

- Delete report

## 9. Files

Use for:

- room images
- maintenance images
- tenant documents if BE supports storing file URL only

Endpoint:

### `POST /files/upload`

Purpose:

- Upload single file

Content-Type:

- `multipart/form-data`

Body:

- `file`

Response:

```json
{
  "url": "https://...",
  "filename": "image.jpg",
  "size": 12345
}
```

## 10. Suggested FE Service Map

Suggested files:

- `src/api/auth.ts`
- `src/api/properties.ts`
- `src/api/rooms.ts`
- `src/api/tenants.ts`
- `src/api/invoices.ts`
- `src/api/maintenance.ts`
- `src/api/dashboard.ts`
- `src/api/reports.ts`
- `src/api/files.ts`

Suggested function names:

- `login`
- `register`
- `refreshToken`
- `logout`
- `getProperties`
- `getPropertyById`
- `createProperty`
- `updateProperty`
- `deleteProperty`
- `getRooms`
- `getRoomStats`
- `getRoomById`
- `createRoom`
- `updateRoom`
- `deleteRoom`
- `getTenants`
- `getTenantById`
- `createTenant`
- `updateTenant`
- `deleteTenant`
- `getInvoices`
- `getInvoiceStats`
- `getInvoiceById`
- `createInvoice`
- `generateInvoices`
- `updateInvoice`
- `markInvoicePaid`
- `deleteInvoice`
- `getMaintenanceList`
- `getMaintenanceStats`
- `getMaintenanceById`
- `createMaintenance`
- `updateMaintenance`
- `assignMaintenance`
- `completeMaintenance`
- `deleteMaintenance`
- `getDashboardKpis`
- `getDashboardActivities`
- `getDashboardAlerts`
- `getRevenueChart`
- `getOccupancyTrend`
- `getReports`
- `generateReport`
- `getReportById`
- `deleteReport`
- `uploadFile`

## 11. Important Mismatches To Check

### Auth response mismatch

Current FE in `src/components/AuthLoginPage.tsx` expects:

```ts
{
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    avatar: string | null;
  };
  accessToken: string;
  refreshToken: string;
}
```

But swagger currently describes login/register response closer to:

```ts
{
  id: string;
  email: string;
  fullName?: string;
  token: string;
  refreshToken: string;
}
```

This needs one of:

- update FE auth parsing
- or update BE swagger/response to match FE

### Missing contract APIs

Invoice payloads require:

- `contractId`
- `tenantId`
- `roomId`
- `propertyId`

But swagger does not show contract endpoints. If tenant screen needs lease/contract data, BE may still be missing that module in this file.

### Dashboard activity/alert/chart schema is still loose

Swagger returns generic `object` or `array<object>` for:

- `/dashboard/activities`
- `/dashboard/alerts`
- `/dashboard/revenue-chart`
- `/dashboard/occupancy-trend`

Before wiring FE strongly with TypeScript, define exact response shape.
