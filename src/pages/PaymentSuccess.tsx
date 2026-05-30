import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Award,
  Download,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");

  const sessionId = searchParams.get("session_id");
  const certificateId = searchParams.get("certificate_id");

  useEffect(() => {
    if (!sessionId || !certificateId) {
      setError("Missing payment session information. Please try again from the portal.");
      setVerifying(false);
      return;
    }

    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    setVerifying(true);
    try {
      // Get the intern session to get the email
      const sessionData = localStorage.getItem("xycode_intern_session");
      if (!sessionData) {
        setError("Please log in to the intern portal first to verify your payment.");
        setVerifying(false);
        return;
      }

      const session = JSON.parse(sessionData);

      // Call the check-payment-status Edge Function
      // This verifies payment server-side using Stripe API
      const { data, error: fnError } = await supabase.functions.invoke(
        "check-payment-status",
        {
          body: {
            certificate_id: certificateId,
            student_email: session.email,
            stripe_session_id: sessionId,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to verify payment");
      }

      if (data?.paid) {
        setVerified(true);
        setCertificateNumber(data.certificate_number || "");
      } else {
        // Payment might still be processing
        setError(
          "Your payment is being processed. Please wait a moment and refresh, or return to the portal and try downloading your certificate."
        );
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(err.message || "Failed to verify payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 30%, hsl(258 85% 62% / 0.06) 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, hsl(316 85% 62% / 0.05) 0%, transparent 55%)",
        }}
      />

      <Navbar />

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {verifying ? (
              <div className="bg-card border border-border rounded-2xl p-12 shadow-lg text-center">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                  Verifying Payment...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment with our payment provider.
                </p>
              </div>
            ) : verified ? (
              <div className="bg-card border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 shadow-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/50 mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                  Payment Successful! 🎉
                </h2>
                {certificateNumber && (
                  <p className="text-muted-foreground mb-2">
                    Certificate: <span className="font-mono font-bold text-primary">{certificateNumber}</span>
                  </p>
                )}
                <p className="text-muted-foreground mb-8">
                  Your payment has been confirmed. You can now download your official certificate from the intern portal.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate("/portal")}
                    className="w-full h-12 bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 transition-all font-semibold text-base"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Go to Portal & Download Certificate
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 mb-6">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                  Payment Verification
                </h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={verifyPayment}
                    variant="outline"
                    className="w-full font-semibold"
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Retry Verification
                  </Button>
                  <Button
                    onClick={() => navigate("/portal")}
                    className="w-full bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 transition-all font-semibold"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Back to Portal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;