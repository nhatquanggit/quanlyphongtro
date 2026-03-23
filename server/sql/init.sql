-- =============================================
-- HỆ THỐNG QUẢN LÝ NHÀ TRỌ - SQL SERVER
-- T-SQL Unified Schema + Seed Data
-- Unified schema, seed, admin bootstrap, and verification
-- =============================================
-- Hướng dẫn:
--   1. Tạo database trước: CREATE DATABASE phongtro_db; GO
--   2. Chạy toàn bộ file này trong database phongtro_db
--   3. Sau đó chạy: npm run prisma:generate
-- =============================================

USE phongtro_db;
GO

-- =============================================
-- DROP TABLES NẾU TỒN TẠI (theo thứ tự phụ thuộc)
-- =============================================
IF OBJECT_ID('dbo.settings',         'U') IS NOT NULL DROP TABLE [settings];
IF OBJECT_ID('dbo.notifications',    'U') IS NOT NULL DROP TABLE [notifications];
IF OBJECT_ID('dbo.activity_logs',    'U') IS NOT NULL DROP TABLE [activity_logs];
IF OBJECT_ID('dbo.banner_images',    'U') IS NOT NULL DROP TABLE [banner_images];
IF OBJECT_ID('dbo.reports',          'U') IS NOT NULL DROP TABLE [reports];
IF OBJECT_ID('dbo.expenses',         'U') IS NOT NULL DROP TABLE [expenses];
IF OBJECT_ID('dbo.maintenance',      'U') IS NOT NULL DROP TABLE [maintenance];
IF OBJECT_ID('dbo.payments',         'U') IS NOT NULL DROP TABLE [payments];
IF OBJECT_ID('dbo.invoices',         'U') IS NOT NULL DROP TABLE [invoices];
IF OBJECT_ID('dbo.contracts',        'U') IS NOT NULL DROP TABLE [contracts];
IF OBJECT_ID('dbo.tenants',          'U') IS NOT NULL DROP TABLE [tenants];
IF OBJECT_ID('dbo.rooms',            'U') IS NOT NULL DROP TABLE [rooms];
IF OBJECT_ID('dbo.properties',       'U') IS NOT NULL DROP TABLE [properties];
IF OBJECT_ID('dbo.refresh_tokens',   'U') IS NOT NULL DROP TABLE [refresh_tokens];
IF OBJECT_ID('dbo.users',            'U') IS NOT NULL DROP TABLE [users];
GO

-- =============================================
-- TABLES
-- (Thay ENUM bằng CHECK constraints trong SQL Server)
-- =============================================

-- Users
CREATE TABLE [users] (
    [id]        NVARCHAR(36)   NOT NULL,
    [email]     NVARCHAR(255)  NOT NULL,
    [password]  NVARCHAR(255)  NOT NULL,
    [fullName]  NVARCHAR(255)  NOT NULL,
    [phone]     NVARCHAR(50)   NULL,
    [role]      NVARCHAR(20)   NOT NULL DEFAULT 'STAFF',
    [avatar]    NVARCHAR(MAX)  NULL,
    [isActive]  BIT            NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3)   NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt] DATETIME2(3)   NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [users_pkey]      PRIMARY KEY ([id]),
    CONSTRAINT [users_role_chk]  CHECK ([role] IN ('ADMIN', 'MANAGER', 'STAFF'))
);
GO

-- Refresh Tokens
CREATE TABLE [refresh_tokens] (
    [id]        NVARCHAR(36)  NOT NULL,
    [userId]    NVARCHAR(36)  NOT NULL,
    [token]     NVARCHAR(450) NOT NULL,
    [expiresAt] DATETIME2(3)  NOT NULL,
    [createdAt] DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY ([id])
);
GO

-- Properties
CREATE TABLE [properties] (
    [id]          NVARCHAR(36)   NOT NULL,
    [name]        NVARCHAR(255)  NOT NULL,
    [address]     NVARCHAR(500)  NOT NULL,
    [totalFloors] INT            NOT NULL,
    [totalRooms]  INT            NOT NULL,
    [currency]    NVARCHAR(10)   NOT NULL DEFAULT 'VND',
    [timezone]    NVARCHAR(100)  NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    [ownerId]     NVARCHAR(36)   NOT NULL,
    [settings]    NVARCHAR(MAX)  NULL,  -- JSON
    [createdAt]   DATETIME2(3)   NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]   DATETIME2(3)   NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [properties_pkey] PRIMARY KEY ([id])
);
GO

-- Rooms
CREATE TABLE [rooms] (
    [id]          NVARCHAR(36)  NOT NULL,
    [propertyId]  NVARCHAR(36)  NOT NULL,
    [roomNumber]  NVARCHAR(20)  NOT NULL,
    [floor]       INT           NOT NULL,
    [type]        NVARCHAR(20)  NOT NULL DEFAULT 'SINGLE',
    [status]      NVARCHAR(20)  NOT NULL DEFAULT 'VACANT',
    [price]       FLOAT         NOT NULL,
    [deposit]     FLOAT         NOT NULL,
    [area]        FLOAT         NULL,
    [amenities]   NVARCHAR(MAX) NULL,  -- JSON
    [description] NVARCHAR(MAX) NULL,
    [images]      NVARCHAR(MAX) NULL,  -- JSON
    [createdAt]   DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]   DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [rooms_pkey]       PRIMARY KEY ([id]),
    CONSTRAINT [rooms_type_chk]   CHECK ([type]   IN ('SINGLE', 'DOUBLE', 'VIP', 'STUDIO')),
    CONSTRAINT [rooms_status_chk] CHECK ([status] IN ('VACANT', 'OCCUPIED', 'MAINTENANCE'))
);
GO

