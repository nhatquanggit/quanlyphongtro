-- Tạo user admin đầu tiên
-- Email: admin@phongtro.com
-- Password: Admin@123

INSERT INTO users (
    id, 
    email, 
    password, 
    "fullName", 
    phone, 
    role, 
    "isActive", 
    "createdAt", 
    "updatedAt"
)
VALUES (
    gen_random_uuid()::text,
    'admin@phongtro.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ3.',
    'Administrator',
    '0123456789',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING id, email, "fullName", role;
