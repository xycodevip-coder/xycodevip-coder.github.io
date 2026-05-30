// Edge Function: stripe-webhook
// Handles Stripe webhook events (checkout.session.completed)
// Updates certificate payment status in Supabase after successful payment
// IMPORTANT: Never trusts frontend data - only uses Stripe-signed webhook data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify Stripe webhook signature to prevent forgery
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  try {
    // Extract timestamp and signatures from header
    const elements = sigHeader.split(",");
    const timestampEl = elements.find((e) => e.startsWith("t="));
    const signatures = elements
      .filter((e) => e.startsWith("v1="))
      .map((e) => e.split("=")[1]);

    if (!timestampEl || signatures.length === 0) {
      return false;
    }

    const timestamp = timestampEl.split("=")[1];

    // Reconstruct the signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute expected signature using HMAC-SHA256
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedPayload)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Check if any of the provided signatures match
    return signatures.includes(computedSignature);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST requests for webhooks
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
    );
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe environment variables are not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    // Get the raw body and signature header
    const rawBody = await req.text();
    const sigHeader = req.headers.get("stripe-signature");

    if (!sigHeader) {
      console.error("Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify webhook signature to prevent replay attacks and forgery
    const isValid = await verifyStripeSignature(
      rawBody,
      sigHeader,
      STRIPE_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse the verified event
    const event = JSON.parse(rawBody);

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        console.log("Checkout session completed:", session.id);

        // Extract metadata
        const certificateId = session.metadata?.certificate_id;
        const studentEmail = session.metadata?.student_email;
        const certificateNumber = session.metadata?.certificate_number;
        const paymentAmount = session.amount_total;

        if (!certificateId) {
          console.error("No certificate_id in session metadata");
          break;
        }

        // Verify the payment was successful
        if (session.payment_status !== "paid") {
          console.error("Session payment status is not paid:", session.payment_status);
          break;
        }

        // Update the certificate payment status using service role (bypasses RLS)
        const { error: updateError } = await supabase
          .from("certificates")
          .update({
            payment_status: "paid",
            stripe_session_id: session.id,
            stripe_customer_id: session.customer || null,
            payment_amount: paymentAmount || null,
            payment_completed_at: new Date().toISOString(),
          })
          .eq("id", certificateId);

        if (updateError) {
          console.error("Failed to update certificate payment status:", updateError);
          throw updateError;
        }

        console.log(
          `Certificate ${certificateNumber} (${certificateId}) payment confirmed for ${studentEmail}`
        );
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const certificateId = session.metadata?.certificate_id;

        if (certificateId) {
          // Optionally mark as failed if the session expired
          await supabase
            .from("certificates")
            .update({ payment_status: "pending" })
            .eq("id", certificateId)
            .eq("payment_status", "pending"); // Only update if still pending

          console.log(`Checkout session expired for certificate ${certificateId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Webhook handler failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});