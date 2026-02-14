# Supabase Edge Functions for Email

To enable automated email sending, you need to deploy a Supabase Edge Function.

## Prerequisites
1.  Supabase CLI installed (`npm i -g supabase`)
2.  Login to Supabase (`supabase login`)
3.  Link your project (`supabase link --project-ref your-project-ref`)

## Step 1: Function Created

I have already created the function file for you at `supabase/functions/send-acceptance-email/index.ts`.

It uses the following code (configured for development with `Access-Control-Allow-Origin: *`):

```typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 401 
      });
    }

    const { name, email } = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Internship Implementation <onboarding@resend.dev>", // Or your verified domain
        to: [email],
        subject: "Congratulations! Internship Acceptance at XY CODE",
        html: `
          <h1>Congratulations, ${name}!</h1>
          <p>We are pleased to inform you that your application for the Internship Program at XY CODE has been accepted!</p>
          <p>We were impressed by your profile and believe you will be a great addition to our team.</p>
          <p>Please reply to this email to confirm your start date and discuss next steps.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>XY CODE Team</strong></p>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: res.status,
          });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

## Step 2: Set Secrets

Set your Resend API key in Supabase secrets:

```bash
supabase secrets set RESEND_API_KEY=re_123456789
```

## Step 3: Deploy

Deploy the function to Supabase:

```bash
supabase functions deploy send-acceptance-email --no-verify-jwt
```

> Note: The `--no-verify-jwt` flag allows the client to call the function anonymously if needed, but it's better to enforce authentication. If you remove this flag, only logged-in admins (which is what we want) can trigger it.

Done! Now when you click "Accept" in the Admin dashboard, this function will run and send the email.