-- Tenants
CREATE TABLE [tenants] (
    [id]               NVARCHAR(36)  NOT NULL,
    [propertyId]       NVARCHAR(36)  NOT NULL,
    [fullName]         NVARCHAR(255) NOT NULL,
    [phone]            NVARCHAR(50)  NOT NULL,
    [email]            NVARCHAR(255) NULL,
    [idCard]           NVARCHAR(50)  NULL,
    [dateOfBirth]      DATETIME2(3)  NULL,
    [address]          NVARCHAR(500) NULL,
    [emergencyContact] NVARCHAR(MAX) NULL,  -- JSON
    [status]           NVARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    [createdAt]        DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]        DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [tenants_pkey]       PRIMARY KEY ([id]),
    CONSTRAINT [tenants_status_chk] CHECK ([status] IN ('ACTIVE', 'ENDING_SOON', 'PAST'))
);
GO

-- Contracts
CREATE TABLE [contracts] (
    [id]               NVARCHAR(36)  NOT NULL,
    [roomId]           NVARCHAR(36)  NOT NULL,
    [tenantId]         NVARCHAR(36)  NOT NULL,
    [propertyId]       NVARCHAR(36)  NOT NULL,
    [startDate]        DATETIME2(3)  NOT NULL,
    [endDate]          DATETIME2(3)  NOT NULL,
    [monthlyRent]      FLOAT         NOT NULL,
    [deposit]          FLOAT         NOT NULL,
    [electricityPrice] FLOAT         NOT NULL,
    [waterPrice]       FLOAT         NOT NULL,
    [services]         NVARCHAR(MAX) NULL,  -- JSON
    [status]           NVARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    [signedDate]       DATETIME2(3)  NULL,
    [documentUrl]      NVARCHAR(MAX) NULL,
    [notes]            NVARCHAR(MAX) NULL,
    [createdAt]        DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]        DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [contracts_pkey]       PRIMARY KEY ([id]),
    CONSTRAINT [contracts_status_chk] CHECK ([status] IN ('ACTIVE', 'EXPIRED', 'TERMINATED'))
);
GO

-- Invoices
CREATE TABLE [invoices] (
    [id]               NVARCHAR(36)  NOT NULL,
    [contractId]       NVARCHAR(36)  NOT NULL,
    [tenantId]         NVARCHAR(36)  NOT NULL,
    [roomId]           NVARCHAR(36)  NOT NULL,
    [propertyId]       NVARCHAR(36)  NOT NULL,
    [billingMonth]     NVARCHAR(10)  NOT NULL,  -- 'YYYY-MM'
    [dueDate]          DATETIME2(3)  NOT NULL,
    [rentAmount]       FLOAT         NOT NULL,
    [electricityUsage] FLOAT         NOT NULL DEFAULT 0,
    [electricityCost]  FLOAT         NOT NULL DEFAULT 0,
    [waterUsage]       FLOAT         NOT NULL DEFAULT 0,
    [waterCost]        FLOAT         NOT NULL DEFAULT 0,
    [serviceCharges]   NVARCHAR(MAX) NULL,  -- JSON
    [totalAmount]      FLOAT         NOT NULL,
    [paidAmount]       FLOAT         NOT NULL DEFAULT 0,
    [remainingAmount]  FLOAT         NOT NULL,
    [status]           NVARCHAR(20)  NOT NULL DEFAULT 'UNPAID',
    [paymentDate]      DATETIME2(3)  NULL,
    [paymentMethod]    NVARCHAR(30)  NULL,
    [notes]            NVARCHAR(MAX) NULL,
    [createdAt]        DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]        DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [invoices_pkey]       PRIMARY KEY ([id]),
    CONSTRAINT [invoices_status_chk] CHECK ([status] IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'))
);
GO

-- Payments
CREATE TABLE [payments] (
    [id]            NVARCHAR(36)  NOT NULL,
    [invoiceId]     NVARCHAR(36)  NOT NULL,
    [tenantId]      NVARCHAR(36)  NOT NULL,
    [amount]        FLOAT         NOT NULL,
    [paymentMethod] NVARCHAR(30)  NOT NULL,
    [paymentDate]   DATETIME2(3)  NOT NULL,
    [reference]     NVARCHAR(255) NULL,
    [notes]         NVARCHAR(MAX) NULL,
    [receiptUrl]    NVARCHAR(MAX) NULL,
    [createdAt]     DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]     DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [payments_pkey]              PRIMARY KEY ([id]),
    CONSTRAINT [payments_paymentMethod_chk] CHECK ([paymentMethod] IN ('CASH', 'BANK_TRANSFER', 'CARD', 'MOMO', 'ZALO_PAY'))
);
GO

-- Maintenance
CREATE TABLE [maintenance] (
    [id]            NVARCHAR(36)  NOT NULL,
    [roomId]        NVARCHAR(36)  NOT NULL,
    [propertyId]    NVARCHAR(36)  NOT NULL,
    [reportedById]  NVARCHAR(36)  NULL,
    [assignedToId]  NVARCHAR(36)  NULL,
    [title]         NVARCHAR(255) NOT NULL,
    [description]   NVARCHAR(MAX) NOT NULL,
    [type]          NVARCHAR(20)  NOT NULL,
    [urgency]       NVARCHAR(10)  NOT NULL,
    [status]        NVARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    [reportedDate]  DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [scheduledDate] DATETIME2(3)  NULL,
    [completedDate] DATETIME2(3)  NULL,
    [cost]          FLOAT         NULL,
    [images]        NVARCHAR(MAX) NULL,  -- JSON
    [notes]         NVARCHAR(MAX) NULL,
    [createdAt]     DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]     DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [maintenance_pkey]         PRIMARY KEY ([id]),
    CONSTRAINT [maintenance_type_chk]     CHECK ([type]    IN ('PLUMBING', 'ELECTRICAL', 'FURNITURE', 'OTHER')),
    CONSTRAINT [maintenance_urgency_chk]  CHECK ([urgency] IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT [maintenance_status_chk]   CHECK ([status]  IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);
GO

-- Expenses
CREATE TABLE [expenses] (
    [id]          NVARCHAR(36)  NOT NULL,
    [propertyId]  NVARCHAR(36)  NOT NULL,
    [category]    NVARCHAR(20)  NOT NULL,
    [amount]      FLOAT         NOT NULL,
    [date]        DATETIME2(3)  NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [receiptUrl]  NVARCHAR(MAX) NULL,
    [createdAt]   DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]   DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [expenses_pkey]         PRIMARY KEY ([id]),
    CONSTRAINT [expenses_category_chk] CHECK ([category] IN ('MAINTENANCE', 'UTILITIES', 'SALARY', 'TAX', 'OTHER'))
);
GO

