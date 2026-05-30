
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    Send,
    Briefcase,
    Code,
    Database,
    Globe,
    Shield,
    Smartphone,
    Palette,
    Cloud,
    Gamepad,
    Cpu,
    CheckCircle2,
    PartyPopper,
    Clock,
    Mail,
} from "lucide-react";

export const internshipTracks = [
    {
        id: "frontend",
        title: "Frontend Development",
        icon: Globe,
        description: "Build modern, responsive web interfaces with React and Tailwind CSS.",
    },
    {
        id: "backend",
        title: "Backend Development",
        icon: Database,
        description: "Design robust APIs and database architectures with Node.js and Python.",
    },
    {
        id: "fullstack",
        title: "Full Stack Development",
        icon: Code,
        description: "Master both client-side and server-side technologies.",
    },
    {
        id: "mobile",
        title: "Mobile App Development",
        icon: Smartphone,
        description: "Create native and cross-platform mobile applications.",
    },
    {
        id: "cybersecurity",
        title: "Cybersecurity",
        icon: Shield,
        description: "Learn to protect systems and networks from cyber threats.",
    },
    {
        id: "uiux",
        title: "UI/UX Design",
        icon: Palette,
        description: "Design intuitive and beautiful user experiences.",
    },
    {
        id: "datascience",
        title: "Data Science & AI",
        icon: Database,
        description: "Analyze data and build machine learning models to solve complex problems.",
    },
    {
        id: "devops",
        title: "DevOps & Cloud",
        icon: Cloud,
        description: "Master cloud infrastructure (AWS/Azure) and CI/CD pipelines.",
    },
    {
        id: "gamedev",
        title: "Game Development",
        icon: Gamepad,
        description: "Create immersive gaming experiences using Unity or Unreal Engine.",
    },
    {
        id: "embedded",
        title: "Embedded Systems",
        icon: Cpu,
        description: "Program microcontrollers and build IoT devices.",
    },
];

/* ─── localStorage key for persisting submitted email ─── */
const LS_KEY = "xycode_applied_email";

/* ─── Success Widget ─── */
const SuccessWidget = ({ email, track }: { email: string; track: string }) => (
    <div className="bg-card border border-border rounded-xl p-10 shadow-lg text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Icon */}
        <div className="flex justify-center">
            <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
            </div>
        </div>

        {/* Heading */}
        <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <PartyPopper className="w-6 h-6 text-primary" />
                Application Submitted!
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
                Your application for the <strong className="text-foreground">{track}</strong> track has been received.
                We'll review it and get back to you soon.
            </p>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Confirmation sent to</p>
                    <p className="text-sm font-medium text-foreground break-all">{email}</p>
                </div>
            </div>
            <div className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Response time</p>
                    <p className="text-sm font-medium text-foreground">Within 3–5 business days</p>
                </div>
            </div>
        </div>

        <p className="text-xs text-muted-foreground">
            Already applied? You cannot submit another application with the same email or phone number.
        </p>
    </div>
);

