-- =============================================
-- HỆ THỐNG QUẢN LÝ NHÀ TRỌ - DATABASE SCHEMA
-- PostgreSQL Database Schema
-- Generated from Prisma Schema
-- =============================================

-- Create Database (Run this separately if needed)
-- CREATE DATABASE phongtro_db;
-- \c phongtro_db;

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'STAFF');
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'VIP', 'STUDIO');
CREATE TYPE "RoomStatus" AS ENUM ('VACANT', 'OCCUPIED', 'MAINTENANCE');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'ENDING_SOON', 'PAST');
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED');
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'MOMO', 'ZALO_PAY');
CREATE TYPE "MaintenanceType" AS ENUM ('PLUMBING', 'ELECTRICAL', 'FURNITURE', 'OTHER');
CREATE TYPE "MaintenanceUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ExpenseCategory" AS ENUM ('MAINTENANCE', 'UTILITIES', 'SALARY', 'TAX', 'OTHER');
CREATE TYPE "ReportType" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT', 'MAINTENANCE', 'CONTRACT', 'SYSTEM');

-- =============================================
-- TABLES
-- =============================================

-- Users Table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Refresh Tokens Table
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- Properties Table
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL,
    "totalRooms" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "ownerId" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- Rooms Table
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "type" "RoomType" NOT NULL DEFAULT 'SINGLE',
    "status" "RoomStatus" NOT NULL DEFAULT 'VACANT',
    "price" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "area" DOUBLE PRECISION,
    "amenities" JSONB,
    "description" TEXT,
    "images" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- Tenants Table
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "idCard" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "emergencyContact" JSONB,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- Contracts Table
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "electricityPrice" DOUBLE PRECISION NOT NULL,
    "waterPrice" DOUBLE PRECISION NOT NULL,
    "services" JSONB,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "signedDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- Invoices Table
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "billingMonth" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "electricityUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electricityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceCharges" JSONB,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Payments Table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Maintenance Table
CREATE TABLE "maintenance" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reportedById" TEXT,
    "assignedToId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "urgency" "MaintenanceUrgency" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "images" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_pkey" PRIMARY KEY ("id")
);

-- Expenses Table
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- Reports Table
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "period" TEXT NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unpaidDues" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "occupancyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- Banner Images Table
CREATE TABLE "banner_images" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_images_pkey" PRIMARY KEY ("id")
);