-- Reports
CREATE TABLE [reports] (
    [id]            NVARCHAR(36)  NOT NULL,
    [propertyId]    NVARCHAR(36)  NOT NULL,
    [reportType]    NVARCHAR(20)  NOT NULL,
    [period]        NVARCHAR(20)  NOT NULL,
    [totalRevenue]  FLOAT         NOT NULL DEFAULT 0,
    [totalExpenses] FLOAT         NOT NULL DEFAULT 0,
    [netProfit]     FLOAT         NOT NULL DEFAULT 0,
    [unpaidDues]    FLOAT         NOT NULL DEFAULT 0,
    [occupancyRate] FLOAT         NOT NULL DEFAULT 0,
    [data]          NVARCHAR(MAX) NULL,  -- JSON
    [createdAt]     DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]     DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [reports_pkey]           PRIMARY KEY ([id]),
    CONSTRAINT [reports_reportType_chk] CHECK ([reportType] IN ('MONTHLY', 'QUARTERLY', 'YEARLY'))
);
GO

-- Banner Images
CREATE TABLE [banner_images] (
    [id]         NVARCHAR(36)  NOT NULL,
    [propertyId] NVARCHAR(36)  NOT NULL,
    [userId]     NVARCHAR(36)  NOT NULL,
    [imageUrl]   NVARCHAR(MAX) NOT NULL,
    [order]      INT           NOT NULL DEFAULT 0,
    [isActive]   BIT           NOT NULL DEFAULT 1,
    [createdAt]  DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]  DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [banner_images_pkey] PRIMARY KEY ([id])
);
GO

-- Activity Logs
CREATE TABLE [activity_logs] (
    [id]         NVARCHAR(36)  NOT NULL,
    [userId]     NVARCHAR(36)  NOT NULL,
    [propertyId] NVARCHAR(36)  NOT NULL,
    [action]     NVARCHAR(100) NOT NULL,
    [entityType] NVARCHAR(100) NOT NULL,
    [entityId]   NVARCHAR(36)  NOT NULL,
    [details]    NVARCHAR(MAX) NULL,  -- JSON
    [ipAddress]  NVARCHAR(50)  NULL,
    [createdAt]  DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [activity_logs_pkey] PRIMARY KEY ([id])
);
GO

-- Notifications
CREATE TABLE [notifications] (
    [id]        NVARCHAR(36)  NOT NULL,
    [userId]    NVARCHAR(36)  NOT NULL,
    [type]      NVARCHAR(20)  NOT NULL,
    [title]     NVARCHAR(255) NOT NULL,
    [message]   NVARCHAR(MAX) NOT NULL,
    [isRead]    BIT           NOT NULL DEFAULT 0,
    [link]      NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [notifications_pkey]     PRIMARY KEY ([id]),
    CONSTRAINT [notifications_type_chk] CHECK ([type] IN ('PAYMENT', 'MAINTENANCE', 'CONTRACT', 'SYSTEM'))
);
GO

-- Settings
CREATE TABLE [settings] (
    [id]         NVARCHAR(36)  NOT NULL,
    [propertyId] NVARCHAR(36)  NULL,
    [userId]     NVARCHAR(36)  NULL,
    [category]   NVARCHAR(100) NOT NULL,
    [key]        NVARCHAR(100) NOT NULL,
    [value]      NVARCHAR(MAX) NOT NULL,  -- JSON
    [createdAt]  DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    [updatedAt]  DATETIME2(3)  NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT [settings_pkey] PRIMARY KEY ([id])
);
GO

-- =============================================
-- UNIQUE CONSTRAINTS
-- =============================================
CREATE UNIQUE INDEX [users_email_key]
    ON [users]([email]);

CREATE UNIQUE INDEX [refresh_tokens_token_key]
    ON [refresh_tokens]([token])
    WHERE [token] IS NOT NULL;

CREATE UNIQUE INDEX [rooms_propertyId_roomNumber_key]
    ON [rooms]([propertyId], [roomNumber]);

CREATE UNIQUE INDEX [invoices_contractId_billingMonth_key]
    ON [invoices]([contractId], [billingMonth]);

CREATE UNIQUE INDEX [reports_propertyId_period_reportType_key]
    ON [reports]([propertyId], [period], [reportType]);

-- Settings: unique nhưng cho phép NULL (dùng filtered index)
CREATE UNIQUE INDEX [settings_composite_key]
    ON [settings]([propertyId], [userId], [category], [key])
    WHERE [propertyId] IS NOT NULL AND [userId] IS NOT NULL;
