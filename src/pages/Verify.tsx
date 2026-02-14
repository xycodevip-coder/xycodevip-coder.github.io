import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface CertificateResult {
  certificate_number: string;
  student_name: string;
  internship_title: string;
  issue_date: string;
  status: string;
}

const Verify = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setSearched(true);
    setResult(null);

    const { data } = await supabase
      .from("certificates")
      .select("certificate_number, student_name, internship_title, issue_date, status")
      .eq("certificate_number", trimmed)
      .maybeSingle();

    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="w-full max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Verify Certificate</h1>
            <p className="text-muted-foreground">Enter a certificate number to verify its authenticity.</p>
          </div>

          <div className="flex gap-2 mb-8">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. XY-2026-001"
              className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button onClick={handleVerify} disabled={loading} className="bg-primary text-white hover:opacity-90 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {searched && !loading && (
            result ? (
              <div className="bg-card rounded-lg p-6 border border-border animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">Certificate Verified</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Certificate #</span><span className="font-medium text-foreground">{result.certificate_number}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Student Name</span><span className="font-medium text-foreground">{result.student_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Internship</span><span className="font-medium text-foreground">{result.internship_title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Issue Date</span><span className="font-medium text-foreground">{result.issue_date}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium capitalize ${result.status === "active" ? "text-accent" : "text-destructive"}`}>{result.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-6 border border-border animate-fade-in text-center">
                <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground text-lg mb-1">Certificate Not Found</h3>
                <p className="text-muted-foreground text-sm">This certificate number is not registered in our system. Please double-check and try again.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