-- Activity Logs Table
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- Notifications Table
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Settings Table
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- UNIQUE CONSTRAINTS
-- =============================================

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE UNIQUE INDEX "rooms_propertyId_roomNumber_key" ON "rooms"("propertyId", "roomNumber");
CREATE UNIQUE INDEX "invoices_contractId_billingMonth_key" ON "invoices"("contractId", "billingMonth");
CREATE UNIQUE INDEX "reports_propertyId_period_reportType_key" ON "reports"("propertyId", "period", "reportType");
CREATE UNIQUE INDEX "settings_propertyId_userId_category_key_key" ON "settings"("propertyId", "userId", "category", "key");

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_refresh_tokens_userId" ON "refresh_tokens"("userId");
CREATE INDEX "idx_properties_ownerId" ON "properties"("ownerId");
CREATE INDEX "idx_rooms_propertyId" ON "rooms"("propertyId");
CREATE INDEX "idx_rooms_status" ON "rooms"("status");
CREATE INDEX "idx_rooms_roomNumber" ON "rooms"("roomNumber");
CREATE INDEX "idx_tenants_propertyId" ON "tenants"("propertyId");
CREATE INDEX "idx_tenants_phone" ON "tenants"("phone");
CREATE INDEX "idx_tenants_status" ON "tenants"("status");
CREATE INDEX "idx_contracts_propertyId" ON "contracts"("propertyId");
CREATE INDEX "idx_contracts_roomId" ON "contracts"("roomId");
CREATE INDEX "idx_contracts_tenantId" ON "contracts"("tenantId");
CREATE INDEX "idx_contracts_status" ON "contracts"("status");
CREATE INDEX "idx_invoices_propertyId" ON "invoices"("propertyId");
CREATE INDEX "idx_invoices_tenantId" ON "invoices"("tenantId");
CREATE INDEX "idx_invoices_roomId" ON "invoices"("roomId");
CREATE INDEX "idx_invoices_status" ON "invoices"("status");
CREATE INDEX "idx_invoices_billingMonth" ON "invoices"("billingMonth");
CREATE INDEX "idx_invoices_dueDate" ON "invoices"("dueDate");
CREATE INDEX "idx_payments_invoiceId" ON "payments"("invoiceId");
CREATE INDEX "idx_payments_tenantId" ON "payments"("tenantId");
CREATE INDEX "idx_maintenance_propertyId" ON "maintenance"("propertyId");
CREATE INDEX "idx_maintenance_roomId" ON "maintenance"("roomId");
CREATE INDEX "idx_maintenance_status" ON "maintenance"("status");
CREATE INDEX "idx_maintenance_urgency" ON "maintenance"("urgency");
CREATE INDEX "idx_expenses_propertyId" ON "expenses"("propertyId");
CREATE INDEX "idx_expenses_category" ON "expenses"("category");
CREATE INDEX "idx_expenses_date" ON "expenses"("date");
CREATE INDEX "idx_reports_propertyId" ON "reports"("propertyId");
CREATE INDEX "idx_reports_period" ON "reports"("period");
CREATE INDEX "idx_banner_images_propertyId" ON "banner_images"("propertyId");
CREATE INDEX "idx_activity_logs_userId" ON "activity_logs"("userId");
CREATE INDEX "idx_activity_logs_propertyId" ON "activity_logs"("propertyId");
CREATE INDEX "idx_notifications_userId" ON "notifications"("userId");
CREATE INDEX "idx_notifications_isRead" ON "notifications"("isRead");

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rooms" ADD CONSTRAINT "rooms_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tenants" ADD CONSTRAINT "tenants_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contracts" ADD CONSTRAINT "contracts_roomId_fkey" 
    FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contracts" ADD CONSTRAINT "contracts_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contracts" ADD CONSTRAINT "contracts_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contractId_fkey" 
    FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_roomId_fkey" 
    FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_roomId_fkey" 
    FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_assignedToId_fkey" 
    FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reports" ADD CONSTRAINT "reports_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "banner_images" ADD CONSTRAINT "banner_images_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "banner_images" ADD CONSTRAINT "banner_images_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "settings" ADD CONSTRAINT "settings_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================
-- SAMPLE DATA (Optional - Comment out if not needed)
-- =============================================

