# Stripe Payment Protection - Setup Guide

This guide explains how to configure Stripe payment protection for certificate downloads.

## Architecture Overview

```
User clicks "Download Certificate"
  → Frontend checks payment_status
  → If unpaid: Redirect to Stripe Checkout
  → Stripe processes payment
  → Webhook updates Supabase (payment_status = 'paid')
  → User redirected to /payment-success
  → Server verifies payment with Stripe API
  → If paid: Signed download URL generated (5-min expiry)
  → Certificate download enabled
```

## Security Layers

1. **Frontend**: Payment-gated UI (cosmetic only, not trusted)
2. **Edge Functions**: Server-side Stripe API verification (trusted)
3. **Webhook**: Stripe-signed event processing (trusted)
4. **RLS**: Row Level Security on Supabase (prevents direct DB manipulation)
5. **Signed URLs**: Time-limited download tokens (5-minute expiry)

## Setup Steps

### 1. Supabase Database Migration

Run this migration to add payment tracking fields to the certificates table.

**Option A: Via Supabase CLI** (requires database password):
```bash
# Set your database password first:
$env:SUPABASE_DB_PASSWORD="your-database-password"
npx supabase db push
```

**Option B: Via Supabase Dashboard SQL Editor** (recommended if CLI fails):
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/xqdgtpgvsxrzwwqodfue/sql)
2. Copy the contents of `supabase/migrations/20260530000000_add_payment_fields_to_certificates.sql`
3. Paste and click **Run**

Migration file: `supabase/migrations/20260530000000_add_payment_fields_to_certificates.sql`

This migration adds:
- `payment_status` column (pending/paid/failed/refunded)
- `stripe_session_id` column for tracking
- `payment_completed_at` timestamp
- `stripe_customer_id` for customer tracking
- `payment_amount` for audit trail
- Indexes for fast lookups
- RLS policies to prevent client-side payment status manipulation

### 2. Configure Supabase Edge Function Secrets

Set these secrets in your Supabase project (Dashboard → Edge Functions → Secrets):

```bash
# Via Supabase CLI:
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

Or set them in the Supabase Dashboard under **Project Settings → Edge Functions → Secrets**.

> ⚠️ **NEVER** put `STRIPE_SECRET_KEY` in `.env` or any client-side code!

### 3. Deploy Edge Functions

```bash
# Deploy all four functions:
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy check-payment-status
supabase functions deploy generate-certificate-download
```

### 4. Stripe Dashboard Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Set up a **Webhook endpoint**:
   - URL: `https://xqdgtpgvsxrzwwqodfue.supabase.co/functions/v1/stripe-webhook`
   - Events to listen for: `checkout.session.completed`, `checkout.session.expired`
   - Copy the **Signing secret** (`whsec_...`)
   - Set it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

### 5. Frontend Environment Variable

Update `.env` with your Stripe **publishable** key:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

> Note: The publishable key is safe for frontend use. The secret key is ONLY in Supabase Edge Function secrets.

### 6. Certificate Price

To change the certificate price, edit the `CERTIFICATE_PRICE_CENTS` constant in:
- `supabase/functions/create-checkout-session/index.ts`

The value is in cents (e.g., `999` = $9.99). Redeploy the function after changing.

## File Structure

```
supabase/
  functions/
    create-checkout-session/index.ts   # Creates Stripe Checkout Sessions
    stripe-webhook/index.ts            # Handles Stripe webhook events
    check-payment-status/index.ts      # Server-side payment verification
    generate-certificate-download/index.ts  # Generates secure download tokens
  migrations/
    20260530000000_add_payment_fields_to_certificates.sql  # DB migration

src/
  pages/
    PaymentSuccess.tsx                 # Post-payment verification page
    InternPortal.tsx                   # Payment-gated certificate download
  integrations/supabase/types.ts       # Updated with payment fields
```

## Flow Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────>│ create-checkout  │────>│  Stripe Checkout │
│  (Portal)   │     │    -session      │     │    (Hosted)      │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Download   │<────│ check-payment    │<────│  Payment Success │
│  Enabled     │     │    -status       │     │  (Redirect)     │
└─────────────┘     └──────────────────┘     └─────────────────┘
                                                       │
                            ┌──────────────────┐       │
                            │  stripe-webhook   │<──────┘
                            │  (updates DB)     │
                            └──────────────────┘
```

## Security Checklist

- [x] Stripe secret key only in Supabase Edge Function secrets
- [x] Publishable key only in frontend `.env`
- [x] `.env` in `.gitignore`
- [x] Payment verified server-side via Stripe API
- [x] Webhook signature verification (HMAC-SHA256)
- [x] Certificate ownership verified before download
- [x] RLS policies prevent direct DB manipulation of payment_status
- [x] Signed download URLs with 5-minute expiration
- [x] No trust of frontend payment status claims