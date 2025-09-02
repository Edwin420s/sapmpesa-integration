-- Create mpesa_transactions table
CREATE TABLE mpesa_transactions (
    id SERIAL PRIMARY KEY,
    checkout_request_id VARCHAR(255) UNIQUE,
    merchant_request_id VARCHAR(255),
    conversation_id VARCHAR(255),
    originator_conversation_id VARCHAR(255),
    mpesa_receipt VARCHAR(255) UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    account_reference VARCHAR(100),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('STK_PUSH', 'B2C', 'C2B', 'B2B', 'REVERSAL')),
    transaction_date TIMESTAMP,
    result_code INTEGER,
    result_desc TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING',
    sap_reference VARCHAR(255),
    sap_sync_status VARCHAR(20) CHECK (sap_sync_status IN ('PENDING', 'SYNCED', 'FAILED')) DEFAULT 'PENDING',
    sap_sync_date TIMESTAMP,
    request_payload JSONB,
    response_payload JSONB,
    callback_payload JSONB,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_mpesa_transactions_checkout_request ON mpesa_transactions(checkout_request_id);
CREATE INDEX idx_mpesa_transactions_mpesa_receipt ON mpesa_transactions(mpesa_receipt);
CREATE INDEX idx_mpesa_transactions_phone_number ON mpesa_transactions(phone_number);
CREATE INDEX idx_mpesa_transactions_status ON mpesa_transactions(status);
CREATE INDEX idx_mpesa_transactions_created_at ON mpesa_transactions(created_at);
CREATE INDEX idx_mpesa_transactions_transaction_type ON mpesa_transactions(transaction_type);
CREATE INDEX idx_mpesa_transactions_sap_sync_status ON mpesa_transactions(sap_sync_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mpesa_transactions_updated_at
    BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit log table
CREATE TABLE transaction_audit_log (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES mpesa_transactions(id),
    action VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by VARCHAR(255),
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB
);

-- Create index for audit log
CREATE INDEX idx_audit_log_transaction_id ON transaction_audit_log(transaction_id);
CREATE INDEX idx_audit_log_performed_at ON transaction_audit_log(performed_at);

-- Create summary view for reporting
CREATE VIEW transaction_summary AS
SELECT 
    DATE(created_at) as transaction_date,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_transactions,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_transactions,
    SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) as total_amount,
    AVG(CASE WHEN status = 'SUCCESS' THEN amount END) as average_amount
FROM mpesa_transactions
GROUP BY DATE(created_at);