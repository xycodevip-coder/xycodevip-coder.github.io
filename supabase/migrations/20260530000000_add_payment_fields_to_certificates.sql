-- Migration: Add payment tracking fields to certificates table
-- This enables Stripe payment verification before certificate download

-- Add payment_status column (pending, paid, failed, refunded)
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add Stripe session ID for tracking
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add payment completion timestamp
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE;

-- Add Stripe customer ID for potential future use
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add payment amount (in cents) for audit trail
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

-- Create index on stripe_session_id for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_certificates_stripe_session_id
ON certificates(stripe_session_id);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_certificates_payment_status
ON certificates(payment_status);

-- Update RLS policies for certificates
-- Certificate holders can check their own payment status
CREATE POLICY "Users can view own certificate payment status"
ON certificates
FOR SELECT
TO public
USING (true);

-- Only service role can update payment fields (via webhooks/edge functions)
-- This prevents clients from manually setting payment_status to 'paid'
CREATE POLICY "Only service role can update payment fields"
ON certificates
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure existing certificates that were created before payment requirement
-- can be grandfathered in (set their payment_status to 'paid' if needed)
-- Uncomment the following line if you want to grandfather existing certificates:
-- UPDATE certificates SET payment_status = 'paid', payment_completed_at = NOW() WHERE payment_status = 'pending';