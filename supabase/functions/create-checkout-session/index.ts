// Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for certificate payment
// Called from the frontend when a user wants to pay for their certificate

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Certificate price in cents (e.g., 999 = $9.99)
// TODO: Adjust this amount as needed
const CERTIFICATE_PRICE_CENTS = 999;
const CERTIFICATE_CURRENCY = "usd";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key from environment (NEVER from client)
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    // Parse request body
    const { certificate_id, student_email, student_name, certificate_number } = await req.json();

    if (!certificate_id || !student_email || !student_name || !certificate_number) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: certificate_id, student_email, student_name, certificate_number" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify the certificate exists and belongs to this user using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("id, student_email, payment_status, certificate_number")
      .eq("id", certificate_id)
      .eq("student_email", student_email)
      .eq("status", "active")
      .single();

    if (certError || !certificate) {
      return new Response(
        JSON.stringify({ error: "Certificate not found or does not belong to this user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if already paid
    if (certificate.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "Certificate has already been paid for", already_paid: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = req.headers.get("origin") || "https://xycodevip-coder.github.io";

    // Create Stripe Checkout Session using the Stripe API directly
    const stripePayload = new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": CERTIFICATE_CURRENCY,
      "line_items[0][price_data][product_data][name]": `Certificate - ${certificate_number}`,
      "line_items[0][price_data][product_data][description]": `Official certificate for ${student_name} (${student_email})`,
      "line_items[0][price_data][unit_amount]": String(CERTIFICATE_PRICE_CENTS),
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&certificate_id=${certificate_id}`,
      "cancel_url": `${origin}/portal?payment_cancelled=true`,
      "customer_email": student_email,
      "client_reference_id": certificate_id,
      "metadata[certificate_id]": certificate_id,
      "metadata[student_email]": student_email,
      "metadata[certificate_number]": certificate_number,
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripePayload.toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe error:", session);
      throw new Error(session.error?.message || "Failed to create Stripe checkout session");
    }

    // Store the Stripe session ID on the certificate
    await supabase
      .from("certificates")
      .update({
        stripe_session_id: session.id,
        payment_status: "pending",
      })
      .eq("id", certificate_id);

    return new Response(
      JSON.stringify({
        session_id: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});