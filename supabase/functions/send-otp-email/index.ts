
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.13";

const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME");
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { name, email, otp } = await req.json();

        if (!SMTP_USERNAME || !SMTP_PASSWORD) {
            throw new Error("Missing SMTP_USERNAME or SMTP_PASSWORD environment variables");
        }

        if (!email || !otp) {
            throw new Error("Missing required fields: email, otp");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"XY CODE Internship" <${SMTP_USERNAME}>`,
            to: email,
            subject: "Your Task Submission Verification Code – XY CODE",
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%); padding: 36px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; margin: 0 0 6px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 0; font-size: 14px; }
    .body { padding: 36px 32px; text-align: center; }
    .otp-box { background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); border: 2px solid #6C63FF; border-radius: 12px; padding: 28px; margin: 24px 0; }
    .otp-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .otp-code { font-size: 42px; font-weight: 800; color: #6C63FF; letter-spacing: 10px; font-family: monospace; }
    .expiry { font-size: 13px; color: #e53e3e; margin-top: 12px; font-weight: 600; }
    p { color: #555; line-height: 1.6; font-size: 15px; }
    .footer { background: #f8f9fa; padding: 18px 32px; text-align: center; font-size: 13px; color: #aaa; border-top: 1px solid #eee; }
    .warning { background: #fff8e1; border: 1px solid #ffc107; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #856404; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Verification Code</h1>
      <p>XY CODE Internship Task Submission</p>
    </div>
    <div class="body">
      <p>Hello${name ? `, <strong>${name}</strong>` : ""}!</p>
      <p>Use the code below to verify your identity and submit your internship task.</p>
      <div class="otp-box">
        <div class="otp-label">Your One-Time Password</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱ Expires in 10 minutes</div>
      </div>
      <div class="warning">
        ⚠️ Do not share this code with anyone. XY CODE will never ask for your OTP.
      </div>
      <p style="margin-top: 24px;">
        If you did not request this code, please ignore this email.
      </p>
      <p>
        Best regards,<br/>
        <strong>XY CODE Team</strong>
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} XY CODE. All rights reserved.
    </div>
  </div>
</body>
</html>
      `,
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Error sending OTP email:", error);
        return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
