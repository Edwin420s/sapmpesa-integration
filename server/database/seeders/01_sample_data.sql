-- Insert sample transactions for testing
INSERT INTO mpesa_transactions (
    checkout_request_id,
    merchant_request_id,
    amount,
    phone_number,
    account_reference,
    transaction_type,
    status,
    mpesa_receipt,
    result_code,
    result_desc,
    created_at
) VALUES 
(
    'ws_CO_01012023123456',
    '12345-67890-1',
    1000.00,
    '254712345678',
    'INV001',
    'STK_PUSH',
    'SUCCESS',
    'RE1234567',
    0,
    'The service request is processed successfully.',
    '2023-01-01 10:00:00'
),
(
    'ws_CO_01012023123457',
    '12345-67890-2',
    2500.50,
    '254723456789',
    'INV002',
    'STK_PUSH',
    'SUCCESS',
    'RE1234568',
    0,
    'The service request is processed successfully.',
    '2023-01-01 11:30:00'
),
(
    'ws_CO_01012023123458',
    '12345-67890-3',
    500.00,
    '254734567890',
    'INV003',
    'STK_PUSH',
    'FAILED',
    NULL,
    1,
    'Insufficient funds',
    '2023-01-01 12:45:00'
),
(
    'ws_CO_01012023123459',
    '12345-67890-4',
    3000.00,
    '254745678901',
    'INV004',
    'STK_PUSH',
    'PENDING',
    NULL,
    NULL,
    NULL,
    '2023-01-01 14:20:00'
),
(
    'ws_CO_01012023123460',
    '12345-67890-5',
    1500.75,
    '254756789012',
    'INV005',
    'STK_PUSH',
    'SUCCESS',
    'RE1234569',
    0,
    'The service request is processed successfully.',
    '2023-01-02 09:15:00'
);

-- Insert sample audit logs
INSERT INTO transaction_audit_log (
    transaction_id,
    action,
    description,
    performed_by,
    old_values,
    new_values
) VALUES 
(
    1,
    'STATUS_UPDATE',
    'Transaction status updated from PENDING to SUCCESS',
    'system',
    '{"status": "PENDING"}',
    '{"status": "SUCCESS", "mpesa_receipt": "RE1234567"}'
),
(
    3,
    'STATUS_UPDATE',
    'Transaction status updated from PENDING to FAILED',
    'system',
    '{"status": "PENDING"}',
    '{"status": "FAILED", "result_code": 1, "result_desc": "Insufficient funds"}'
);