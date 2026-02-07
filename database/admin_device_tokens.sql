-- Database Schema for Admin Device Tokens
-- Run this SQL to create the table for storing FCM tokens

CREATE TABLE admin_device_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    fcm_token TEXT NOT NULL UNIQUE,
    device_type VARCHAR(50),  -- 'web', 'android', 'ios'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup during N8N workflow
CREATE INDEX idx_admin_tokens_user ON admin_device_tokens(user_id);
CREATE INDEX idx_admin_tokens_active ON admin_device_tokens(is_active);
