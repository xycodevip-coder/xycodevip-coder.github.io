
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
        const { name, email, track, certificate_number, issue_date } = await req.json();

        if (!SMTP_USERNAME || !SMTP_PASSWORD) {
            throw new Error("Missing SMTP_USERNAME or SMTP_PASSWORD environment variables");
        }

        if (!name || !email || !certificate_number) {
            throw new Error("Missing required fields: name, email, certificate_number");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD,
            },
        });

        const formattedDate = issue_date
            ? new Date(issue_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

        const info = await transporter.sendMail({
            from: `"XY CODE Internship" <${SMTP_USERNAME}>`,
            to: email,
            subject: `🎓 Your Internship Certificate – ${certificate_number}`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; margin: 0 0 8px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 0; font-size: 15px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; border-radius: 20px; padding: 4px 16px; font-size: 13px; margin-top: 12px; border: 1px solid rgba(255,255,255,0.4); }
    .body { padding: 36px 32px; }
    .cert-box { background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); border: 2px solid #6C63FF; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
    .cert-number { font-size: 22px; font-weight: 700; color: #6C63FF; letter-spacing: 2px; font-family: monospace; }
    .cert-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
    .info-label { color: #888; }
    .info-value { font-weight: 600; color: #333; }
    .cta { text-align: center; margin: 28px 0; }
    .cta a { background: linear-gradient(135deg, #6C63FF, #3B82F6); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; }
    .footer { background: #f8f9fa; padding: 20px 32px; text-align: center; font-size: 13px; color: #aaa; border-top: 1px solid #eee; }
    .congrats { font-size: 18px; color: #333; font-weight: 600; margin-bottom: 12px; }
    p { color: #555; line-height: 1.6; font-size: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Certificate of Completion</h1>
      <p>XY CODE Internship Program</p>
      <span class="badge">Official Certificate</span>
    </div>
    <div class="body">
      <p class="congrats">Congratulations, ${name}! 🎉</p>
      <p>
        We are delighted to inform you that you have successfully completed the
        <strong>${track}</strong> internship at <strong>XY CODE</strong>.
        Your dedication and hard work have been recognized, and we are proud to present you with this certificate.
      </p>

      <div class="cert-box">
        <div class="cert-label">Certificate Number</div>
        <div class="cert-number">${certificate_number}</div>
        <div style="margin-top: 16px; border-top: 1px solid #c7d2fe; padding-top: 16px;">
          <div class="info-row">
            <span class="info-label">Recipient</span>
            <span class="info-value">${name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Track</span>
            <span class="info-value">${track}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Issue Date</span>
            <span class="info-value">${formattedDate}</span>
          </div>
        </div>
      </div>

      <p>
        You can verify this certificate at any time using the certificate number above on our verification portal.
      </p>

      <div class="cta">
        <a href="https://xqdgtpgvsxrzwwqodfue.supabase.co/verify?cert=${certificate_number}">
          Verify Certificate
        </a>
      </div>

      <p>
        We wish you all the best in your future endeavors. Keep building, keep learning!
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

        return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Error sending certificate email:", error);
        return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