GO

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX [idx_users_email]              ON [users]([email]);
CREATE INDEX [idx_users_role]               ON [users]([role]);
CREATE INDEX [idx_refresh_tokens_userId]    ON [refresh_tokens]([userId]);
CREATE INDEX [idx_properties_ownerId]       ON [properties]([ownerId]);
CREATE INDEX [idx_rooms_propertyId]         ON [rooms]([propertyId]);
CREATE INDEX [idx_rooms_status]             ON [rooms]([status]);
CREATE INDEX [idx_rooms_roomNumber]         ON [rooms]([roomNumber]);
CREATE INDEX [idx_tenants_propertyId]       ON [tenants]([propertyId]);
CREATE INDEX [idx_tenants_phone]            ON [tenants]([phone]);
CREATE INDEX [idx_tenants_status]           ON [tenants]([status]);
CREATE INDEX [idx_contracts_propertyId]     ON [contracts]([propertyId]);
CREATE INDEX [idx_contracts_roomId]         ON [contracts]([roomId]);
CREATE INDEX [idx_contracts_tenantId]       ON [contracts]([tenantId]);
CREATE INDEX [idx_contracts_status]         ON [contracts]([status]);
CREATE INDEX [idx_invoices_propertyId]      ON [invoices]([propertyId]);
CREATE INDEX [idx_invoices_tenantId]        ON [invoices]([tenantId]);
CREATE INDEX [idx_invoices_roomId]          ON [invoices]([roomId]);
CREATE INDEX [idx_invoices_status]          ON [invoices]([status]);
CREATE INDEX [idx_invoices_billingMonth]    ON [invoices]([billingMonth]);
CREATE INDEX [idx_invoices_dueDate]         ON [invoices]([dueDate]);
CREATE INDEX [idx_payments_invoiceId]       ON [payments]([invoiceId]);
CREATE INDEX [idx_payments_tenantId]        ON [payments]([tenantId]);
CREATE INDEX [idx_maintenance_propertyId]   ON [maintenance]([propertyId]);
CREATE INDEX [idx_maintenance_roomId]       ON [maintenance]([roomId]);
CREATE INDEX [idx_maintenance_status]       ON [maintenance]([status]);
CREATE INDEX [idx_maintenance_urgency]      ON [maintenance]([urgency]);
CREATE INDEX [idx_expenses_propertyId]      ON [expenses]([propertyId]);
CREATE INDEX [idx_expenses_category]        ON [expenses]([category]);
CREATE INDEX [idx_expenses_date]            ON [expenses]([date]);
CREATE INDEX [idx_reports_propertyId]       ON [reports]([propertyId]);
CREATE INDEX [idx_reports_period]           ON [reports]([period]);
CREATE INDEX [idx_banner_images_propertyId] ON [banner_images]([propertyId]);
CREATE INDEX [idx_activity_logs_userId]     ON [activity_logs]([userId]);
CREATE INDEX [idx_activity_logs_propertyId] ON [activity_logs]([propertyId]);
CREATE INDEX [idx_notifications_userId]     ON [notifications]([userId]);
CREATE INDEX [idx_notifications_isRead]     ON [notifications]([isRead]);
GO

