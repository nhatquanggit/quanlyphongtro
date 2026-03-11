-- =============================================
-- SEED DỮ LIỆU MẪU CHO HỆ THỐNG QUẢN LÝ NHÀ TRỌ
-- =============================================

-- Lấy userId của admin
DO $$
DECLARE
    admin_user_id TEXT;
    property_id TEXT;
    room_101_id TEXT;
    room_102_id TEXT;
    room_103_id TEXT;
    room_201_id TEXT;
    room_202_id TEXT;
    tenant_1_id TEXT;
    tenant_2_id TEXT;
    tenant_3_id TEXT;
    contract_1_id TEXT;
    contract_2_id TEXT;
    contract_3_id TEXT;
BEGIN
    -- Lấy admin user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'test@phongtro.com' LIMIT 1;

    -- 1. TẠO PROPERTY (Tòa nhà)
    INSERT INTO properties (id, name, address, "totalFloors", "totalRooms", currency, timezone, "ownerId", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'Nhà Trọ Sinh Viên ABC',
        '123 Đường Lê Văn Việt, Quận 9, TP.HCM',
        3,
        15,
        'VND',
        'Asia/Ho_Chi_Minh',
        admin_user_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO property_id;

    RAISE NOTICE 'Created Property: %', property_id;

    -- 2. TẠO ROOMS (Phòng trọ)
    -- Tầng 1
    INSERT INTO rooms (id, "propertyId", "roomNumber", floor, type, status, price, deposit, area, amenities, description, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, '101', 1, 'SINGLE', 'OCCUPIED', 2500000, 2500000, 20, 
     '{"wifi": true, "airConditioner": true, "waterHeater": true, "bed": true, "wardrobe": true}'::jsonb,
     'Phòng đơn tầng 1, đầy đủ tiện nghi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO room_101_id;

    INSERT INTO rooms (id, "propertyId", "roomNumber", floor, type, status, price, deposit, area, amenities, description, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, '102', 1, 'SINGLE', 'OCCUPIED', 2500000, 2500000, 20,
     '{"wifi": true, "airConditioner": true, "waterHeater": true, "bed": true, "wardrobe": true}'::jsonb,
     'Phòng đơn tầng 1, view đẹp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO room_102_id;

    INSERT INTO rooms (id, "propertyId", "roomNumber", floor, type, status, price, deposit, area, amenities, description, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, '103', 1, 'DOUBLE', 'VACANT', 3500000, 3500000, 30,
     '{"wifi": true, "airConditioner": true, "waterHeater": true, "bed": true, "wardrobe": true, "kitchen": true}'::jsonb,
     'Phòng đôi tầng 1, có bếp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO room_103_id;

    -- Tầng 2
    INSERT INTO rooms (id, "propertyId", "roomNumber", floor, type, status, price, deposit, area, amenities, description, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, '201', 2, 'VIP', 'OCCUPIED', 4000000, 4000000, 35,
     '{"wifi": true, "airConditioner": true, "waterHeater": true, "bed": true, "wardrobe": true, "kitchen": true, "balcony": true}'::jsonb,
     'Phòng VIP tầng 2, có ban công', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO room_201_id;

    INSERT INTO rooms (id, "propertyId", "roomNumber", floor, type, status, price, deposit, area, amenities, description, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, '202', 2, 'SINGLE', 'VACANT', 2800000, 2800000, 22,
     '{"wifi": true, "airConditioner": true, "waterHeater": true, "bed": true, "wardrobe": true}'::jsonb,
     'Phòng đơn tầng 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO room_202_id;

    RAISE NOTICE 'Created 5 Rooms';

    -- 3. TẠO TENANTS (Khách thuê)
    INSERT INTO tenants (id, "propertyId", "fullName", phone, email, "idCard", "dateOfBirth", address, "emergencyContact", status, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, 'Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', '001234567890', '1998-05-15',
     '456 Đường ABC, Quận 1, TP.HCM',
     '{"name": "Nguyễn Văn Bình", "phone": "0912345678", "relationship": "Bố"}'::jsonb,
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO tenant_1_id;

    INSERT INTO tenants (id, "propertyId", "fullName", phone, email, "idCard", "dateOfBirth", address, "emergencyContact", status, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, 'Trần Thị Bình', '0907654321', 'tranthib@gmail.com', '001234567891', '1999-08-20',
     '789 Đường XYZ, Quận 3, TP.HCM',
     '{"name": "Trần Văn Cường", "phone": "0923456789", "relationship": "Anh trai"}'::jsonb,
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO tenant_2_id;

    INSERT INTO tenants (id, "propertyId", "fullName", phone, email, "idCard", "dateOfBirth", address, "emergencyContact", status, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, 'Lê Minh Châu', '0909876543', 'leminhchau@gmail.com', '001234567892', '2000-03-10',
     '321 Đường DEF, Quận 7, TP.HCM',
     '{"name": "Lê Văn Dũng", "phone": "0934567890", "relationship": "Bố"}'::jsonb,
     'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO tenant_3_id;

    RAISE NOTICE 'Created 3 Tenants';

    -- 4. TẠO CONTRACTS (Hợp đồng)
    -- Contract 1: Phòng 101
    INSERT INTO contracts (id, "roomId", "tenantId", "propertyId", "startDate", "endDate", "monthlyRent", deposit, "electricityPrice", "waterPrice", services, status, "signedDate", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), room_101_id, tenant_1_id, property_id,
     '2024-01-01', '2024-12-31', 2500000, 2500000, 3500, 20000,
     '{"internet": 100000, "parking": 50000}'::jsonb,
     'ACTIVE', '2023-12-25', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO contract_1_id;

    -- Contract 2: Phòng 102
    INSERT INTO contracts (id, "roomId", "tenantId", "propertyId", "startDate", "endDate", "monthlyRent", deposit, "electricityPrice", "waterPrice", services, status, "signedDate", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), room_102_id, tenant_2_id, property_id,
     '2024-02-01', '2025-01-31', 2500000, 2500000, 3500, 20000,
     '{"internet": 100000}'::jsonb,
     'ACTIVE', '2024-01-25', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO contract_2_id;

    -- Contract 3: Phòng 201
    INSERT INTO contracts (id, "roomId", "tenantId", "propertyId", "startDate", "endDate", "monthlyRent", deposit, "electricityPrice", "waterPrice", services, status, "signedDate", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), room_201_id, tenant_3_id, property_id,
     '2024-03-01', '2025-02-28', 4000000, 4000000, 3500, 20000,
     '{"internet": 100000, "parking": 50000, "cleaning": 200000}'::jsonb,
     'ACTIVE', '2024-02-25', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id INTO contract_3_id;

    RAISE NOTICE 'Created 3 Contracts';

    -- 5. TẠO INVOICES (Hóa đơn)
    -- Invoice tháng 1/2024 - Phòng 101 (ĐÃ THANH TOÁN)
    INSERT INTO invoices (id, "contractId", "tenantId", "roomId", "propertyId", "billingMonth", "dueDate", "rentAmount", "electricityUsage", "electricityCost", "waterUsage", "waterCost", "serviceCharges", "totalAmount", "paidAmount", "remainingAmount", status, "paymentDate", "paymentMethod", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), contract_1_id, tenant_1_id, room_101_id, property_id,
     '2024-01', '2024-01-05', 2500000, 120, 420000, 8, 160000,
     '{"internet": 100000, "parking": 50000}'::jsonb,
     3230000, 3230000, 0, 'PAID', '2024-01-03', 'BANK_TRANSFER',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Invoice tháng 2/2024 - Phòng 101 (ĐÃ THANH TOÁN)
    INSERT INTO invoices (id, "contractId", "tenantId", "roomId", "propertyId", "billingMonth", "dueDate", "rentAmount", "electricityUsage", "electricityCost", "waterUsage", "waterCost", "serviceCharges", "totalAmount", "paidAmount", "remainingAmount", status, "paymentDate", "paymentMethod", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), contract_1_id, tenant_1_id, room_101_id, property_id,
     '2024-02', '2024-02-05', 2500000, 115, 402500, 7, 140000,
     '{"internet": 100000, "parking": 50000}'::jsonb,
     3192500, 3192500, 0, 'PAID', '2024-02-04', 'CASH',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Invoice tháng 3/2024 - Phòng 101 (CHƯA THANH TOÁN)
    INSERT INTO invoices (id, "contractId", "tenantId", "roomId", "propertyId", "billingMonth", "dueDate", "rentAmount", "electricityUsage", "electricityCost", "waterUsage", "waterCost", "serviceCharges", "totalAmount", "paidAmount", "remainingAmount", status, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), contract_1_id, tenant_1_id, room_101_id, property_id,
     '2024-03', '2024-03-05', 2500000, 0, 0, 0, 0,
     '{"internet": 100000, "parking": 50000}'::jsonb,
     2650000, 0, 2650000, 'UNPAID',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Invoice tháng 2/2024 - Phòng 102 (ĐÃ THANH TOÁN)
    INSERT INTO invoices (id, "contractId", "tenantId", "roomId", "propertyId", "billingMonth", "dueDate", "rentAmount", "electricityUsage", "electricityCost", "waterUsage", "waterCost", "serviceCharges", "totalAmount", "paidAmount", "remainingAmount", status, "paymentDate", "paymentMethod", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), contract_2_id, tenant_2_id, room_102_id, property_id,
     '2024-02', '2024-02-05', 2500000, 100, 350000, 6, 120000,
     '{"internet": 100000}'::jsonb,
     3070000, 3070000, 0, 'PAID', '2024-02-02', 'MOMO',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Invoice tháng 3/2024 - Phòng 102 (CHƯA THANH TOÁN)
    INSERT INTO invoices (id, "contractId", "tenantId", "roomId", "propertyId", "billingMonth", "dueDate", "rentAmount", "electricityUsage", "electricityCost", "waterUsage", "waterCost", "serviceCharges", "totalAmount", "paidAmount", "remainingAmount", status, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), contract_2_id, tenant_2_id, room_102_id, property_id,
     '2024-03', '2024-03-05', 2500000, 0, 0, 0, 0,
     '{"internet": 100000}'::jsonb,
     2600000, 0, 2600000, 'UNPAID',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Invoice tháng 3/2024 - Phòng 201 (CHƯA THANH TOÁN)
    INSERT INTO invoices (id, "contractId", "tenantId", "roomId", "propertyId", "billingMonth", "dueDate", "rentAmount", "electricityUsage", "electricityCost", "waterUsage", "waterCost", "serviceCharges", "totalAmount", "paidAmount", "remainingAmount", status, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), contract_3_id, tenant_3_id, room_201_id, property_id,
     '2024-03', '2024-03-05', 4000000, 0, 0, 0, 0,
     '{"internet": 100000, "parking": 50000, "cleaning": 200000}'::jsonb,
     4350000, 0, 4350000, 'UNPAID',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    RAISE NOTICE 'Created 7 Invoices';

    -- 6. TẠO MAINTENANCE REQUESTS (Yêu cầu bảo trì)
    INSERT INTO maintenance (id, "roomId", "propertyId", "reportedById", title, description, type, urgency, status, "reportedDate", cost, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), room_101_id, property_id, admin_user_id,
     'Vòi nước bị rò rỉ', 'Vòi nước trong phòng tắm bị rò rỉ nước, cần sửa chữa gấp',
     'PLUMBING', 'HIGH', 'COMPLETED', '2024-02-10', 300000,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO maintenance (id, "roomId", "propertyId", "reportedById", title, description, type, urgency, status, "reportedDate", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), room_102_id, property_id, admin_user_id,
     'Điều hòa không mát', 'Điều hòa không làm lạnh, có thể cần bơm gas',
     'ELECTRICAL', 'MEDIUM', 'IN_PROGRESS', '2024-03-01',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO maintenance (id, "roomId", "propertyId", "reportedById", title, description, type, urgency, status, "reportedDate", "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), room_201_id, property_id, admin_user_id,
     'Cửa phòng kêu cọt kẹt', 'Cửa phòng bị kêu cọt kẹt khi đóng mở',
     'FURNITURE', 'LOW', 'PENDING', '2024-03-05',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    RAISE NOTICE 'Created 3 Maintenance Requests';

    -- 7. TẠO EXPENSES (Chi phí)
    INSERT INTO expenses (id, "propertyId", category, amount, date, description, "createdAt", "updatedAt")
    VALUES 
    (gen_random_uuid(), property_id, 'UTILITIES', 2500000, '2024-01-15', 'Tiền điện nước tháng 1/2024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), property_id, 'MAINTENANCE', 300000, '2024-02-10', 'Sửa vòi nước phòng 101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), property_id, 'UTILITIES', 2800000, '2024-02-15', 'Tiền điện nước tháng 2/2024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), property_id, 'SALARY', 5000000, '2024-02-28', 'Lương nhân viên tháng 2/2024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    RAISE NOTICE 'Created 4 Expenses';

    RAISE NOTICE '=== SEED DATA COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Property ID: %', property_id;
    RAISE NOTICE 'Total: 1 Property, 5 Rooms, 3 Tenants, 3 Contracts, 7 Invoices, 3 Maintenance, 4 Expenses';

END $$;
