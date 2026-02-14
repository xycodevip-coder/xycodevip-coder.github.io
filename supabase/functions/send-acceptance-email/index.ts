
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
        const authHeader = req.headers.get('authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            // Optional: Add strict auth check here if needed
            // For now, we allow the call to proceed if the client has the anon key
        }

        const { name, email, track } = await req.json();

        if (!SMTP_USERNAME || !SMTP_PASSWORD) {
            throw new Error("Missing SMTP_USERNAME or SMTP_PASSWORD environment variables");
        }

        const trackLinks: Record<string, string> = {
            "Frontend Development": "https://drive.google.com/drive/folders/YOUR_FRONTEND_FOLDER_ID",
            "Backend Development": "https://drive.google.com/drive/folders/YOUR_BACKEND_FOLDER_ID",
            "Full Stack Development": "https://drive.google.com/drive/folders/YOUR_FULLSTACK_FOLDER_ID",
            "Mobile Development": "https://drive.google.com/drive/folders/YOUR_MOBILE_FOLDER_ID",
            "Data Science & AI": "https://drive.google.com/drive/folders/YOUR_DATASCIENCE_FOLDER_ID",
            "DevOps & Cloud": "https://drive.google.com/drive/folders/YOUR_DEVOPS_FOLDER_ID",
            "Game Development": "https://drive.google.com/drive/folders/YOUR_GAMEDEV_FOLDER_ID",
            "Embedded Systems": "https://drive.google.com/drive/folders/YOUR_EMBEDDED_FOLDER_ID",
        };

        const tasksLink = trackLinks[track] || "https://drive.google.com/drive/folders/YOUR_DEFAULT_FOLDER_ID";

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"Internship Implementation" <${SMTP_USERNAME}>`,
            to: email,
            subject: "Congratulations! Internship Acceptance at XY CODE",
            html: `
        <h1>Congratulations, ${name}!</h1>
        <p>We are pleased to inform you that your application for the <strong>${track}</strong> Internship Program at XY CODE has been accepted!</p>
        <p>We were impressed by your profile and believe you will be a great addition to our team.</p>
        
        <h3>Next Steps:</h3>
        <p>Please review the onboarding tasks and materials available at the following link:</p>
        <p><a href="${tasksLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Your Tasks</a></p>
        
        <p>Please reply to this email to confirm your start date and discuss any further questions.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>XY CODE Team</strong></p>
      `,
        });

        return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