-- Insert sample admin user (password: Admin@123)
-- Password hash generated with bcrypt, 12 rounds
INSERT INTO "users" ("id", "email", "password", "fullName", "phone", "role", "isActive", "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'admin@phongtro.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ3.',
    'Administrator',
    '0123456789',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =============================================
-- VIEWS (Optional - for reporting)
-- =============================================

-- View: Active Contracts with Room and Tenant Info
CREATE OR REPLACE VIEW "v_active_contracts" AS
SELECT 
    c.id,
    c."startDate",
    c."endDate",
    c."monthlyRent",
    c.status,
    r."roomNumber",
    r.floor,
    r.type as "roomType",
    t."fullName" as "tenantName",
    t.phone as "tenantPhone",
    t.email as "tenantEmail",
    p.name as "propertyName"
FROM contracts c
JOIN rooms r ON c."roomId" = r.id
JOIN tenants t ON c."tenantId" = t.id
JOIN properties p ON c."propertyId" = p.id
WHERE c.status = 'ACTIVE';

-- View: Unpaid Invoices Summary
CREATE OR REPLACE VIEW "v_unpaid_invoices" AS
SELECT 
    i.id,
    i."billingMonth",
    i."dueDate",
    i."totalAmount",
    i."remainingAmount",
    i.status,
    r."roomNumber",
    t."fullName" as "tenantName",
    t.phone as "tenantPhone",
    p.name as "propertyName",
    CASE 
        WHEN i."dueDate" < CURRENT_DATE THEN 'OVERDUE'
        ELSE 'PENDING'
    END as "paymentStatus"
FROM invoices i
JOIN rooms r ON i."roomId" = r.id
JOIN tenants t ON i."tenantId" = t.id
JOIN properties p ON i."propertyId" = p.id
WHERE i.status IN ('UNPAID', 'PARTIALLY_PAID');

-- View: Room Occupancy Status
CREATE OR REPLACE VIEW "v_room_occupancy" AS
SELECT 
    p.id as "propertyId",
    p.name as "propertyName",
    COUNT(r.id) as "totalRooms",
    COUNT(CASE WHEN r.status = 'OCCUPIED' THEN 1 END) as "occupiedRooms",
    COUNT(CASE WHEN r.status = 'VACANT' THEN 1 END) as "vacantRooms",
    COUNT(CASE WHEN r.status = 'MAINTENANCE' THEN 1 END) as "maintenanceRooms",
    ROUND(
        (COUNT(CASE WHEN r.status = 'OCCUPIED' THEN 1 END)::NUMERIC / 
         NULLIF(COUNT(r.id), 0) * 100), 2
    ) as "occupancyRate"
FROM properties p
LEFT JOIN rooms r ON p.id = r."propertyId"
GROUP BY p.id, p.name;

-- =============================================
-- FUNCTIONS (Optional - for business logic)
-- =============================================

-- Function: Calculate Invoice Total
CREATE OR REPLACE FUNCTION calculate_invoice_total(
    p_rent_amount DOUBLE PRECISION,
    p_electricity_cost DOUBLE PRECISION,
    p_water_cost DOUBLE PRECISION,
    p_service_charges JSONB
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    v_total DOUBLE PRECISION;
    v_service_total DOUBLE PRECISION := 0;
BEGIN
    -- Calculate base total
    v_total := COALESCE(p_rent_amount, 0) + 
               COALESCE(p_electricity_cost, 0) + 
               COALESCE(p_water_cost, 0);
    
    -- Add service charges if exists
    IF p_service_charges IS NOT NULL THEN
        SELECT SUM((value)::DOUBLE PRECISION)
        INTO v_service_total
        FROM jsonb_each_text(p_service_charges)
        WHERE (value)::TEXT ~ '^[0-9]+\.?[0-9]*$';
        
        v_total := v_total + COALESCE(v_service_total, 0);
    END IF;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS (Optional - for audit trail)
-- =============================================

-- Trigger: Update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON "properties"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON "rooms"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON "tenants"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON "contracts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON "invoices"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "payments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON "maintenance"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON "expenses"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "reports"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banner_images_updated_at BEFORE UPDATE ON "banner_images"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON "settings"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- GRANTS (Optional - for security)
-- =============================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO phongtro_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO phongtro_app_user;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE "users" IS 'Bảng quản lý người dùng hệ thống';
COMMENT ON TABLE "properties" IS 'Bảng quản lý tòa nhà/cơ sở';
COMMENT ON TABLE "rooms" IS 'Bảng quản lý phòng trọ';
COMMENT ON TABLE "tenants" IS 'Bảng quản lý khách thuê';
COMMENT ON TABLE "contracts" IS 'Bảng quản lý hợp đồng thuê';
COMMENT ON TABLE "invoices" IS 'Bảng quản lý hóa đơn';
COMMENT ON TABLE "payments" IS 'Bảng quản lý thanh toán';
COMMENT ON TABLE "maintenance" IS 'Bảng quản lý yêu cầu bảo trì';
COMMENT ON TABLE "expenses" IS 'Bảng quản lý chi phí';
COMMENT ON TABLE "reports" IS 'Bảng lưu trữ báo cáo tài chính';

-- =============================================
-- END OF SCHEMA
-- =============================================
