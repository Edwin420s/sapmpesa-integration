-- Create audit tables for better tracking
CREATE TABLE IF NOT EXISTS api_audit_log (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    user_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_body JSONB,
    response_body JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit log
CREATE INDEX idx_api_audit_service ON api_audit_log(service_name);
CREATE INDEX idx_api_audit_endpoint ON api_audit_log(endpoint);
CREATE INDEX idx_api_audit_created_at ON api_audit_log(created_at);
CREATE INDEX idx_api_audit_status ON api_audit_log(status_code);
CREATE INDEX idx_api_audit_user ON api_audit_log(user_id);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    average_response_time DECIMAL(10,2),
    p95_response_time DECIMAL(10,2),
    p99_response_time DECIMAL(10,2),
    request_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    measurement_period TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user activity
CREATE INDEX idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_action ON user_activity_log(action);
CREATE INDEX idx_user_activity_created_at ON user_activity_log(created_at);

-- Create system health table
CREATE TABLE IF NOT EXISTS system_health (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY')),
    response_time INTEGER,
    error_rate DECIMAL(5,2),
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);

-- Create index for system health
CREATE INDEX idx_system_health_service ON system_health(service_name);
CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_last_check ON system_health(last_check);