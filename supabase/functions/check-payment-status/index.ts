// Edge Function: check-payment-status
// Server-side verification of payment status for a certificate
// Called from the frontend to check if a certificate has been paid for
// Validates against Stripe API directly - never trusts frontend data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    const { certificate_id, student_email, stripe_session_id } = await req.json();

    if (!certificate_id || !student_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: certificate_id, student_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Verify certificate exists and belongs to this user
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("id, student_email, payment_status, stripe_session_id, certificate_number")
      .eq("id", certificate_id)
      .eq("student_email", student_email)
      .eq("status", "active")
      .single();

    if (certError || !certificate) {
      return new Response(
        JSON.stringify({ error: "Certificate not found or access denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Step 2: If payment_status is already 'paid', return success immediately
    if (certificate.payment_status === "paid") {
      return new Response(
        JSON.stringify({
          paid: true,
          payment_status: "paid",
          certificate_number: certificate.certificate_number,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Step 3: If there's a Stripe session ID, verify with Stripe directly
    const sessionId = stripe_session_id || certificate.stripe_session_id;

    if (sessionId) {
      // Query Stripe API to get the real payment status
      const stripeResponse = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
        {
          headers: {
            "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
          },
        }
      );

      if (stripeResponse.ok) {
        const session = await stripeResponse.json();

        if (session.payment_status === "paid") {
          // Payment confirmed by Stripe! Update our database
          await supabase
            .from("certificates")
            .update({
              payment_status: "paid",
              payment_completed_at: new Date().toISOString(),
            })
            .eq("id", certificate_id);

          return new Response(
            JSON.stringify({
              paid: true,
              payment_status: "paid",
              certificate_number: certificate.certificate_number,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }
    }

    // Payment not yet completed
    return new Response(
      JSON.stringify({
        paid: false,
        payment_status: certificate.payment_status || "pending",
        certificate_number: certificate.certificate_number,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});