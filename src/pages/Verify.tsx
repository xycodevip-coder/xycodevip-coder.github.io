import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Download,
  Award,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo-transparent.png";
import sig1Img from "@/assets/signature.png";
import sig2Img from "@/assets/signature (1).png";

interface CertificateResult {
  certificate_number: string;
  student_name: string;
  internship_title: string;
  issue_date: string;
  status: string;
}

// ─── Image to base64 helper ─────────────────────────────────────────────────

const toBase64 = (url: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });

// ─── Certificate PDF Generator ──────────────────────────────────────────────

const generateCertificatePDF = (
  cert: CertificateResult,
  logoB64: string,
  sig1B64: string,
  sig2B64: string
) => {
  const formattedDate = new Date(cert.issue_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="${logoB64}" />
  <title>XY CODE — Certificate ${cert.certificate_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    @page{size:landscape A4;margin:0}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff!important;padding:0!important}
      .controls{display:none!important}
      .cert-wrap{box-shadow:none!important;width:100vw!important;height:100vh!important}
    }
    body{font-family:'Sora',sans-serif;background:#f5f3fb;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:30px 20px}
    .controls{display:flex;gap:12px;margin-bottom:28px}
    .controls button{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;border-radius:50px;border:none;cursor:pointer;font-size:14px;font-family:'Sora',sans-serif;font-weight:600;transition:all .2s}
    .btn-download{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;box-shadow:0 8px 24px rgba(139,92,246,.35)}
    .btn-download:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(139,92,246,.45)}
    .btn-print{background:#fff;color:#333;border:2px solid #e5e7eb!important}
    .btn-print:hover{background:#f9fafb}

    /* ── Certificate Container ── */
    .cert-wrap{width:1100px;height:778px;position:relative;background:#ffffff;box-shadow:0 40px 100px rgba(100,60,180,.15),0 0 0 1px rgba(139,92,246,.08);overflow:hidden}

    /* ── Decorative borders ── */
    .border-left{position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,#7C3AED 0%,#A855F7 50%,#EC4899 100%)}
    .border-top{position:absolute;top:0;left:5px;right:0;height:3px;background:linear-gradient(90deg,#7C3AED 0%,#A855F7 40%,transparent 100%)}
    .border-bottom-accent{position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#7C3AED,#A855F7,#EC4899,#A855F7,#7C3AED)}

    /* ── Subtle background pattern ── */
    .bg-pattern{position:absolute;inset:0;background:
      radial-gradient(ellipse 50% 60% at 0% 50%,rgba(139,92,246,.04) 0%,transparent 60%),
      radial-gradient(ellipse 40% 50% at 100% 80%,rgba(236,72,153,.03) 0%,transparent 50%);
      pointer-events:none}

    /* ── Frame lines ── */
    .frame{position:absolute;inset:20px;border:1px solid rgba(139,92,246,.1);pointer-events:none}
    .frame-inner{position:absolute;inset:26px;border:0.5px solid rgba(139,92,246,.06);pointer-events:none}

    /* ── Corner marks ── */
    .corner{position:absolute;width:16px;height:16px}
    .corner::before,.corner::after{content:'';position:absolute;background:linear-gradient(135deg,#8B5CF6,#A855F7)}
    .corner::before{width:100%;height:1.5px;top:0;left:0}
    .corner::after{width:1.5px;height:100%;top:0;left:0}
    .c-tl{top:20px;left:20px}
    .c-tr{top:20px;right:20px;transform:rotate(90deg)}
    .c-bl{bottom:20px;left:20px;transform:rotate(-90deg)}
    .c-br{bottom:20px;right:20px;transform:rotate(180deg)}

    /* ── Main layout ── */
    .content{position:absolute;inset:0;display:flex;flex-direction:column;z-index:10;padding:44px 56px 36px 56px}

    /* ── Header row ── */
    .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
    .logo-area{display:flex;align-items:center;gap:12px}
    .brand{display:flex;flex-direction:column}
    .brand-name{font-family:'Sora';font-weight:800;font-size:20px;color:#1a1035;letter-spacing:1.5px;text-transform:uppercase;line-height:1.2}
    .brand-tagline{font-family:'Space Grotesk';font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#A855F7}
    .cert-id-pill{background:linear-gradient(135deg,rgba(124,58,237,.06),rgba(236,72,153,.04));border:1px solid rgba(139,92,246,.15);border-radius:50px;padding:6px 16px;font-family:'Space Grotesk';font-size:10px;font-weight:600;letter-spacing:1.5px;color:#7C3AED}

    /* ── Divider ── */
    .divider{width:100%;height:1px;background:linear-gradient(90deg,#7C3AED,#A855F7 30%,#EC4899 60%,rgba(236,72,153,.1) 100%);margin:14px 0 24px 0}

    /* ── Center body ── */
    .body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
    .subtitle{font-family:'Space Grotesk';font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#A855F7;display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .subtitle::before,.subtitle::after{content:'';width:30px;height:1px;background:linear-gradient(90deg,transparent,#A855F7)}
    .subtitle::after{background:linear-gradient(90deg,#A855F7,transparent)}
    .main-title{font-family:'Sora';font-size:42px;font-weight:800;color:#0f0a1e;line-height:1.15;margin-bottom:4px;letter-spacing:-1.5px}
    .gradient-text{background:linear-gradient(135deg,#8B5CF6 0%,#EC4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .title-line{width:80px;height:2.5px;background:linear-gradient(90deg,#8B5CF6,#EC4899);border-radius:3px;margin:10px auto 28px auto}
    .presented-to{font-family:'Space Grotesk';font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#9CA3AF;margin-bottom:6px}
    .student-name{font-family:'Playfair Display',serif;font-size:50px;font-weight:600;font-style:italic;color:#0f0a1e;line-height:1.15;margin-bottom:18px;letter-spacing:-0.5px}
    .body-text{font-family:'Space Grotesk';font-size:13.5px;font-weight:400;color:#6B7280;line-height:1.8;max-width:620px;margin:0 auto}
    .body-text strong{color:#374151;font-weight:600}

    /* ── Footer row: signatures + date ── */
    .footer-row{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-top:20px}
    .sig-block{text-align:center;min-width:180px}
    .sig-img-wrap{height:48px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:4px}
    .sig-img-wrap img{max-height:44px;max-width:160px;object-fit:contain}
    .sig-line{width:180px;height:1px;background:linear-gradient(90deg,rgba(139,92,246,.4),rgba(236,72,153,.2));margin:0 auto 6px auto}
    .sig-name{font-family:'Sora';font-size:13px;font-weight:700;color:#1a1035}
    .sig-title{font-family:'Space Grotesk';font-size:10px;font-weight:500;color:#A855F7;letter-spacing:.5px;margin-top:2px}

    .date-block{text-align:center;min-width:140px}
    .date-label{font-family:'Space Grotesk';font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#A855F7;margin-bottom:4px}
    .date-value{font-family:'Sora';font-size:14px;font-weight:600;color:#1a1035}
    .cert-number-label{font-family:'Space Grotesk';font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#A855F7;margin-bottom:2px;margin-top:10px}
    .cert-number-value{font-family:'Sora';font-size:11px;font-weight:600;color:#7C3AED;letter-spacing:1px}

    /* ── Watermark ── */
    .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Sora';font-size:180px;font-weight:900;color:rgba(139,92,246,.02);letter-spacing:-6px;pointer-events:none;user-select:none}
  </style>
</head>
<body>

<div class="controls no-print">
  <button class="btn-download" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Save as PDF
  </button>
  <button class="btn-print" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Print
  </button>
</div>

<div class="cert-wrap">
  <div class="bg-pattern"></div>
  <div class="border-left"></div>
  <div class="border-top"></div>
  <div class="border-bottom-accent"></div>
  <div class="frame"></div>
  <div class="frame-inner"></div>
  <div class="corner c-tl"></div>
  <div class="corner c-tr"></div>
  <div class="corner c-bl"></div>
  <div class="corner c-br"></div>
  <div class="watermark">XY</div>

  <div class="content">
    <!-- HEADER -->
    <div class="header">
      <div class="logo-area">
        <div class="brand">
          <div class="brand-name">XY CODE</div>
          <div class="brand-tagline">Next Gen Tech</div>
        </div>
      </div>
      <div class="cert-id-pill">✦ Official Certificate ✦</div>
    </div>

    <div class="divider"></div>

    <!-- BODY -->
    <div class="body">
      <div class="subtitle">Certificate of Completion</div>
      <div class="main-title">Building the Future of <span class="gradient-text">Code.</span></div>
      <div class="title-line"></div>

      <div class="presented-to">Proudly Presented To</div>
      <div class="student-name">${cert.student_name}</div>

      <div class="body-text">
        For successfully completing the <strong>${cert.internship_title}</strong> internship program
        at XY CODE. Through exceptional dedication and technical excellence, you have demonstrated
        the skills and commitment required to build world-class software solutions.
      </div>
    </div>

    <!-- FOOTER: Signatures + Date -->
    <div class="footer-row">
      <div class="sig-block">
        <div class="sig-img-wrap">
          <img src="${sig1B64}" alt="Signature" />
        </div>
        <div class="sig-line"></div>
        <div class="sig-name">Amr Hossam</div>
        <div class="sig-title">Dean of Programs</div>
      </div>

      <div class="date-block">
        <div class="date-label">Issue Date</div>
        <div class="date-value">${formattedDate}</div>
        <div class="cert-number-label">Certificate ID</div>
        <div class="cert-number-value">${cert.certificate_number}</div>
      </div>

      <div class="sig-block">
        <div class="sig-img-wrap">
          <img src="${sig2B64}" alt="Signature" />
        </div>
        <div class="sig-line"></div>
        <div class="sig-name">Ayat Mahmoud</div>
        <div class="sig-title">Chief Executive Officer</div>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;

  return html;
};

// ─── Component ──────────────────────────────────────────────────────────────

const Verify = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [searchParams] = useSearchParams();
  const certFrameRef = useRef<HTMLIFrameElement>(null);

  // Base64 cache for images
  const [logoB64, setLogoB64] = useState(logoImg);
  const [sig1B64, setSig1B64] = useState(sig1Img);
  const [sig2B64, setSig2B64] = useState(sig2Img);

  useEffect(() => {
    // Convert images to base64 data URLs for embedding in certificate HTML
    Promise.all([toBase64(logoImg), toBase64(sig1Img), toBase64(sig2Img)]).then(
      ([logo, s1, s2]) => {
        setLogoB64(logo);
        setSig1B64(s1);
        setSig2B64(s2);
      }
    );
  }, []);

  // Auto-load certificate from URL params (?cert=XY-2026-001)
  useEffect(() => {
    const certParam = searchParams.get("cert");
    if (certParam) {
      setQuery(certParam);
      handleVerifyWithNumber(certParam);
    }
  }, []);

  const handleVerify = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    await handleVerifyWithNumber(trimmed);
  };

  const handleVerifyWithNumber = async (certNumber: string) => {
    setLoading(true);
    setSearched(true);
    setResult(null);
    setShowCertificate(false);

    const { data } = await supabase
      .from("certificates")
      .select(
        "certificate_number, student_name, internship_title, issue_date, status"
      )
      .eq("certificate_number", certNumber.trim())
      .maybeSingle();

    setResult(data);
    setLoading(false);

    // Auto-show certificate if coming from email link
    if (data && searchParams.get("cert")) {
      setShowCertificate(true);
    }
  };

  const handleDownloadCertificate = () => {
    if (!result) return;
    setShowCertificate(true);
  };

  const handleOpenPrintView = () => {
    if (!result) return;
    const html = generateCertificatePDF(result, logoB64, sig1B64, sig2B64);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="w-full max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img src={logoImg} alt="XY CODE" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Verify Certificate
            </h1>
            <p className="text-muted-foreground">
              Enter a certificate number to verify its authenticity.
            </p>
          </div>

          <div className="flex gap-2 mb-8">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. XY-2026-001"
              className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="bg-primary text-white hover:opacity-90 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {searched &&
            !loading &&
            (result ? (
              <div className="space-y-4 animate-fade-in">
                {/* Verification result */}
                <div className="bg-card rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">
                      Certificate Verified
                    </span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Certificate #
                      </span>
                      <span className="font-medium text-foreground">
                        {result.certificate_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Student Name
                      </span>
                      <span className="font-medium text-foreground">
                        {result.student_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Internship
                      </span>
                      <span className="font-medium text-foreground">
                        {result.internship_title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Issue Date
                      </span>
                      <span className="font-medium text-foreground">
                        {new Date(result.issue_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadCertificate}
                    className="flex-1 bg-gradient-to-r from-[hsl(258,85%,62%)] to-[hsl(230,85%,62%)] text-white hover:opacity-90 font-semibold shadow-lg"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    View Certificate
                  </Button>
                  <Button
                    onClick={handleOpenPrintView}
                    variant="outline"
                    className="font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {/* Certificate preview */}
                {showCertificate && (
                  <div className="mt-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Certificate Preview
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleOpenPrintView}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Open Full Size
                      </Button>
                    </div>
                    <div
                      className="rounded-xl overflow-hidden border border-border shadow-lg"
                      style={{ aspectRatio: "1100/778" }}
                    >
                      <iframe
                        ref={certFrameRef}
                        srcDoc={generateCertificatePDF(result, logoB64, sig1B64, sig2B64)}
                        className="w-full h-full border-0"
                        title="Certificate Preview"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Click "Download PDF" to open in a new tab. Use your
                      browser's <strong>Print → Save as PDF</strong> to save
                      the certificate.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-lg p-6 border border-border animate-fade-in text-center">
                <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground text-lg mb-1">
                  Certificate Not Found
                </h3>
                <p className="text-muted-foreground text-sm">
                  This certificate number is not registered in our system.
                  Please double-check and try again.
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Verify;
