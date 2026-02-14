import { Code2, Database, Globe, Server, Cloud, Shield } from "lucide-react";

const technologies = [
    { name: "React", icon: Code2 },
    { name: "Node.js", icon: Server },
    { name: "Python", icon: Database },
    { name: "AWS", icon: Cloud },
    { name: "Security", icon: Shield },
    { name: "Global", icon: Globe },
];

const TechStackSection = () => {
    return (
        <section className="py-24 bg-card border-t border-border">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Our Technology</p>
                    <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                        Built With Modern Tech
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We leverage the latest technologies to build scalable, secure, and high-performance solutions for our global clients.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {technologies.map((tech) => (
                        <div key={tech.name} className="flex flex-col items-center justify-center p-6 bg-background rounded-lg border border-border hover:border-primary transition-all group">
                            <tech.icon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                            <span className="font-display font-semibold text-foreground">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