/* ─── Main Component ─── */
const Internships = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    /* ── Per-field validation errors ── */
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (data: typeof formData): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.full_name.trim()) e.full_name = "Full name is required.";
        if (!data.email.trim()) {
            e.email = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            e.email = "Please enter a valid email address.";
        }
        if (!data.phone.trim()) {
            e.phone = "Phone number is required.";
        } else if (!/^[\d\s\-\+\(\)]{7,20}$/.test(data.phone.trim())) {
            e.phone = "Please enter a valid phone number.";
        }
        if (!data.track) e.track = "Please select a track.";
        if (data.github_url && !/^https?:\/\/.+/.test(data.github_url.trim())) {
            e.github_url = "GitHub URL must start with http:// or https://";
        }
        if (data.portfolio_url && !/^https?:\/\/.+/.test(data.portfolio_url.trim())) {
            e.portfolio_url = "Portfolio URL must start with http:// or https://";
        }
        return e;
    };

    const clearError = (field: string) =>
        setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

    /* ── Success state: persisted in localStorage + verified against DB ── */
    const [submitted, setSubmitted] = useState<{ email: string; track: string } | null>(null);
    const checkedRef = useRef(false);

    useEffect(() => {
        if (checkedRef.current) return;
        checkedRef.current = true;

        const cached = localStorage.getItem(LS_KEY);
        if (!cached) return;

        try {
            const { email, track } = JSON.parse(cached) as { email: string; track: string };
            // Verify the application still exists in DB (handles edge cases like admin deletion)
            supabase
                .from("internship_applications")
                .select("id, track")
                .eq("email", email)
                .limit(1)
                .then(({ data }) => {
                    if (data && data.length > 0) {
                        setSubmitted({ email, track: data[0].track || track });
                    } else {
                        // Application was deleted — clear the cache
                        localStorage.removeItem(LS_KEY);
                    }
                });
        } catch {
            localStorage.removeItem(LS_KEY);
        }
    }, []);

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
            }
        }
    }, [location]);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        university: "",
        track: "",
        github_url: "",
        portfolio_url: "",
        motivation: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Scroll to first error
            const firstField = Object.keys(validationErrors)[0];
            document.getElementById(firstField)?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setErrors({});
        setLoading(true);

        try {
            // Duplicate check
            const { data: existing, error: checkError } = await supabase
                .from("internship_applications")
                .select("id, email, phone, track")
                .or(`email.eq.${formData.email},phone.eq.${formData.phone}`)
                .limit(1);

            if (checkError) throw checkError;

            if (existing && existing.length > 0) {
                const match = existing[0];
                const reason = match.email === formData.email ? "email address" : "phone number";

                // If it's the same person's email, show success widget instead of error
                if (match.email === formData.email) {
                    const payload = { email: formData.email, track: match.track || formData.track };
                    localStorage.setItem(LS_KEY, JSON.stringify(payload));
                    setSubmitted(payload);
                    setLoading(false);
                    return;
                }

                toast({
                    title: "Already Applied",
                    description: `An application already exists with this ${reason}. We will review it and get back to you soon.`,
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const { error } = await supabase.from("internship_applications").insert([{
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                university: formData.university,
                track: formData.track,
                github_url: formData.github_url,
                portfolio_url: formData.portfolio_url,
                motivation: formData.motivation,
                status: "pending",
            }]);

            if (error) throw error;

            // Persist success state
            const payload = { email: formData.email, track: formData.track };
            localStorage.setItem(LS_KEY, JSON.stringify(payload));
            setSubmitted(payload);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
                    Join Our <span className="text-gradient-primary">Internship Program</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                    Accelerate your career with hands-on experience, mentorship, and real-world projects. Choose your track and start building the future.
                </p>
                <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white shadow-glow"
                    onClick={() => document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                    Apply Now <Briefcase className="ml-2 w-4 h-4" />
                </Button>
            </section>

            {/* Tracks Grid */}
            <section className="container mx-auto px-4 mb-24">
                <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
                    Available Tracks
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {internshipTracks.map((track) => (
                        <div
                            key={track.id}
                            className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <track.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-foreground mb-2">{track.title}</h3>
                            <p className="text-muted-foreground text-sm">{track.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Application Form / Success Widget */}
            <section id="apply-form" className="container mx-auto px-4 max-w-3xl mb-20">
                {submitted ? (
                    <SuccessWidget email={submitted.email} track={submitted.track} />
                ) : (
                    <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Apply Now</h2>
                            <p className="text-muted-foreground">
                                Fill out the form below to kickstart your journey with XY CODE.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="full_name"
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={(e) => { setFormData({ ...formData, full_name: e.target.value }); clearError("full_name"); }}
                                        className={errors.full_name ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearError("email"); }}
                                        className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="phone"
                                        placeholder="+20 100 000 0000"
                                        value={formData.phone}
                                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearError("phone"); }}
                                        className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="university">University / Institute</Label>
                                    <Input
                                        id="university"
                                        placeholder="University Name"
                                        value={formData.university}
                                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="track">Preferred Track <span className="text-destructive">*</span></Label>
                                <Select
                                    onValueChange={(value) => { setFormData({ ...formData, track: value }); clearError("track"); }}
                                    value={formData.track}
                                >
                                    <SelectTrigger className={errors.track ? "border-destructive focus:ring-destructive" : ""}>
                                        <SelectValue placeholder="Select a track" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {internshipTracks.map((track) => (
                                            <SelectItem key={track.id} value={track.title}>
                                                {track.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.track && <p className="text-xs text-destructive mt-1">{errors.track}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="github_url">GitHub Profile <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                    <Input
                                        id="github_url"
                                        placeholder="https://github.com/username"
                                        value={formData.github_url}
                                        onChange={(e) => { setFormData({ ...formData, github_url: e.target.value }); clearError("github_url"); }}
                                        className={errors.github_url ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.github_url && <p className="text-xs text-destructive mt-1">{errors.github_url}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio_url">Portfolio URL <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                    <Input
                                        id="portfolio_url"
                                        placeholder="https://john.design"
                                        value={formData.portfolio_url}
                                        onChange={(e) => { setFormData({ ...formData, portfolio_url: e.target.value }); clearError("portfolio_url"); }}
                                        className={errors.portfolio_url ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.portfolio_url && <p className="text-xs text-destructive mt-1">{errors.portfolio_url}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivation">Why do you want to join us?</Label>
                                <Textarea
                                    id="motivation"
                                    placeholder="Tell us about your goals and what you hope to achieve..."
                                    className="h-32"
                                    value={formData.motivation}
                                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    type="submit"
                                    className="w-full md:w-auto min-w-[200px] bg-primary hover:bg-primary/90 text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                                    ) : (
                                        <>Submit Application <Send className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Internships;
