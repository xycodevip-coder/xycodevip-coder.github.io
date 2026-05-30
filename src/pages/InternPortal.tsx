import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getTasksForTrack, type TrackTask } from "@/data/trackTasks";
import { internshipTracks } from "./Internships";
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
    LogOut,
    BookOpen,
    Trophy,
    Clock,
    ChevronRight,
    ExternalLink,
    Sparkles,
    CircleDot,
    CircleCheckBig,
    ListChecks,
    User,
    GraduationCap,
    ArrowRight,
    Info,
    XCircle,
    Award,
    Download,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

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

const isValidLinkedinUrl = (url: string): boolean => {
    try {
        const u = new URL(url);
        if (
            u.hostname !== "linkedin.com" &&
            u.hostname !== "www.linkedin.com" &&
            u.hostname !== "lnkd.in"
        )
            return false;
        const path = u.pathname.toLowerCase();
        return (
            path.includes("/posts/") ||
            path.includes("/feed/update/") ||
            path.includes("/activity/") ||
            path.includes("/check/")
        );
    } catch {
        return false;
    }
};

const LS_SESSION_KEY = "xycode_intern_session";

interface InternSession {
    id: string;
    full_name: string;
    email: string;
    track: string;
}

// ─── Task Status Persistence ────────────────────────────────────────────────

type TaskStatus = "not_started" | "in_progress" | "completed";