-- =============================================
-- FOREIGN KEYS
-- =============================================
ALTER TABLE [refresh_tokens]
    ADD CONSTRAINT [refresh_tokens_userId_fkey]
    FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [properties]
    ADD CONSTRAINT [properties_ownerId_fkey]
    FOREIGN KEY ([ownerId]) REFERENCES [users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [rooms]
    ADD CONSTRAINT [rooms_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [tenants]
    ADD CONSTRAINT [tenants_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [contracts]
    ADD CONSTRAINT [contracts_roomId_fkey]
    FOREIGN KEY ([roomId]) REFERENCES [rooms]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [contracts]
    ADD CONSTRAINT [contracts_tenantId_fkey]
    FOREIGN KEY ([tenantId]) REFERENCES [tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [contracts]
    ADD CONSTRAINT [contracts_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [invoices]
    ADD CONSTRAINT [invoices_contractId_fkey]
    FOREIGN KEY ([contractId]) REFERENCES [contracts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [invoices]
    ADD CONSTRAINT [invoices_tenantId_fkey]
    FOREIGN KEY ([tenantId]) REFERENCES [tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [invoices]
    ADD CONSTRAINT [invoices_roomId_fkey]
    FOREIGN KEY ([roomId]) REFERENCES [rooms]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [invoices]
    ADD CONSTRAINT [invoices_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [payments]
    ADD CONSTRAINT [payments_invoiceId_fkey]
    FOREIGN KEY ([invoiceId]) REFERENCES [invoices]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [payments]
    ADD CONSTRAINT [payments_tenantId_fkey]
    FOREIGN KEY ([tenantId]) REFERENCES [tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [maintenance]
    ADD CONSTRAINT [maintenance_roomId_fkey]
    FOREIGN KEY ([roomId]) REFERENCES [rooms]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [maintenance]
    ADD CONSTRAINT [maintenance_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [maintenance]
    ADD CONSTRAINT [maintenance_assignedToId_fkey]
    FOREIGN KEY ([assignedToId]) REFERENCES [users]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE [expenses]
    ADD CONSTRAINT [expenses_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [reports]
    ADD CONSTRAINT [reports_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [banner_images]
    ADD CONSTRAINT [banner_images_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [banner_images]
    ADD CONSTRAINT [banner_images_userId_fkey]
    FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [activity_logs]
    ADD CONSTRAINT [activity_logs_userId_fkey]
    FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [activity_logs]
    ADD CONSTRAINT [activity_logs_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [notifications]
    ADD CONSTRAINT [notifications_userId_fkey]
    FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [settings]
    ADD CONSTRAINT [settings_propertyId_fkey]
    FOREIGN KEY ([propertyId]) REFERENCES [properties]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE [settings]
    ADD CONSTRAINT [settings_userId_fkey]
    FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;
GO

-- =============================================
-- VIEWS
-- =============================================

-- View: Hợp đồng đang hoạt động
IF OBJECT_ID('dbo.v_active_contracts', 'V') IS NOT NULL DROP VIEW [v_active_contracts];
GO
CREATE VIEW [v_active_contracts] AS
SELECT
    c.[id],
    c.[startDate],
    c.[endDate],
    c.[monthlyRent],
    c.[status],
    r.[roomNumber],
    r.[floor],
    r.[type]       AS [roomType],
    t.[fullName]   AS [tenantName],
    t.[phone]      AS [tenantPhone],
    t.[email]      AS [tenantEmail],
    p.[name]       AS [propertyName]
FROM [contracts] c
JOIN [rooms]      r ON c.[roomId]     = r.[id]
JOIN [tenants]    t ON c.[tenantId]   = t.[id]
JOIN [properties] p ON c.[propertyId] = p.[id]
WHERE c.[status] = 'ACTIVE';
GO

-- View: Hóa đơn chưa thanh toán
IF OBJECT_ID('dbo.v_unpaid_invoices', 'V') IS NOT NULL DROP VIEW [v_unpaid_invoices];
GO
CREATE VIEW [v_unpaid_invoices] AS
SELECT
    i.[id],
    i.[billingMonth],
    i.[dueDate],
    i.[totalAmount],
    i.[remainingAmount],
    i.[status],
    r.[roomNumber],
    t.[fullName]   AS [tenantName],
    t.[phone]      AS [tenantPhone],
    p.[name]       AS [propertyName],
    CASE
        WHEN i.[dueDate] < CAST(GETDATE() AS DATE) THEN 'OVERDUE'
        ELSE 'PENDING'
    END AS [paymentStatus]
FROM [invoices] i
JOIN [rooms]      r ON i.[roomId]     = r.[id]
JOIN [tenants]    t ON i.[tenantId]   = t.[id]
JOIN [properties] p ON i.[propertyId] = p.[id]
WHERE i.[status] IN ('UNPAID', 'PARTIALLY_PAID');
GO

-- View: Tỷ lệ lấp đầy phòng
IF OBJECT_ID('dbo.v_room_occupancy', 'V') IS NOT NULL DROP VIEW [v_room_occupancy];
GO
CREATE VIEW [v_room_occupancy] AS
SELECT
    p.[id]   AS [propertyId],
    p.[name] AS [propertyName],
    COUNT(r.[id])                                          AS [totalRooms],
    COUNT(CASE WHEN r.[status] = 'OCCUPIED'    THEN 1 END) AS [occupiedRooms],
    COUNT(CASE WHEN r.[status] = 'VACANT'      THEN 1 END) AS [vacantRooms],
    COUNT(CASE WHEN r.[status] = 'MAINTENANCE' THEN 1 END) AS [maintenanceRooms],
    ROUND(
        CAST(COUNT(CASE WHEN r.[status] = 'OCCUPIED' THEN 1 END) AS FLOAT)
        / NULLIF(COUNT(r.[id]), 0) * 100,
    2) AS [occupancyRate]
FROM [properties] p
LEFT JOIN [rooms] r ON p.[id] = r.[propertyId]
GROUP BY p.[id], p.[name];
GO

-- =============================================
-- STORED PROCEDURE: Tính tổng hóa đơn
-- (SQL Server dùng SP thay function scalar khi cần JSON)
-- =============================================
IF OBJECT_ID('dbo.sp_calculate_invoice_total', 'P') IS NOT NULL
    DROP PROCEDURE [sp_calculate_invoice_total];
GO
CREATE PROCEDURE [sp_calculate_invoice_total]
    @rent_amount       FLOAT,
    @electricity_cost  FLOAT,
    @water_cost        FLOAT,
    @service_charges   NVARCHAR(MAX),   -- JSON: {"internet": 100000, "parking": 50000}
    @total             FLOAT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @service_total FLOAT = 0;

    SELECT @service_total = ISNULL(SUM(CAST([value] AS FLOAT)), 0)
    FROM OPENJSON(@service_charges);

    SET @total = ISNULL(@rent_amount, 0)
               + ISNULL(@electricity_cost, 0)
               + ISNULL(@water_cost, 0)
               + @service_total;
END;
GO

-- =============================================
-- TRIGGERS: Tự động cập nhật updatedAt
-- (AFTER UPDATE + kiểm tra để tránh vòng lặp)
-- =============================================
CREATE OR ALTER TRIGGER [trg_users_updatedAt]
ON [users] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [users] SET [updatedAt] = SYSDATETIME()
        FROM [users] u INNER JOIN INSERTED i ON u.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_properties_updatedAt]
ON [properties] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [properties] SET [updatedAt] = SYSDATETIME()
        FROM [properties] p INNER JOIN INSERTED i ON p.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_rooms_updatedAt]
ON [rooms] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [rooms] SET [updatedAt] = SYSDATETIME()
        FROM [rooms] r INNER JOIN INSERTED i ON r.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_tenants_updatedAt]
ON [tenants] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [tenants] SET [updatedAt] = SYSDATETIME()
        FROM [tenants] t INNER JOIN INSERTED i ON t.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_contracts_updatedAt]
ON [contracts] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [contracts] SET [updatedAt] = SYSDATETIME()
        FROM [contracts] c INNER JOIN INSERTED i ON c.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_invoices_updatedAt]
ON [invoices] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [invoices] SET [updatedAt] = SYSDATETIME()
        FROM [invoices] v INNER JOIN INSERTED i ON v.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_payments_updatedAt]
ON [payments] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [payments] SET [updatedAt] = SYSDATETIME()
        FROM [payments] p INNER JOIN INSERTED i ON p.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_maintenance_updatedAt]
ON [maintenance] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [maintenance] SET [updatedAt] = SYSDATETIME()
        FROM [maintenance] m INNER JOIN INSERTED i ON m.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_expenses_updatedAt]
ON [expenses] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [expenses] SET [updatedAt] = SYSDATETIME()
        FROM [expenses] e INNER JOIN INSERTED i ON e.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_reports_updatedAt]
ON [reports] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [reports] SET [updatedAt] = SYSDATETIME()
        FROM [reports] r INNER JOIN INSERTED i ON r.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_banner_images_updatedAt]
ON [banner_images] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [banner_images] SET [updatedAt] = SYSDATETIME()
        FROM [banner_images] b INNER JOIN INSERTED i ON b.[id] = i.[id];
END;
GO

CREATE OR ALTER TRIGGER [trg_settings_updatedAt]
ON [settings] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([updatedAt])
        UPDATE [settings] SET [updatedAt] = SYSDATETIME()
        FROM [settings] s INNER JOIN INSERTED i ON s.[id] = i.[id];
END;
GO

-- =============================================
-- DỮ LIỆU KHỞI TẠO: Admin user
-- Password: Admin@123 (bcrypt 12 rounds)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [users] WHERE [email] = 'admin@phongtro.com')
BEGIN
    INSERT INTO [users] ([id], [email], [password], [fullName], [phone], [role], [isActive], [createdAt], [updatedAt])
    VALUES (
        LOWER(CAST(NEWID() AS NVARCHAR(36))),
        'admin@phongtro.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ3.',
        N'Administrator',
        '0123456789',
        'ADMIN',
        1,
        SYSDATETIME(),
        SYSDATETIME()
    );
    PRINT 'Admin user created: admin@phongtro.com / Admin@123';
END
ELSE
    PRINT 'Admin user already exists.';
GO

-- =============================================
-- SEED DỮ LIỆU MẪU
-- (Chạy sau khi đã có user test@phongtro.com)
-- =============================================
DECLARE @admin_user_id  NVARCHAR(36);
DECLARE @property_id    NVARCHAR(36);
DECLARE @room_101_id    NVARCHAR(36);
DECLARE @room_102_id    NVARCHAR(36);
DECLARE @room_103_id    NVARCHAR(36);
DECLARE @room_201_id    NVARCHAR(36);
DECLARE @room_202_id    NVARCHAR(36);
DECLARE @tenant_1_id    NVARCHAR(36);
DECLARE @tenant_2_id    NVARCHAR(36);
DECLARE @tenant_3_id    NVARCHAR(36);
DECLARE @contract_1_id  NVARCHAR(36);
DECLARE @contract_2_id  NVARCHAR(36);
DECLARE @contract_3_id  NVARCHAR(36);

SELECT @admin_user_id = [id] FROM [users] WHERE [email] = 'admin@phongtro.com';

IF @admin_user_id IS NULL
BEGIN
    PRINT 'Không tìm thấy admin user. Chạy phần khởi tạo admin trước.';
    GOTO EndSeed;
END

-- Bỏ qua nếu đã có dữ liệu mẫu
IF EXISTS (SELECT 1 FROM [properties] WHERE [name] = N'Nhà Trọ Sinh Viên ABC')
BEGIN
    PRINT 'Dữ liệu mẫu đã tồn tại, bỏ qua.';
    GOTO EndSeed;
END

-- 1. Property
SET @property_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [properties] ([id], [name], [address], [totalFloors], [totalRooms], [currency], [timezone], [ownerId], [createdAt], [updatedAt])
VALUES (@property_id, N'Nhà Trọ Sinh Viên ABC', N'123 Đường Lê Văn Việt, Quận 9, TP.HCM',
        3, 15, 'VND', 'Asia/Ho_Chi_Minh', @admin_user_id, SYSDATETIME(), SYSDATETIME());

-- 2. Rooms
SET @room_101_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [rooms] ([id],[propertyId],[roomNumber],[floor],[type],[status],[price],[deposit],[area],[amenities],[description],[createdAt],[updatedAt])
VALUES (@room_101_id, @property_id, '101', 1, 'SINGLE', 'OCCUPIED', 2500000, 2500000, 20,
        '{"wifi":true,"airConditioner":true,"waterHeater":true,"bed":true,"wardrobe":true}',
        N'Phòng đơn tầng 1, đầy đủ tiện nghi', SYSDATETIME(), SYSDATETIME());

SET @room_102_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [rooms] ([id],[propertyId],[roomNumber],[floor],[type],[status],[price],[deposit],[area],[amenities],[description],[createdAt],[updatedAt])
VALUES (@room_102_id, @property_id, '102', 1, 'SINGLE', 'OCCUPIED', 2500000, 2500000, 20,
        '{"wifi":true,"airConditioner":true,"waterHeater":true,"bed":true,"wardrobe":true}',
        N'Phòng đơn tầng 1, view đẹp', SYSDATETIME(), SYSDATETIME());

SET @room_103_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [rooms] ([id],[propertyId],[roomNumber],[floor],[type],[status],[price],[deposit],[area],[amenities],[description],[createdAt],[updatedAt])
VALUES (@room_103_id, @property_id, '103', 1, 'DOUBLE', 'VACANT', 3500000, 3500000, 30,
        '{"wifi":true,"airConditioner":true,"waterHeater":true,"bed":true,"wardrobe":true,"kitchen":true}',
        N'Phòng đôi tầng 1, có bếp', SYSDATETIME(), SYSDATETIME());

SET @room_201_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [rooms] ([id],[propertyId],[roomNumber],[floor],[type],[status],[price],[deposit],[area],[amenities],[description],[createdAt],[updatedAt])
VALUES (@room_201_id, @property_id, '201', 2, 'VIP', 'OCCUPIED', 4000000, 4000000, 35,
        '{"wifi":true,"airConditioner":true,"waterHeater":true,"bed":true,"wardrobe":true,"kitchen":true,"balcony":true}',
        N'Phòng VIP tầng 2, có ban công', SYSDATETIME(), SYSDATETIME());

SET @room_202_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [rooms] ([id],[propertyId],[roomNumber],[floor],[type],[status],[price],[deposit],[area],[amenities],[description],[createdAt],[updatedAt])
VALUES (@room_202_id, @property_id, '202', 2, 'SINGLE', 'VACANT', 2800000, 2800000, 22,
        '{"wifi":true,"airConditioner":true,"waterHeater":true,"bed":true,"wardrobe":true}',
        N'Phòng đơn tầng 2', SYSDATETIME(), SYSDATETIME());

-- 3. Tenants
SET @tenant_1_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [tenants] ([id],[propertyId],[fullName],[phone],[email],[idCard],[dateOfBirth],[address],[emergencyContact],[status],[createdAt],[updatedAt])
VALUES (@tenant_1_id, @property_id, N'Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', '001234567890',
        '1998-05-15', N'456 Đường ABC, Quận 1, TP.HCM',
        N'{"name":"Nguyễn Văn Bình","phone":"0912345678","relationship":"Bố"}',
        'ACTIVE', SYSDATETIME(), SYSDATETIME());

SET @tenant_2_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [tenants] ([id],[propertyId],[fullName],[phone],[email],[idCard],[dateOfBirth],[address],[emergencyContact],[status],[createdAt],[updatedAt])
VALUES (@tenant_2_id, @property_id, N'Trần Thị Bình', '0907654321', 'tranthib@gmail.com', '001234567891',
        '1999-08-20', N'789 Đường XYZ, Quận 3, TP.HCM',
        N'{"name":"Trần Văn Cường","phone":"0923456789","relationship":"Anh trai"}',
        'ACTIVE', SYSDATETIME(), SYSDATETIME());

SET @tenant_3_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [tenants] ([id],[propertyId],[fullName],[phone],[email],[idCard],[dateOfBirth],[address],[emergencyContact],[status],[createdAt],[updatedAt])
VALUES (@tenant_3_id, @property_id, N'Lê Minh Châu', '0909876543', 'leminhchau@gmail.com', '001234567892',
        '2000-03-10', N'321 Đường DEF, Quận 7, TP.HCM',
        N'{"name":"Lê Văn Dũng","phone":"0934567890","relationship":"Bố"}',
        'ACTIVE', SYSDATETIME(), SYSDATETIME());

-- 4. Contracts
SET @contract_1_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [contracts] ([id],[roomId],[tenantId],[propertyId],[startDate],[endDate],[monthlyRent],[deposit],[electricityPrice],[waterPrice],[services],[status],[signedDate],[createdAt],[updatedAt])
VALUES (@contract_1_id, @room_101_id, @tenant_1_id, @property_id,
        '2024-01-01','2024-12-31', 2500000, 2500000, 3500, 20000,
        '{"internet":100000,"parking":50000}',
        'ACTIVE','2023-12-25', SYSDATETIME(), SYSDATETIME());

SET @contract_2_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [contracts] ([id],[roomId],[tenantId],[propertyId],[startDate],[endDate],[monthlyRent],[deposit],[electricityPrice],[waterPrice],[services],[status],[signedDate],[createdAt],[updatedAt])
VALUES (@contract_2_id, @room_102_id, @tenant_2_id, @property_id,
        '2024-02-01','2025-01-31', 2500000, 2500000, 3500, 20000,
        '{"internet":100000}',
        'ACTIVE','2024-01-25', SYSDATETIME(), SYSDATETIME());

SET @contract_3_id = LOWER(CAST(NEWID() AS NVARCHAR(36)));
INSERT INTO [contracts] ([id],[roomId],[tenantId],[propertyId],[startDate],[endDate],[monthlyRent],[deposit],[electricityPrice],[waterPrice],[services],[status],[signedDate],[createdAt],[updatedAt])
VALUES (@contract_3_id, @room_201_id, @tenant_3_id, @property_id,
        '2024-03-01','2025-02-28', 4000000, 4000000, 3500, 20000,
        '{"internet":100000,"parking":50000,"cleaning":200000}',
        'ACTIVE','2024-02-25', SYSDATETIME(), SYSDATETIME());

-- 5. Invoices
INSERT INTO [invoices] ([id],[contractId],[tenantId],[roomId],[propertyId],[billingMonth],[dueDate],[rentAmount],[electricityUsage],[electricityCost],[waterUsage],[waterCost],[serviceCharges],[totalAmount],[paidAmount],[remainingAmount],[status],[paymentDate],[paymentMethod],[createdAt],[updatedAt])
VALUES
(LOWER(CAST(NEWID() AS NVARCHAR(36))), @contract_1_id, @tenant_1_id, @room_101_id, @property_id,
 '2024-01','2024-01-05', 2500000, 120, 420000, 8, 160000, '{"internet":100000,"parking":50000}',
 3230000, 3230000, 0, 'PAID','2024-01-03','BANK_TRANSFER', SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @contract_1_id, @tenant_1_id, @room_101_id, @property_id,
 '2024-02','2024-02-05', 2500000, 115, 402500, 7, 140000, '{"internet":100000,"parking":50000}',
 3192500, 3192500, 0, 'PAID','2024-02-04','CASH', SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @contract_1_id, @tenant_1_id, @room_101_id, @property_id,
 '2024-03','2024-03-05', 2500000, 0, 0, 0, 0, '{"internet":100000,"parking":50000}',
 2650000, 0, 2650000, 'UNPAID', NULL, NULL, SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @contract_2_id, @tenant_2_id, @room_102_id, @property_id,
 '2024-02','2024-02-05', 2500000, 100, 350000, 6, 120000, '{"internet":100000}',
 3070000, 3070000, 0, 'PAID','2024-02-02','MOMO', SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @contract_2_id, @tenant_2_id, @room_102_id, @property_id,
 '2024-03','2024-03-05', 2500000, 0, 0, 0, 0, '{"internet":100000}',
 2600000, 0, 2600000, 'UNPAID', NULL, NULL, SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @contract_3_id, @tenant_3_id, @room_201_id, @property_id,
 '2024-03','2024-03-05', 4000000, 0, 0, 0, 0, '{"internet":100000,"parking":50000,"cleaning":200000}',
 4350000, 0, 4350000, 'UNPAID', NULL, NULL, SYSDATETIME(), SYSDATETIME());

-- 6. Maintenance
INSERT INTO [maintenance] ([id],[roomId],[propertyId],[reportedById],[title],[description],[type],[urgency],[status],[reportedDate],[cost],[createdAt],[updatedAt])
VALUES
(LOWER(CAST(NEWID() AS NVARCHAR(36))), @room_101_id, @property_id, @admin_user_id,
 N'Vòi nước bị rò rỉ', N'Vòi nước trong phòng tắm bị rò rỉ nước, cần sửa chữa gấp',
 'PLUMBING','HIGH','COMPLETED','2024-02-10', 300000, SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @room_102_id, @property_id, @admin_user_id,
 N'Điều hòa không mát', N'Điều hòa không làm lạnh, có thể cần bơm gas',
 'ELECTRICAL','MEDIUM','IN_PROGRESS','2024-03-01', NULL, SYSDATETIME(), SYSDATETIME()),

(LOWER(CAST(NEWID() AS NVARCHAR(36))), @room_201_id, @property_id, @admin_user_id,
 N'Cửa phòng kêu cọt kẹt', N'Cửa phòng bị kêu cọt kẹt khi đóng mở',
 'FURNITURE','LOW','PENDING','2024-03-05', NULL, SYSDATETIME(), SYSDATETIME());

-- 7. Expenses
INSERT INTO [expenses] ([id],[propertyId],[category],[amount],[date],[description],[createdAt],[updatedAt])
VALUES
(LOWER(CAST(NEWID() AS NVARCHAR(36))), @property_id, 'UTILITIES',    2500000, '2024-01-15', N'Tiền điện nước tháng 1/2024', SYSDATETIME(), SYSDATETIME()),
(LOWER(CAST(NEWID() AS NVARCHAR(36))), @property_id, 'MAINTENANCE',   300000, '2024-02-10', N'Sửa vòi nước phòng 101',       SYSDATETIME(), SYSDATETIME()),
(LOWER(CAST(NEWID() AS NVARCHAR(36))), @property_id, 'UTILITIES',    2800000, '2024-02-15', N'Tiền điện nước tháng 2/2024', SYSDATETIME(), SYSDATETIME()),
(LOWER(CAST(NEWID() AS NVARCHAR(36))), @property_id, 'SALARY',       5000000, '2024-02-28', N'Lương nhân viên tháng 2/2024', SYSDATETIME(), SYSDATETIME());

PRINT '=== SEED DATA HOÀN THÀNH ===';
PRINT '1 Property, 5 Rooms, 3 Tenants, 3 Contracts, 6 Invoices, 3 Maintenance, 4 Expenses';

EndSeed:
GO

-- =============================================
-- KIỂM TRA (tương đương check_users.sql)
-- =============================================
SELECT [id], [email], [fullName], [role], [isActive] FROM [users];
GO

-- =============================================
-- TIỆN ÍCH: THÊM TỐI ĐA 10 HỢP ĐỒNG MẪU
-- Chạy block này khi đã có rooms/tenants trong DB
-- =============================================
DECLARE @new_contracts TABLE (
    [id]         NVARCHAR(36),
    [roomId]     NVARCHAR(36),
    [tenantId]   NVARCHAR(36),
    [propertyId] NVARCHAR(36)
);

;WITH RoomCandidates AS (
    SELECT
        r.[id],
        r.[propertyId],
        r.[price],
        r.[deposit],
        ROW_NUMBER() OVER (PARTITION BY r.[propertyId] ORDER BY r.[floor], r.[roomNumber]) AS rn
    FROM [rooms] r
    WHERE r.[status] = 'VACANT'
      AND NOT EXISTS (
            SELECT 1
            FROM [contracts] c
            WHERE c.[roomId] = r.[id]
              AND c.[status] = 'ACTIVE'
      )
),
TenantCandidates AS (
    SELECT
        t.[id],
        t.[propertyId],
        ROW_NUMBER() OVER (PARTITION BY t.[propertyId] ORDER BY t.[createdAt], t.[fullName]) AS rn
    FROM [tenants] t
    WHERE NOT EXISTS (
            SELECT 1
            FROM [contracts] c
            WHERE c.[tenantId] = t.[id]
              AND c.[status] = 'ACTIVE'
      )
),
TenantCounts AS (
    SELECT [propertyId], COUNT(*) AS cnt
    FROM TenantCandidates
    GROUP BY [propertyId]
),
Pairs AS (
    SELECT
        r.[id]         AS roomId,
        r.[propertyId] AS propertyId,
        r.[price]      AS roomPrice,
        r.[deposit]    AS roomDeposit,
        r.rn           AS roomRn,
        t.[id]         AS tenantId
    FROM RoomCandidates r
    JOIN TenantCounts tc
      ON tc.[propertyId] = r.[propertyId]
     AND tc.cnt > 0
    JOIN TenantCandidates t
      ON t.[propertyId] = r.[propertyId]
     AND t.rn = ((r.rn - 1) % tc.cnt) + 1
)
INSERT INTO [contracts] (
    [id], [roomId], [tenantId], [propertyId],
    [startDate], [endDate],
    [monthlyRent], [deposit], [electricityPrice], [waterPrice],
    [services], [status], [signedDate], [notes], [createdAt], [updatedAt]
)
OUTPUT INSERTED.[id], INSERTED.[roomId], INSERTED.[tenantId], INSERTED.[propertyId]
INTO @new_contracts([id], [roomId], [tenantId], [propertyId])
SELECT TOP (10)
    LOWER(CAST(NEWID() AS NVARCHAR(36))) AS [id],
    p.[roomId],
    p.[tenantId],
    p.[propertyId],
    CAST(SYSDATETIME() AS DATE) AS [startDate],
    DATEADD(MONTH,
        CASE (p.[roomRn] - 1) % 4
            WHEN 0 THEN 3
            WHEN 1 THEN 6
            WHEN 2 THEN 9
            ELSE 12
        END,
        CAST(SYSDATETIME() AS DATE)
    ) AS [endDate],
    p.[roomPrice] AS [monthlyRent],
    p.[roomDeposit] AS [deposit],
    3500 AS [electricityPrice],
    18000 AS [waterPrice],
    N'{"internet":100000,"parking":50000}' AS [services],
    'ACTIVE' AS [status],
    CAST(SYSDATETIME() AS DATE) AS [signedDate],
    N'Hợp đồng mẫu tạo từ init.sql' AS [notes],
    SYSDATETIME() AS [createdAt],
    SYSDATETIME() AS [updatedAt]
FROM Pairs p
ORDER BY p.[propertyId], p.[roomRn];

UPDATE r
SET
    r.[status] = 'OCCUPIED',
    r.[updatedAt] = SYSDATETIME()
FROM [rooms] r
JOIN @new_contracts nc ON nc.[roomId] = r.[id];

UPDATE t
SET
    t.[status] = 'ACTIVE',
    t.[updatedAt] = SYSDATETIME()
FROM [tenants] t
JOIN @new_contracts nc ON nc.[tenantId] = t.[id];

SELECT
    COUNT(*) AS [insertedContracts]
FROM @new_contracts;
GO
