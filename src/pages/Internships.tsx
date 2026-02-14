
import { useState, useEffect } from "react";
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

const Internships = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
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
        setLoading(true);

        try {
            const { error } = await supabase.from("internship_applications").insert([
                {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    university: formData.university,
                    track: formData.track,
                    github_url: formData.github_url,
                    portfolio_url: formData.portfolio_url,
                    motivation: formData.motivation,
                    status: "pending",
                },
            ]);

            if (error) throw error;

            toast({
                title: "Application Submitted!",
                description: "We've received your application and will get back to you soon.",
            });

            setFormData({
                full_name: "",
                email: "",
                phone: "",
                university: "",
                track: "",
                github_url: "",
                portfolio_url: "",
                motivation: "",
            });
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
                            <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                {track.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">{track.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Application Form */}
            <section id="apply-form" className="container mx-auto px-4 max-w-3xl mb-20">
                <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                    <div className="text-center mb-8">
                        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Apply Now</h2>
                        <p className="text-muted-foreground">
                            Fill out the form below to kickstart your journey with XY CODE.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    required
                                    placeholder="John Doe"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    required
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
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
                            <Label htmlFor="track">Preferred Track</Label>
                            <Select
                                required
                                onValueChange={(value) => setFormData({ ...formData, track: value })}
                                value={formData.track}
                            >
                                <SelectTrigger>
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
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub Profile (Optional)</Label>
                                <Input
                                    id="github"
                                    placeholder="https://github.com/username"
                                    value={formData.github_url}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
                                <Input
                                    id="portfolio"
                                    placeholder="https://john.design"
                                    value={formData.portfolio_url}
                                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                />
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
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Internships;