const getTaskStatuses = (email: string): Record<string, TaskStatus> => {
    try {
        const raw = localStorage.getItem(`xycode_task_status_${email}`);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveTaskStatuses = (
    email: string,
    statuses: Record<string, TaskStatus>
) => {
    localStorage.setItem(
        `xycode_task_status_${email}`,
        JSON.stringify(statuses)
    );
};

// ─── Component ──────────────────────────────────────────────────────────────

const InternPortal = () => {
    const { toast } = useToast();

    // Auth state: null = not logged in
    const [session, setSession] = useState<InternSession | null>(null);
    const [authStep, setAuthStep] = useState<"login" | "otp" | "dashboard">("login");
    const [email, setEmail] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    // OTP
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [otpExpiry, setOtpExpiry] = useState<number>(0);
    const [otpError, setOtpError] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Dashboard
    const [tasks, setTasks] = useState<TrackTask[]>([]);
    const [taskStatuses, setTaskStatuses] = useState<
        Record<string, TaskStatus>
    >({});
    const [selectedTask, setSelectedTask] = useState<TrackTask | null>(null);
    const [submissionOpen, setSubmissionOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Certificate
    interface CertificateData {
        certificate_number: string;
        student_name: string;
        internship_title: string;
        issue_date: string;
        status: string;
    }
    const [certificate, setCertificate] = useState<CertificateData | null>(null);

    // Submission form
    const [formData, setFormData] = useState({
        submission_notes: "",
        github_submission_url: "",
        linkedin_post_url: "",
    });
    const [fieldErrors, setFieldErrors] = useState({
        github_submission_url: "",
        linkedin_post_url: "",
    });

    // ── Session restore ─────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const cached = localStorage.getItem(LS_SESSION_KEY);
            if (!cached) return;
            const parsed = JSON.parse(cached) as InternSession;
            // Verify the session is still valid
            supabase
                .from("internship_applications")
                .select("id, full_name, email, track, status")
                .eq("email", parsed.email)
                .eq("status", "accepted")
                .single()
                .then(({ data }) => {
                    if (data) {
                        const s: InternSession = {
                            id: data.id,
                            full_name: data.full_name,
                            email: data.email,
                            track: data.track,
                        };
                        setSession(s);
                        setAuthStep("dashboard");
                        initDashboard(s);
                    } else {
                        localStorage.removeItem(LS_SESSION_KEY);
                    }
                });
        } catch {
            localStorage.removeItem(LS_SESSION_KEY);
        }
    }, []);

    const initDashboard = useCallback(
        async (s: InternSession) => {
            const trackTasks = getTasksForTrack(s.track);
            setTasks(trackTasks);
            setTaskStatuses(getTaskStatuses(s.email));

            // Check if already submitted
            const { data: existing } = await supabase
                .from("task_submissions")
                .select("id")
                .eq("email", s.email)
                .limit(1);
            if (existing && existing.length > 0) {
                setHasSubmitted(true);
            }

            // Check if certificate exists
            const { data: certData } = await supabase
                .from("certificates")
                .select("certificate_number, student_name, internship_title, issue_date, status")
                .eq("student_email", s.email)
                .eq("status", "active")
                .limit(1)
                .maybeSingle();
            if (certData) {
                setCertificate(certData);
            }
        },
        []
    );

    // ── Step 1: Email verification ──────────────────────────────────────────
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
                    description:
                        "No application found with this email address. Please apply first at our internships page.",
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

            // Send OTP
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

    // ── OTP: Send ─────────────────────────────────────────────────────────
    const sendOtp = async (appData: any) => {
        setSendingOtp(true);
        try {
            const otp = generateOTP();
            setGeneratedOtp(otp);
            setOtpExpiry(Date.now() + 10 * 60 * 1000);
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");

            const { error } = await supabase.functions.invoke("send-otp-email", {
                body: {
                    name: appData.full_name,
                    email: appData.email,
                    otp,
                },
            });

            if (error) throw new Error(error.message);

            // Store pending session data
            setSession({
                id: appData.id,
                full_name: appData.full_name,
                email: appData.email,
                track: appData.track,
            });
            setAuthStep("otp");
            toast({
                title: "OTP Sent!",
                description: `A 6-digit verification code was sent to ${appData.email}.`,
            });
        } catch (err: any) {
            toast({
                title: "Failed to Send OTP",
                description:
                    err.message ||
                    "Could not send the verification email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSendingOtp(false);
        }
    };

    // ── OTP: Input handling ───────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digits = [...otpDigits];
        digits[index] = value.slice(-1);
        setOtpDigits(digits);
        setOtpError("");
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    // ── OTP: Verify ───────────────────────────────────────────────────────
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

        // Login successful!
        if (session) {
            localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session));
            setAuthStep("dashboard");
            initDashboard(session);
            toast({
                title: "Welcome! 🎉",
                description: `Logged in as ${session.full_name}`,
            });
        }
    };

    // ── Logout ────────────────────────────────────────────────────────────
    const handleLogout = () => {
        setSession(null);
        setAuthStep("login");
        setEmail("");
        setOtpDigits(["", "", "", "", "", ""]);
        setTasks([]);
        setTaskStatuses({});
        setSelectedTask(null);
        setSubmissionOpen(false);
        setHasSubmitted(false);
        localStorage.removeItem(LS_SESSION_KEY);
        toast({ title: "Logged out" });
    };

    // ── Task status management ────────────────────────────────────────────
    const updateTaskStatus = (taskId: string, status: TaskStatus) => {
        if (!session) return;
        const updated = { ...taskStatuses, [taskId]: status };
        setTaskStatuses(updated);
        saveTaskStatuses(session.email, updated);
    };

    const getTaskStatus = (taskId: string): TaskStatus =>
        taskStatuses[taskId] || "not_started";

    // ── Progress calculation ──────────────────────────────────────────────
    const completedCount = tasks.filter(
        (t) => getTaskStatus(t.id) === "completed"
    ).length;
    const inProgressCount = tasks.filter(
        (t) => getTaskStatus(t.id) === "in_progress"
    ).length;
    const progressPercent =
        tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    const allTasksCompleted =
        tasks.length > 0 && completedCount === tasks.length;

    // ── Final task submission ─────────────────────────────────────────────
    const validateForm = (): boolean => {
        const errors = { github_submission_url: "", linkedin_post_url: "" };
        let valid = true;

        if (!formData.github_submission_url.trim()) {
            errors.github_submission_url = "GitHub repository URL is required.";
            valid = false;
        } else if (!isValidGithubUrl(formData.github_submission_url.trim())) {
            errors.github_submission_url =
                "Please enter a valid GitHub URL (e.g. https://github.com/username/repo).";
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
        if (!validateForm() || !session) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from("task_submissions").insert([
                {
                    application_id: session.id,
                    full_name: session.full_name,
                    email: session.email,
                    track: session.track,
                    submission_notes: formData.submission_notes,
                    github_submission_url: formData.github_submission_url.trim(),
                    linkedin_post_url: formData.linkedin_post_url.trim(),
                    task_delivered: true,
                },
            ]);

            if (error) throw error;

            setHasSubmitted(true);
            setSubmissionOpen(false);
            toast({
                title: "Task Submitted! 🎉",
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

    // ── Get track icon ────────────────────────────────────────────────────
    const getTrackIcon = (trackTitle: string) => {
        const track = internshipTracks.find((t) => t.title === trackTitle);
        return track ? track.icon : BookOpen;
    };

    const isLoggedIn = session && authStep === "dashboard";

    // ─── Render ───────────────────────────────────────────────────────────

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
                    {/* ═══════ AUTH: Not logged in ═══════ */}
                    {!isLoggedIn && (
                        <div className="max-w-lg mx-auto">
                            {/* Header */}
                            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-5 shadow-glow">
                                    <GraduationCap className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                                    Intern{" "}
                                    <span className="text-gradient-primary">Portal</span>
                                </h1>
                                <p className="text-muted-foreground text-base max-w-md mx-auto">
                                    Log in to view your assigned tasks, track progress, and
                                    submit your completed work.
                                </p>
                            </div>

                            {/* ── Login ── */}
                            {authStep === "login" && (
                                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Mail className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="font-display text-xl font-bold text-foreground">
                                                Sign In
                                            </h2>
                                            <p className="text-muted-foreground text-sm">
                                                Enter your registered email to receive a verification
                                                code.
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleVerify} className="space-y-5 mt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-email">Email Address</Label>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-12 text-base"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 transition-all font-semibold text-base"
                                            disabled={verifying || sendingOtp}
                                        >
                                            {verifying || sendingOtp ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {verifying
                                                        ? "Verifying..."
                                                        : "Sending OTP..."}
                                                </>
                                            ) : (
                                                <>
                                                    Continue with Email{" "}
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="mt-6 flex items-start gap-3 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                                        <Info className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                                        <p>
                                            Only accepted applicants can sign in. If you haven't
                                            applied yet, visit our{" "}
                                            <a
                                                href="/internships"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                internships page
                                            </a>{" "}
                                            to apply.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── OTP ── */}
                            {authStep === "otp" && session && (
                                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="font-display text-xl font-bold text-foreground">
                                                Verification Code
                                            </h2>
                                            <p className="text-muted-foreground text-sm">
                                                Enter the 6-digit code sent to{" "}
                                                <span className="font-medium text-foreground">
                                                    {session.email}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handleVerifyOtp}
                                        className="space-y-6 mt-6"
                                    >
                                        <div
                                            className="flex justify-center gap-3 max-w-xs mx-auto"
                                            onPaste={handleOtpPaste}
                                        >
                                            {otpDigits.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => {
                                                        otpRefs.current[i] = el;
                                                    }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) =>
                                                        handleOtpChange(i, e.target.value)
                                                    }
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-background text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${otpError ? "border-red-400" : "border-border"
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
                                            className="w-full h-12 bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 transition-all font-semibold text-base"
                                        >
                                            <ShieldCheck className="mr-2 h-5 w-5" />
                                            Verify & Sign In
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
                                                onClick={() => session && sendOtp(session)}
                                                className="text-primary hover:text-primary/80"
                                            >
                                                {sendingOtp ? (
                                                    <>
                                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />{" "}
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="mr-1 h-3 w-3" /> Resend
                                                        Code
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAuthStep("login");
                                                setSession(null);
                                            }}
                                            className="block mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            ← Use a different email
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════ DASHBOARD: Logged in ═══════ */}
                    {isLoggedIn && session && (
                        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* ── Welcome header ────────────────────────────────────── */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                                        <Sparkles className="w-7 h-7 text-primary" />
                                        Welcome back,{" "}
                                        <span className="text-gradient-primary">
                                            {session.full_name.split(" ")[0]}
                                        </span>
                                        !
                                    </h1>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {session.email}
                                        <span className="text-border">·</span>
                                        {(() => {
                                            const TrackIcon = getTrackIcon(session.track);
                                            return <TrackIcon className="w-4 h-4 text-primary" />;
                                        })()}
                                        {session.track}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </Button>
                            </div>

                            {/* ── Progress overview ────────────────────────────────── */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Progress bar card */}
                                <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-primary" />
                                            Overall Progress
                                        </h3>
                                        <span className="text-2xl font-bold text-gradient-primary">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3 mb-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-primary h-full rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {completedCount} of {tasks.length} tasks completed
                                    </p>
                                </div>

                                {/* Stat cards */}
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {inProgressCount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                In Progress
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {completedCount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Completed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Task list ────────────────────────────────────────── */}
                            <div>
                                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <ListChecks className="w-5 h-5 text-primary" />
                                    Your Tasks — {session.track}
                                </h2>

                                {tasks.length === 0 ? (
                                    <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground text-lg mb-2">
                                            No tasks assigned yet
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Tasks for the {session.track} track will appear here
                                            once they are configured. Please check back later.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tasks.map((task, index) => {
                                            const status = getTaskStatus(task.id);
                                            const isSelected =
                                                selectedTask?.id === task.id;

                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${isSelected
                                                        ? "border-primary/50 ring-1 ring-primary/20"
                                                        : "border-border"
                                                        }`}
                                                >
                                                    {/* Task header */}
                                                    <button
                                                        onClick={() =>
                                                            setSelectedTask(
                                                                isSelected ? null : task
                                                            )
                                                        }
                                                        className="w-full text-left p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                                                    >
                                                        {/* Status icon */}
                                                        <div className="shrink-0">
                                                            {status === "completed" ? (
                                                                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                                                                    <CircleCheckBig className="w-5 h-5 text-green-600" />
                                                                </div>
                                                            ) : status === "in_progress" ? (
                                                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                                                                    <CircleDot className="w-5 h-5 text-amber-600" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                                                    <span className="text-base font-bold text-muted-foreground">
                                                                        {index + 1}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Title & meta */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-display text-base font-bold text-foreground truncate">
                                                                {task.title}
                                                            </h3>
                                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                <span
                                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${task.difficulty === "Beginner"
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                                                                        : task.difficulty ===
                                                                            "Intermediate"
                                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                                                            : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                                                        }`}
                                                                >
                                                                    {task.difficulty}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    ~{task.estimatedHours}h
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Status badge */}
                                                        <div className="shrink-0">
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${status === "completed"
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                                                                    : status === "in_progress"
                                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                                                        : "bg-muted text-muted-foreground"
                                                                    }`}
                                                            >
                                                                {status === "completed"
                                                                    ? "Completed"
                                                                    : status === "in_progress"
                                                                        ? "In Progress"
                                                                        : "Not Started"}
                                                            </span>
                                                        </div>

                                                        <ChevronRight
                                                            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${isSelected ? "rotate-90" : ""
                                                                }`}
                                                        />
                                                    </button>

                                                    {/* Expanded details */}
                                                    {isSelected && (
                                                        <div className="px-5 pb-5 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <div className="pt-4 space-y-5">
                                                                {/* Description */}
                                                                <p className="text-sm text-foreground/80 leading-relaxed">
                                                                    {task.description}
                                                                </p>

                                                                {/* Deliverables */}
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                                        <ClipboardCheck className="w-4 h-4 text-primary" />
                                                                        Deliverables
                                                                    </h4>
                                                                    <ul className="space-y-1.5">
                                                                        {task.deliverables.map((d, i) => (
                                                                            <li
                                                                                key={i}
                                                                                className="text-sm text-muted-foreground flex items-start gap-2"
                                                                            >
                                                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                                                {d}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                {/* Resources */}
                                                                {task.resources &&
                                                                    task.resources.length > 0 && (
                                                                        <div>
                                                                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                                                <BookOpen className="w-4 h-4 text-primary" />
                                                                                Resources
                                                                            </h4>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {task.resources.map(
                                                                                    (r, i) => (
                                                                                        <a
                                                                                            key={i}
                                                                                            href={r}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 text-xs text-muted-foreground hover:text-primary transition-colors"
                                                                                        >
                                                                                            <ExternalLink className="w-3 h-3" />
                                                                                            {new URL(r).hostname.replace(
                                                                                                "www.",
                                                                                                ""
                                                                                            )}
                                                                                        </a>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                {/* Status actions */}
                                                                <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                                                                    <span className="text-sm font-medium text-foreground">
                                                                        Update status:
                                                                    </span>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                updateTaskStatus(
                                                                                    task.id,
                                                                                    "not_started"
                                                                                )
                                                                            }
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${status === "not_started"
                                                                                ? "bg-muted text-foreground ring-2 ring-border"
                                                                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                                                                }`}
                                                                        >
                                                                            Not Started
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                updateTaskStatus(
                                                                                    task.id,
                                                                                    "in_progress"
                                                                                )
                                                                            }
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${status === "in_progress"
                                                                                ? "bg-amber-100 text-amber-700 ring-2 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-800"
                                                                                : "bg-muted/50 text-muted-foreground hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                                                                                }`}
                                                                        >
                                                                            In Progress
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                updateTaskStatus(
                                                                                    task.id,
                                                                                    "completed"
                                                                                )
                                                                            }
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${status === "completed"
                                                                                ? "bg-green-100 text-green-700 ring-2 ring-green-200 dark:bg-green-950/50 dark:text-green-400 dark:ring-green-800"
                                                                                : "bg-muted/50 text-muted-foreground hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/30"
                                                                                }`}
                                                                        >
                                                                            Completed
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Certificate section ─────────────────────────────── */}
                            {certificate && (
                                <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 shadow-lg relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(258, 85%, 62%) 0%, transparent 70%)' }} />

                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shrink-0">
                                                <Award className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-display text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                    🎓 Your Certificate is Ready!
                                                </h3>
                                                <p className="text-muted-foreground text-sm mb-3">
                                                    Congratulations! You have successfully passed and qualified.
                                                </p>
                                                <div className="space-y-1.5 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">Certificate:</span>
                                                        <span className="font-mono font-bold text-primary">{certificate.certificate_number}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">Track:</span>
                                                        <span className="font-medium text-foreground">{certificate.internship_title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">Issued:</span>
                                                        <span className="font-medium text-foreground">
                                                            {new Date(certificate.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 shrink-0">
                                            <a
                                                href={`/verify?cert=${certificate.certificate_number}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg hover:opacity-90 transition-all text-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Certificate
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Submit tasks section ──────────────────────────────── */}
                            {hasSubmitted ? (
                                <div className="bg-card border border-green-200 dark:border-green-800 rounded-2xl p-8 shadow-sm text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/50 mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                        Tasks Submitted Successfully!
                                    </h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        {certificate
                                            ? <>Your certificate is ready! Use the download button above to get your official certificate.</>
                                            : <>Your task completion has been recorded. Our team will review your submission and send your certificate to{" "}<strong>{session.email}</strong> shortly.</>
                                        }
                                    </p>
                                </div>
                            ) : !submissionOpen ? (
                                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                                                <Send className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-display text-lg font-bold text-foreground">
                                                    Ready to Submit?
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {allTasksCompleted
                                                        ? "Great job! All tasks are completed. Submit your work for review."
                                                        : "Complete all tasks and submit your work for review."}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setSubmissionOpen(true)}
                                            className="bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 transition-all font-semibold"
                                            disabled={!allTasksCompleted && tasks.length > 0}
                                        >
                                            Submit Tasks{" "}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>

                                    {!allTasksCompleted && tasks.length > 0 && (
                                        <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                                You need to mark all tasks as "Completed" before
                                                you can submit. Currently{" "}
                                                <strong>
                                                    {completedCount}/{tasks.length}
                                                </strong>{" "}
                                                tasks are completed.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── Submission form ── */
                                <div className="bg-card border border-primary/30 rounded-2xl p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                                            <Send className="w-5 h-5 text-primary" />
                                            Submit Your Work
                                        </h3>
                                        <button
                                            onClick={() => setSubmissionOpen(false)}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Intern info banner */}
                                    <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                        <div>
                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                {session.full_name}
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                Track:{" "}
                                                <strong>{session.track}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* GitHub URL */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="github_sub"
                                                className="flex items-center gap-1.5"
                                            >
                                                <Github className="w-4 h-4" />
                                                GitHub Repository URL{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="github_sub"
                                                placeholder="https://github.com/username/project"
                                                value={formData.github_submission_url}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        github_submission_url: e.target.value,
                                                    });
                                                    if (fieldErrors.github_submission_url) {
                                                        setFieldErrors({
                                                            ...fieldErrors,
                                                            github_submission_url: "",
                                                        });
                                                    }
                                                }}
                                                className={
                                                    fieldErrors.github_submission_url
                                                        ? "border-red-400 focus-visible:ring-red-400"
                                                        : ""
                                                }
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
                                            <Label
                                                htmlFor="linkedin_sub"
                                                className="flex items-center gap-1.5"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                                LinkedIn Post URL{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="linkedin_sub"
                                                placeholder="https://www.linkedin.com/posts/..."
                                                value={formData.linkedin_post_url}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        linkedin_post_url: e.target.value,
                                                    });
                                                    if (fieldErrors.linkedin_post_url) {
                                                        setFieldErrors({
                                                            ...fieldErrors,
                                                            linkedin_post_url: "",
                                                        });
                                                    }
                                                }}
                                                className={
                                                    fieldErrors.linkedin_post_url
                                                        ? "border-red-400 focus-visible:ring-red-400"
                                                        : ""
                                                }
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
                                            <Label htmlFor="sub_notes">
                                                Notes / Comments (Optional)
                                            </Label>
                                            <Textarea
                                                id="sub_notes"
                                                placeholder="Describe what you built, challenges you faced, or anything you'd like to share..."
                                                className="h-28"
                                                value={formData.submission_notes}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        submission_notes: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Disclaimer */}
                                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                                By submitting, you confirm that you have completed
                                                all the required tasks for the{" "}
                                                <strong>{session.track}</strong> internship track.
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90 transition-all font-semibold text-base"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    Confirm Task Completion{" "}
                                                    <Send className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default InternPortal;
