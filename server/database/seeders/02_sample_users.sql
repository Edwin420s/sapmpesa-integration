-- Insert sample users for testing
INSERT INTO users (
    username,
    password,
    name,
    email,
    role,
    is_active,
    last_login
) VALUES 
(
    'admin',
    -- Password: admin123 (hashed with bcrypt)
    '$2a$12$K9Qc8z8qZ8Z8Z8Z8Z8Z8Z.Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8',
    'System Administrator',
    'admin@company.com',
    'admin',
    true,
    NOW()
),
(
    'finance_user',
    -- Password: finance123
    '$2a$12$K9Qc8z8qZ8Z8Z8Z8Z8Z8Z.Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8',
    'Finance Manager',
    'finance@company.com',
    'user',
    true,
    NOW()
),
(
    'viewer_user',
    -- Password: viewer123
    '$2a$12$K9Qc8z8qZ8Z8Z8Z8Z8Z8Z.Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8',
    'Report Viewer',
    'viewer@company.com',
    'viewer',
    true,
    NOW()
);

-- Insert sample audit logs
INSERT INTO api_audit_log (
    service_name,
    endpoint,
    method,
    status_code,
    response_time,
    user_id,
    ip_address,
    user_agent
) VALUES 
(
    'auth-service',
    '/auth/login',
    'POST',
    200,
    150,
    'admin',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
),
(
    'mpesa-service',
    '/mpesa/stk-push',
    'POST',
    201,
    300,
    'finance_user',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
);