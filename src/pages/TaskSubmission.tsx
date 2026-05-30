import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    CheckCircle2,
    Send,
    ClipboardCheck,
    AlertCircle,
    Mail,
    Github,
    Linkedin,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a 6-digit numeric OTP */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/** Validate a GitHub repository URL */
const isValidGithubUrl = (url: string): boolean => {
    try {
        const u = new URL(url);
        return (
            (u.hostname === "github.com" || u.hostname === "www.github.com") &&
            u.pathname.split("/").filter(Boolean).length >= 2
        );
    } catch {
        return false;
    }
};

/** Validate a LinkedIn post / profile URL */
const isValidLinkedinUrl = (url: string): boolean => {
    try {
        const u = new URL(url);
        if (
            u.hostname !== "linkedin.com" &&
            u.hostname !== "www.linkedin.com" &&
            u.hostname !== "lnkd.in"
        ) {
            return false;
        }
        // Check for specific post paths
        const path = u.pathname.toLowerCase();
        return (
            path.includes("/posts/") ||
            path.includes("/feed/update/") ||
            path.includes("/activity/") ||
            path.includes("/check/") // sometimes share links
        );
    } catch {
        return false;
    }
};

// ─── Component ───────────────────────────────────────────────────────────────

const TaskSubmission = () => {
    const { toast } = useToast();

    // Steps: verify → otp → submit → done
    const [step, setStep] = useState<"verify" | "otp" | "submit" | "done">("verify");

    const [verifying, setVerifying] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [application, setApplication] = useState<any>(null);
    const [email, setEmail] = useState("");

    // OTP state
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [otpExpiry, setOtpExpiry] = useState<number>(0); // timestamp
    const [otpError, setOtpError] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Form data
    const [formData, setFormData] = useState({
        submission_notes: "",
        github_submission_url: "",
        linkedin_post_url: "",
    });
    const [fieldErrors, setFieldErrors] = useState({
        github_submission_url: "",
        linkedin_post_url: "",
    });

    // ── Step 1: Verify email ────────────────────────────────────────────────

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const { data, error } = await supabase
                .from("internship_applications")
                .select("id, full_name, email, track, status")
                .eq("email", email.trim().toLowerCase())
                .single();

            if (error || !data) {
                toast({
                    title: "Not Found",
                    description: "No application found with this email address.",
                    variant: "destructive",
                });
                return;
            }

            if (data.status !== "accepted") {
                toast({
                    title: "Not Accepted Yet",
                    description:
                        "Your application has not been accepted yet. Please wait for our team to review your application.",
                    variant: "destructive",
                });
                return;
            }

            // Check if already submitted
            const { data: existing } = await supabase
                .from("task_submissions")
                .select("id")
                .eq("email", email.trim().toLowerCase())
                .limit(1);

            if (existing && existing.length > 0) {
                toast({
                    title: "Already Submitted",
                    description:
                        "You have already submitted your task. Our team will review it and send your certificate soon.",
                });
                return;
            }

            setApplication(data);
            await sendOtp(data);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setVerifying(false);
        }
    };

    // ── OTP: Send ──────────────────────────────────────────────────────────

    const sendOtp = async (appData?: any) => {
        const app = appData ?? application;
        setSendingOtp(true);
        try {
            const otp = generateOTP();
            setGeneratedOtp(otp);
            setOtpExpiry(Date.now() + 10 * 60 * 1000); // 10 min
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");

            const { error } = await supabase.functions.invoke("send-otp-email", {
                body: {
                    name: app.full_name,
                    email: app.email,
                    otp,
                },
            });

            if (error) throw new Error(error.message);

            setStep("otp");
            toast({
                title: "OTP Sent!",
                description: `A 6-digit verification code was sent to ${app.email}.`,
            });
        } catch (err: any) {
            toast({
                title: "Failed to Send OTP",
                description: err.message || "Could not send the verification email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSendingOtp(false);
        }
    };

    // ── OTP: Input handling ────────────────────────────────────────────────

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // digits only
        const digits = [...otpDigits];
        digits[index] = value.slice(-1); // keep last char
        setOtpDigits(digits);
        setOtpError("");
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    // ── OTP: Verify ────────────────────────────────────────────────────────

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        const entered = otpDigits.join("");

        if (entered.length < 6) {
            setOtpError("Please enter all 6 digits.");
            return;
        }

        if (Date.now() > otpExpiry) {
            setOtpError("This code has expired. Please request a new one.");
            return;
        }

        if (entered !== generatedOtp) {
            setOtpError("Incorrect code. Please try again.");
            return;
        }

        setOtpError("");
        setStep("submit");
        toast({
            title: "Identity Verified ✓",
            description: "You can now submit your task.",
        });
    };

    // ── Step 3: Submit task ────────────────────────────────────────────────

    const validateForm = (): boolean => {
        const errors = { github_submission_url: "", linkedin_post_url: "" };
        let valid = true;

        if (!formData.github_submission_url.trim()) {
            errors.github_submission_url = "GitHub repository URL is required.";
            valid = false;
        } else if (!isValidGithubUrl(formData.github_submission_url.trim())) {
            errors.github_submission_url =
                "Please enter a valid GitHub repository URL (e.g. https://github.com/username/repo).";
            valid = false;
        }

        if (!formData.linkedin_post_url.trim()) {
            errors.linkedin_post_url = "LinkedIn post URL is required.";
            valid = false;
        } else if (!isValidLinkedinUrl(formData.linkedin_post_url.trim())) {
            errors.linkedin_post_url =
                "Please enter a valid LinkedIn URL (e.g. https://www.linkedin.com/posts/...).";
            valid = false;
        }

        setFieldErrors(errors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from("task_submissions").insert([
                {
                    application_id: application.id,
                    full_name: application.full_name,
                    email: application.email,
                    track: application.track,
                    submission_notes: formData.submission_notes,
                    github_submission_url: formData.github_submission_url.trim(),
                    linkedin_post_url: formData.linkedin_post_url.trim(),
                    task_delivered: true,
                },
            ]);

            if (error) throw error;

            setStep("done");
            toast({
                title: "Task Submitted!",
                description:
                    "Your task completion has been recorded. Our team will review and send your certificate.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-2xl">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <ClipboardCheck className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Task <span className="text-gradient-primary">Submission</span>
                        </h1>
                        <p className="text-muted-foreground text-base max-w-lg mx-auto">
                            Completed your internship tasks? Submit your confirmation here and our team will
                            review and issue your certificate.
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {(["verify", "otp", "submit", "done"] as const).map((s, i) => {
                            const steps = ["verify", "otp", "submit", "done"];
                            const currentIdx = steps.indexOf(step);
                            const stepIdx = steps.indexOf(s);
                            const isActive = s === step;
                            const isDone = stepIdx < currentIdx || (step === "done" && s === "done");
                            return (
                                <div key={s} className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone
                                            ? "bg-green-500 text-white"
                                            : isActive
                                                ? "bg-primary text-white ring-4 ring-primary/20"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                    </div>
                                    {i < 3 && (
                                        <div
                                            className={`h-0.5 w-8 transition-all ${isDone ? "bg-green-500" : "bg-muted"
                                                }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Step 1: Verify Email ── */}
                    {step === "verify" && (
                        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display text-xl font-bold text-foreground">
                                        Verify Your Email
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Enter the email address you used to apply.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-4 mt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="verify-email">Email Address</Label>
                                    <Input
                                        id="verify-email"
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white"
                                    disabled={verifying || sendingOtp}
                                >
                                    {verifying || sendingOtp ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {verifying ? "Verifying..." : "Sending OTP..."}
                                        </>
                                    ) : (
                                        "Verify & Send OTP"
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* ── Step 2: OTP Verification ── */}
                    {step === "otp" && application && (
                        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display text-xl font-bold text-foreground">
                                        Enter Verification Code
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        We sent a 6-digit code to{" "}
                                        <span className="font-medium text-foreground">{application.email}</span>
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6 mt-6">
                                {/* OTP digit inputs */}
                                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-background text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${otpError ? "border-red-400" : "border-border"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {otpError && (
                                    <p className="text-center text-sm text-red-500 flex items-center justify-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {otpError}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white"
                                >
                                    Verify Code
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Didn't receive the code?
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={sendingOtp}
                                        onClick={() => sendOtp()}
                                        className="text-primary hover:text-primary/80"
                                    >
                                        {sendingOtp ? (
                                            <>
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-1 h-3 w-3" /> Resend Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Step 3: Submit Task ── */}
                    {step === "submit" && application && (
                        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                            {/* Intern Info */}
                            <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-200">
                                        Welcome, {application.full_name}!
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Track: <strong>{application.track}</strong>
                                    </p>
                                </div>
                            </div>

                            <h2 className="font-display text-xl font-bold text-foreground mb-2">
                                Confirm Task Completion
                            </h2>
                            <p className="text-muted-foreground text-sm mb-6">
                                Please provide your GitHub repository and LinkedIn post links to complete your
                                submission.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* GitHub URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="github_submission" className="flex items-center gap-1.5">
                                        <Github className="w-4 h-4" />
                                        GitHub Repository URL <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="github_submission"
                                        placeholder="https://github.com/username/project"
                                        value={formData.github_submission_url}
                                        onChange={(e) => {
                                            setFormData({ ...formData, github_submission_url: e.target.value });
                                            if (fieldErrors.github_submission_url) {
                                                setFieldErrors({ ...fieldErrors, github_submission_url: "" });
                                            }
                                        }}
                                        className={fieldErrors.github_submission_url ? "border-red-400 focus-visible:ring-red-400" : ""}
                                    />
                                    {fieldErrors.github_submission_url && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {fieldErrors.github_submission_url}
                                        </p>
                                    )}
                                </div>

                                {/* LinkedIn URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin_post" className="flex items-center gap-1.5">
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn Post URL <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="linkedin_post"
                                        placeholder="https://www.linkedin.com/posts/..."
                                        value={formData.linkedin_post_url}
                                        onChange={(e) => {
                                            setFormData({ ...formData, linkedin_post_url: e.target.value });
                                            if (fieldErrors.linkedin_post_url) {
                                                setFieldErrors({ ...fieldErrors, linkedin_post_url: "" });
                                            }
                                        }}
                                        className={fieldErrors.linkedin_post_url ? "border-red-400 focus-visible:ring-red-400" : ""}
                                    />
                                    {fieldErrors.linkedin_post_url && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {fieldErrors.linkedin_post_url}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="submission_notes">Notes / Comments (Optional)</Label>
                                    <Textarea
                                        id="submission_notes"
                                        placeholder="Describe what you built, challenges you faced, or anything you'd like to share..."
                                        className="h-32"
                                        value={formData.submission_notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, submission_notes: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Disclaimer */}
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        By submitting, you confirm that you have completed all the required tasks
                                        for the <strong>{application.track}</strong> internship track.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Task Completion <Send className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* ── Step 4: Done ── */}
                    {step === "done" && (
                        <div className="bg-card border border-border rounded-xl p-10 shadow-lg text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/50 mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                                Submission Received!
                            </h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Thank you, <strong>{application?.full_name}</strong>! Your task completion has
                                been recorded. Our team will review your submission and send your certificate to{" "}
                                <strong>{application?.email}</strong> shortly.
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TaskSubmission;
