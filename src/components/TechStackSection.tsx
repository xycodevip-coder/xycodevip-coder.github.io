import { Code2, Database, Globe, Server, Cloud, Shield } from "lucide-react";

const technologies = [
    { name: "React", icon: Code2, color: "text-cyan-500 dark:text-cyan-400", bg: "from-cyan-500/15 to-cyan-500/5", border: "hover:border-cyan-400/40" },
    { name: "Node.js", icon: Server, color: "text-emerald-600 dark:text-emerald-400", bg: "from-emerald-500/15 to-emerald-500/5", border: "hover:border-emerald-400/40" },
    { name: "Python", icon: Database, color: "text-blue-500 dark:text-blue-400", bg: "from-blue-500/15 to-blue-500/5", border: "hover:border-blue-400/40" },
    { name: "AWS", icon: Cloud, color: "text-orange-500 dark:text-orange-400", bg: "from-orange-500/15 to-orange-500/5", border: "hover:border-orange-400/40" },
    { name: "Security", icon: Shield, color: "text-rose-500 dark:text-rose-400", bg: "from-rose-500/15 to-rose-500/5", border: "hover:border-rose-400/40" },
    { name: "Global", icon: Globe, color: "text-violet-500 dark:text-violet-400", bg: "from-violet-500/15 to-violet-500/5", border: "hover:border-violet-400/40" },
];

const TechStackSection = () => {
    return (
        <section id="techstack" className="relative py-28 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />
            <div
                className="absolute top-0 left-0 right-0 h-px opacity-20"
                style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
            />

            <div className="relative container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 badge-glass text-secondary mb-6">
                        <span>Our Technology</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Built With{" "}
                        <span className="text-gradient-primary">Modern Tech</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        We leverage the latest technologies to build scalable, secure, and high-performance
                        solutions for our global clients.
                    </p>
                </div>

                {/* Tech Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {technologies.map((tech) => (
                        <div
                            key={tech.name}
                            className={`glass-card flex flex-col items-center justify-center p-6 group cursor-default border border-border/50 transition-all duration-300 ${tech.border} hover:-translate-y-1`}
                        >
                            {/* Icon container */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <tech.icon className={`w-8 h-8 ${tech.color}`} />
                            </div>
                            <span className="font-display font-semibold text-foreground text-sm">{tech.name}</span>
                        </div>
                    ))}
                </div>

                {/* Bottom banner */}
                <div className="mt-16 glass-card border border-border/50 overflow-hidden">
                    <div className="p-8 md:p-10 text-center relative">
                        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase mb-3">
                            Trusted by teams worldwide
                        </p>
                        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                            We stay ahead of the{" "}
                            <span className="text-gradient-primary">technology curve</span>
                        </h3>
                        <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
                            Our engineers continuously upskill and adopt emerging technologies to deliver
                            future-proof solutions that scale with your business.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
